<?php

namespace Tests\Feature\MasterData;

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

class ProductManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_a_product_and_code_is_normalized(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);

        $response = $this->actingAs($admin)->post(route('master.products.store'), [
            'sku' => ' ciki-a ',
            'name' => 'Ciki A',
            'max_cartons_per_valet' => 32,
            'carton_size_note' => 'Karton besar',
        ]);

        $response->assertRedirect(route('master.products.index'));
        $this->assertDatabaseHas('products', [
            'sku' => 'CIKI-A',
            'name' => 'Ciki A',
            'max_cartons_per_valet' => 32,
            'active' => true,
        ]);
    }

    public function test_admin_can_read_search_filter_and_paginate_products(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);

        foreach (range(1, 16) as $index) {
            Product::query()->create([
                'sku' => sprintf('SKU-%02d', $index),
                'name' => sprintf('Produk %02d', $index),
                'max_cartons_per_valet' => 40,
                'active' => $index !== 16,
            ]);
        }

        $this->actingAs($admin)
            ->get(route('master.products.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('master/products/index')
                ->has('products.data', 15)
                ->where('products.total', 16)
                ->where('products.last_page', 2));

        $this->actingAs($admin)
            ->get(route('master.products.index', [
                'search' => 'SKU-16',
                'status' => 'inactive',
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('products.data', 1)
                ->where('products.data.0.sku', 'SKU-16')
                ->where('filters.search', 'SKU-16')
                ->where('filters.status', 'inactive'));
    }

    public function test_admin_can_update_a_product(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $product = Product::query()->create([
            'sku' => 'OLD-SKU',
            'name' => 'Nama Lama',
            'max_cartons_per_valet' => 32,
            'active' => true,
        ]);

        $this->actingAs($admin)
            ->put(route('master.products.update', $product), [
                'sku' => ' new-sku ',
                'name' => 'Nama Baru',
                'max_cartons_per_valet' => 48,
                'carton_size_note' => 'Karton sedang',
            ])
            ->assertRedirect(route('master.products.index'));

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'sku' => 'NEW-SKU',
            'name' => 'Nama Baru',
            'max_cartons_per_valet' => 48,
        ]);
    }

    public function test_admin_can_toggle_product_status_instead_of_deleting_master_data(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $product = Product::query()->create([
            'sku' => 'STATUS-01',
            'name' => 'Produk Status',
            'max_cartons_per_valet' => 24,
            'active' => true,
        ]);

        $this->actingAs($admin)
            ->patch(route('master.products.status', $product), [
                'active' => false,
            ])
            ->assertRedirect();

        $this->assertFalse($product->refresh()->active);
    }

    public function test_admin_can_manage_company_and_row_master_data(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);

        $this->actingAs($admin)
            ->post(route('master.companies.store'), [
                'code' => ' pt-asal ',
                'name' => 'PT Asal Sejahtera',
            ])
            ->assertRedirect(route('master.companies.index'));

        $this->assertDatabaseHas('companies', [
            'code' => 'PT-ASAL',
            'name' => 'PT Asal Sejahtera',
        ]);

        $this->actingAs($admin)
            ->post(route('master.rows.store'), [
                'code' => ' row-a01 ',
                'name' => 'Area A 01',
            ])
            ->assertRedirect(route('master.rows.index'));

        $this->assertDatabaseHas('rows', [
            'code' => 'ROW-A01',
            'name' => 'Area A 01',
        ]);
    }

    public function test_valet_must_use_an_active_row_and_row_cannot_be_retired_while_occupied(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $activeRow = StorageRow::query()->create([
            'code' => 'ROW-A01',
            'name' => 'Area A 01',
            'active' => true,
        ]);
        $inactiveRow = StorageRow::query()->create([
            'code' => 'ROW-B01',
            'name' => 'Area B 01',
            'active' => false,
        ]);

        $this->actingAs($admin)
            ->post(route('master.valets.store'), [
                'code' => 'VAL-001',
                'row_id' => $inactiveRow->id,
                'status' => 'aktif',
            ])
            ->assertSessionHasErrors('row_id');

        $this->actingAs($admin)
            ->post(route('master.valets.store'), [
                'code' => 'VAL-001',
                'row_id' => $activeRow->id,
                'status' => 'aktif',
            ])
            ->assertRedirect(route('master.valets.index'));

        $this->actingAs($admin)
            ->patch(route('master.rows.status', $activeRow), ['active' => false])
            ->assertSessionHasErrors('active');

        $this->assertTrue($activeRow->refresh()->active);
        $this->assertDatabaseHas('valets', [
            'code' => 'VAL-001',
            'row_id' => $activeRow->id,
        ]);
    }

    public function test_non_admin_cannot_manage_company_row_or_valet_master_data(): void
    {
        $officer = User::factory()->create(['role' => UserRole::WarehouseOfficer]);

        foreach (['master.companies.index', 'master.rows.index', 'master.valets.index'] as $routeName) {
            $this->actingAs($officer)->get(route($routeName))->assertForbidden();
        }
    }

    public function test_warehouse_officer_cannot_manage_product_master(): void
    {
        $officer = User::factory()->create([
            'role' => UserRole::WarehouseOfficer,
        ]);

        $this->actingAs($officer)
            ->get(route('master.products.index'))
            ->assertForbidden();
    }

    public function test_product_capacity_cannot_make_an_existing_mixed_valet_overfull(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $productA = Product::query()->create([
            'sku' => 'A',
            'name' => 'Produk A',
            'max_cartons_per_valet' => 32,
            'active' => true,
        ]);
        $productB = Product::query()->create([
            'sku' => 'B',
            'name' => 'Produk B',
            'max_cartons_per_valet' => 48,
            'active' => true,
        ]);
        $row = StorageRow::query()->create([
            'code' => 'ROW-A01',
            'name' => 'Row A01',
            'active' => true,
        ]);
        $valet = Valet::query()->create([
            'code' => 'VAL-001',
            'row_id' => $row->id,
        ]);
        $batchA = Batch::query()->create([
            'product_id' => $productA->id,
            'batch_no' => 'A-01',
            'expires_on' => '2027-12-31',
        ]);
        $batchB = Batch::query()->create([
            'product_id' => $productB->id,
            'batch_no' => 'B-01',
            'expires_on' => '2027-12-31',
        ]);

        ValetStock::query()->create([
            'valet_id' => $valet->id,
            'product_id' => $productA->id,
            'batch_id' => $batchA->id,
            'qty_on_hand' => 16,
        ]);
        ValetStock::query()->create([
            'valet_id' => $valet->id,
            'product_id' => $productB->id,
            'batch_id' => $batchB->id,
            'qty_on_hand' => 24,
        ]);

        $response = $this->actingAs($admin)
            ->from(route('master.products.edit', $productA))
            ->put(route('master.products.update', $productA), [
                'sku' => $productA->sku,
                'name' => $productA->name,
                'max_cartons_per_valet' => 31,
                'carton_size_note' => null,
            ]);

        $response
            ->assertRedirect(route('master.products.edit', $productA))
            ->assertSessionHasErrors('max_cartons_per_valet');
        $this->assertSame(32, $productA->refresh()->max_cartons_per_valet);
    }

    public function test_public_registration_is_disabled(): void
    {
        $this->get('/register')->assertNotFound();
        $this->post('/register', [
            'name' => 'Unauthorized User',
            'email' => 'unauthorized@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertNotFound();
    }
}
