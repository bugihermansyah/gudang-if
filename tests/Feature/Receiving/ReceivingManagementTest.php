<?php

namespace Tests\Feature\Receiving;

use App\Enums\BatchStatus;
use App\Enums\ReceivingStatus;
use App\Enums\UserRole;
use App\Models\Batch;
use App\Models\Company;
use App\Models\Product;
use App\Models\ReceivingDocument;
use App\Models\StorageRow;
use App\Models\User;
use App\Models\Valet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReceivingManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_warehouse_officer_can_create_a_receiving_draft_without_changing_stock(): void
    {
        [$officer, $company, $product, $valet] = $this->fixtures();

        $response = $this->actingAs($officer)->post(route('receiving.store'), $this->payload($company, $product, $valet));

        $document = ReceivingDocument::query()->firstOrFail();
        $response->assertRedirect(route('receiving.show', $document));
        $this->assertSame(ReceivingStatus::Draft, $document->status);
        $this->assertDatabaseHas('receiving_lines', [
            'receiving_document_id' => $document->id,
            'qty_delivery_note' => 10,
            'qty_physical' => 8,
        ]);
        $this->assertDatabaseHas('batches', [
            'product_id' => $product->id,
            'batch_no' => 'LOT-01',
            'expires_on' => '2027-12-31 00:00:00',
        ]);
        $this->assertDatabaseCount('valet_stocks', 0);
        $this->assertDatabaseCount('stock_movements', 0);
    }

    public function test_receiving_progression_finalizes_stock_atomically_and_holds_expired_batch(): void
    {
        [$officer, $company, $product, $valet] = $this->fixtures();
        $payload = $this->payload($company, $product, $valet);
        $payload['lines'][0]['qty_delivery_note'] = 2;
        $payload['lines'][0]['qty_physical'] = 2;
        $payload['lines'][0]['expires_on'] = now()->subDay()->toDateString();
        $payload['lines'][0]['allocations'][0]['qty'] = 2;

        $this->actingAs($officer)->post(route('receiving.store'), $payload);
        $document = ReceivingDocument::query()->firstOrFail();

        $this->actingAs($officer)->patch(route('receiving.start', $document))->assertRedirect();
        $this->actingAs($officer)->patch(route('receiving.finish', $document))->assertRedirect();
        $this->assertSame(ReceivingStatus::ReadyToFinalize, $document->refresh()->status);

        $finalizationPayload = ['finalization_key' => $document->refresh()->finalization_key];
        $this->actingAs($officer)
            ->patch(route('receiving.finalize', $document), $finalizationPayload)
            ->assertRedirect();

        $this->assertSame(ReceivingStatus::Completed, $document->refresh()->status);
        $this->assertDatabaseHas('valet_stocks', [
            'valet_id' => $valet->id,
            'product_id' => $product->id,
            'qty_on_hand' => 2,
            'qty_held' => 2,
        ]);
        $this->assertDatabaseHas('stock_movements', [
            'receiving_document_id' => $document->id,
            'qty_delta' => 2,
            'movement_type' => 'receiving',
        ]);

        $this->actingAs($officer)
            ->patch(route('receiving.finalize', $document), $finalizationPayload)
            ->assertRedirect();
        $this->assertDatabaseCount('stock_movements', 1);
        $this->assertDatabaseHas('valet_stocks', [
            'valet_id' => $valet->id,
            'product_id' => $product->id,
            'qty_on_hand' => 2,
            'qty_held' => 2,
        ]);
    }

    public function test_receiving_rejects_capacity_overflow_and_missing_discrepancy_reason(): void
    {
        [$officer, $company, $product, $valet] = $this->fixtures(maxCartons: 8);
        $payload = $this->payload($company, $product, $valet);
        $payload['lines'][0]['qty_delivery_note'] = 10;
        $payload['lines'][0]['qty_physical'] = 8;
        $payload['lines'][0]['discrepancy_reason'] = null;

        $this->actingAs($officer)
            ->post(route('receiving.store'), $payload)
            ->assertSessionHasErrors('lines.0.discrepancy_reason');
        $this->assertDatabaseCount('receiving_documents', 0);

        $payload['lines'][0]['discrepancy_reason'] = 'Dua karton tidak ada di truk.';
        $payload['lines'][0]['qty_physical'] = 9;
        $payload['lines'][0]['allocations'][0]['qty'] = 9;
        $this->actingAs($officer)
            ->post(route('receiving.store'), $payload)
            ->assertStatus(422);
        $this->assertDatabaseCount('receiving_documents', 0);
    }

    public function test_duplicate_batch_with_a_different_expiry_is_blocked(): void
    {
        [$officer, $company, $product, $valet] = $this->fixtures();
        Batch::query()->create([
            'product_id' => $product->id,
            'batch_no' => 'LOT-01',
            'expires_on' => '2027-12-31',
        ]);
        $payload = $this->payload($company, $product, $valet);
        $payload['lines'][0]['expires_on'] = '2028-01-01';

        $this->actingAs($officer)
            ->post(route('receiving.store'), $payload)
            ->assertSessionHasErrors('lines.0.expires_on');
        $this->assertDatabaseCount('receiving_documents', 0);
    }

    public function test_operator_can_mark_a_questionable_batch_and_finalization_holds_it(): void
    {
        [$officer, $company, $product, $valet] = $this->fixtures();

        $this->actingAs($officer)->post(route('receiving.store'), $this->payload($company, $product, $valet));
        $document = ReceivingDocument::query()->firstOrFail();
        $line = $document->lines()->firstOrFail();

        $this->actingAs($officer)
            ->patch(route('receiving.lines.hold', [$document, $line]), ['reason' => ''])
            ->assertSessionHasErrors('reason');

        $this->actingAs($officer)
            ->patch(route('receiving.lines.hold', [$document, $line]), [
                'reason' => 'Label tanggal kedaluwarsa buram.',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('batches', [
            'id' => $line->batch_id,
            'status' => BatchStatus::Questionable->value,
            'hold_reason' => 'Label tanggal kedaluwarsa buram.',
            'held_by' => $officer->id,
        ]);

        $this->actingAs($officer)->patch(route('receiving.start', $document))->assertRedirect();
        $this->actingAs($officer)->patch(route('receiving.finish', $document))->assertRedirect();
        $this->actingAs($officer)
            ->patch(route('receiving.finalize', $document), [
                'finalization_key' => $document->refresh()->finalization_key,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('valet_stocks', [
            'valet_id' => $valet->id,
            'product_id' => $product->id,
            'batch_id' => $line->batch_id,
            'qty_on_hand' => 8,
            'qty_held' => 8,
        ]);
    }

    /** @return array{0:User, 1:Company, 2:Product, 3:Valet} */
    private function fixtures(int $maxCartons = 32): array
    {
        $officer = User::factory()->create(['role' => UserRole::WarehouseOfficer]);
        $company = Company::query()->create([
            'code' => 'PT-ASAL',
            'name' => 'PT Asal Sejahtera',
            'active' => true,
        ]);
        $product = Product::query()->create([
            'sku' => 'CIKI-A',
            'name' => 'Ciki A',
            'max_cartons_per_valet' => $maxCartons,
            'active' => true,
        ]);
        $row = StorageRow::query()->create([
            'code' => 'ROW-A01',
            'name' => 'Area A 01',
            'active' => true,
        ]);
        $valet = Valet::query()->create([
            'code' => 'VAL-001',
            'row_id' => $row->id,
        ]);

        return [$officer, $company, $product, $valet];
    }

    /** @return array<string, mixed> */
    private function payload(Company $company, Product $product, Valet $valet): array
    {
        return [
            'external_delivery_note_no' => 'SJ-0001',
            'company_id' => $company->id,
            'vehicle_plate' => 'B 1234 CD',
            'driver_name' => 'Budi',
            'lines' => [[
                'product_id' => $product->id,
                'batch_no' => 'lot-01',
                'expires_on' => '2027-12-31',
                'qty_delivery_note' => 10,
                'qty_physical' => 8,
                'discrepancy_reason' => 'Selisih hitung saat bongkar.',
                'allocations' => [[
                    'valet_id' => $valet->id,
                    'qty' => 8,
                ]],
            ]],
        ];
    }
}
