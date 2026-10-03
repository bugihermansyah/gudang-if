<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StorageRow;
use App\Models\Valet;
use App\Models\ValetStock;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('dashboard', [
            'summary' => [
                'active_products' => Product::query()->where('active', true)->count(),
                'active_rows' => StorageRow::query()->where('active', true)->count(),
                'active_valets' => Valet::query()->where('status', 'aktif')->count(),
                'physical_cartons' => (int) ValetStock::query()->sum('qty_on_hand'),
                'reserved_cartons' => (int) ValetStock::query()->sum('qty_reserved'),
                'held_cartons' => (int) ValetStock::query()->sum('qty_held'),
            ],
        ]);
    }
}
