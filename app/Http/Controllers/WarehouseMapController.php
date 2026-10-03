<?php

namespace App\Http\Controllers;

use App\Enums\BatchStatus;
use App\Enums\ValetStatus;
use App\Models\StorageRow;
use App\Models\Valet;
use Brick\Math\BigRational;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class WarehouseMapController extends Controller
{
    public function __invoke(): Response
    {
        $rows = StorageRow::query()
            ->where('active', true)
            ->with([
                'valets' => fn ($query) => $query
                    ->where('status', ValetStatus::Active)
                    ->orderBy('code')
                    ->with([
                        'stocks' => fn ($stocks) => $stocks
                            ->where('qty_on_hand', '>', 0)
                            ->with([
                                'product:id,sku,name,max_cartons_per_valet',
                                'batch:id,product_id,batch_no,expires_on,status,hold_reason',
                            ])
                            ->orderBy('product_id')
                            ->orderBy('batch_id'),
                    ]),
            ])
            ->orderBy('code')
            ->get();

        $rowPayload = $rows->map(fn (StorageRow $row): array => [
            'id' => $row->id,
            'code' => $row->code,
            'name' => $row->name,
            'valets' => $row->valets->map(fn (Valet $valet): array => $this->valetPayload($valet))->values(),
        ])->values();

        $valets = $rowPayload->flatMap(fn (array $row): array => $row['valets']->all());

        return Inertia::render('warehouse-map/index', [
            'rows' => $rowPayload,
            'summary' => [
                'active_rows' => $rowPayload->count(),
                'active_valets' => $valets->count(),
                'physical_cartons' => $valets->sum('physical_cartons'),
                'reserved_cartons' => $valets->sum('reserved_cartons'),
                'held_cartons' => $valets->sum('held_cartons'),
            ],
        ]);
    }

    /** @return array<string, mixed> */
    private function valetPayload(Valet $valet): array
    {
        $today = today();
        $soon = $today->copy()->addDays(30);
        $usage = BigRational::zero();
        $physical = 0;
        $reserved = 0;
        $held = 0;

        $stocks = $valet->stocks->map(function ($stock) use (&$held, &$physical, &$reserved, &$usage, $soon, $today): array {
            $physical += $stock->qty_on_hand;
            $reserved += $stock->qty_reserved;
            $held += $stock->qty_held;
            $usage = $usage->plus(BigRational::ofFraction($stock->qty_on_hand, $stock->product->max_cartons_per_valet));

            $expiresOn = Carbon::parse((string) $stock->batch->getRawOriginal('expires_on'));
            $expiryState = $expiresOn->isBefore($today)
                ? 'expired'
                : ($expiresOn->lessThanOrEqualTo($soon) ? 'soon' : 'ok');

            return [
                'id' => $stock->id,
                'product' => $stock->product->only(['sku', 'name', 'max_cartons_per_valet']),
                'batch' => [
                    'batch_no' => $stock->batch->batch_no,
                    'expires_on' => $expiresOn->toDateString(),
                    'status' => BatchStatus::from((string) $stock->batch->getRawOriginal('status'))->value,
                    'hold_reason' => $stock->batch->hold_reason,
                    'expiry_state' => $expiryState,
                ],
                'qty_on_hand' => $stock->qty_on_hand,
                'qty_reserved' => $stock->qty_reserved,
                'qty_held' => $stock->qty_held,
                'qty_available' => max($stock->qty_on_hand - $stock->qty_reserved - $stock->qty_held, 0),
            ];
        })->values();

        return [
            'id' => $valet->id,
            'code' => $valet->code,
            'status' => ValetStatus::from((string) $valet->getRawOriginal('status'))->value,
            'physical_cartons' => $physical,
            'reserved_cartons' => $reserved,
            'held_cartons' => $held,
            'available_cartons' => max($physical - $reserved - $held, 0),
            'utilization_percent' => round($usage->toFloat() * 100, 1),
            'stocks' => $stocks,
        ];
    }
}
