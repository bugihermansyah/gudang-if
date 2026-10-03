<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['valet_id', 'product_id', 'batch_id', 'qty_on_hand', 'qty_reserved', 'qty_held'])]
/**
 * @property int $id
 * @property int $valet_id
 * @property int $product_id
 * @property int $batch_id
 * @property int $qty_on_hand
 * @property int $qty_reserved
 * @property int $qty_held
 * @property-read Valet $valet
 * @property-read Product $product
 * @property-read Batch $batch
 */
class ValetStock extends Model
{
    protected function casts(): array
    {
        return [
            'qty_on_hand' => 'integer',
            'qty_reserved' => 'integer',
            'qty_held' => 'integer',
        ];
    }

    /** @return BelongsTo<Valet, $this> */
    public function valet(): BelongsTo
    {
        return $this->belongsTo(Valet::class);
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /** @return BelongsTo<Batch, $this> */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }
}
