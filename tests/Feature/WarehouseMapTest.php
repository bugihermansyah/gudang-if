<?php

namespace Tests\Feature;

use App\Enums\BatchStatus;
use App\Enums\UserRole;
use App\Models\Batch;
use App\Models\Product;
use App\Models\StorageRow;
use App\Models\User;
use App\Models\Valet;
use App\Models\ValetStock;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class WarehouseMapTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_operator_can_view_rows_valets_and_stock_details(): void
    {
        $operator = User::factory()->create(['role' => UserRole::WarehouseOfficer]);
        $product = Product::query()->create([
            'sku' => 'CIKI-A',
            'name' => 'Ciki A',
            'max_cartons_per_valet' => 32,
            'active' => true,
        ]);
        $row = StorageRow::query()->create([
            'code' => 'ROW-A01',
            'name' => 'Area A 01',
            'active' => true,
        ]);
        $occupiedValet = Valet::query()->create(['code' => 'V-0001', 'row_id' => $row->id]);
        Valet::query()->create(['code' => 'V-0002', 'row_id' => $row->id]);
        $batch = Batch::query()->create([
            'product_id' => $product->id,
            'batch_no' => 'LOT-01',
            'expires_on' => now()->addDays(14)->toDateString(),
            'status' => BatchStatus::Active,
        ]);
        ValetStock::query()->create([
            'valet_id' => $occupiedValet->id,
            'product_id' => $product->id,
            'batch_id' => $batch->id,
            'qty_on_hand' => 8,
            'qty_reserved' => 2,
            'qty_held' => 0,
        ]);

        $this->actingAs($operator)
            ->get(route('warehouse-map'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('warehouse-map/index')
                ->where('summary.active_rows', 1)
                ->where('summary.active_valets', 2)
                ->where('summary.physical_cartons', 8)
                ->where('summary.reserved_cartons', 2)
                ->has('rows', 1)
                ->has('rows.0.valets', 2)
                ->where('rows.0.valets.0.code', 'V-0001')
                ->where('rows.0.valets.0.physical_cartons', 8)
                ->where('rows.0.valets.0.available_cartons', 6)
                ->where('rows.0.valets.0.utilization_percent', 25)
                ->where('rows.0.valets.0.stocks.0.batch.batch_no', 'LOT-01')
                ->where('rows.0.valets.0.stocks.0.batch.expiry_state', 'soon')
            );
    }
}
