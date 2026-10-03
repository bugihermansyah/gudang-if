<?php

namespace App\Domain\Inventory;

use App\Models\Product;
use App\Models\Valet;
use Brick\Math\BigRational;

class ValetCapacityService
{
    public function productCapacityCanChange(Product $product, int $newMaximum): bool
    {
        if ($newMaximum < 1) {
            return false;
        }

        $valetIds = $product->valetStocks()
            ->where('qty_on_hand', '>', 0)
            ->pluck('valet_id');

        if ($valetIds->isEmpty()) {
            return true;
        }

        $valets = Valet::query()
            ->whereKey($valetIds)
            ->with(['stocks' => fn ($query) => $query
                ->where('qty_on_hand', '>', 0)
                ->with('product:id,max_cartons_per_valet')])
            ->get();

        foreach ($valets as $valet) {
            $usage = BigRational::zero();

            foreach ($valet->stocks as $stock) {
                $maximum = $stock->product_id === $product->id
                    ? $newMaximum
                    : $stock->product->max_cartons_per_valet;

                $usage = $usage->plus(BigRational::ofFraction($stock->qty_on_hand, $maximum));
            }

            if ($usage->isGreaterThan(1)) {
                return false;
            }
        }

        return true;
    }
}
