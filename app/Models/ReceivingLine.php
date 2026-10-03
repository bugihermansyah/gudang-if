<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'receiving_document_id',
    'product_id',
    'batch_id',
    'qty_delivery_note',
    'qty_physical',
    'discrepancy_reason',
])]
/**
 * @property int $id
 * @property int $receiving_document_id
 * @property int $product_id
 * @property int $batch_id
 * @property int $qty_delivery_note
 * @property int $qty_physical
 * @property string|null $discrepancy_reason
 * @property-read ReceivingDocument $document
 * @property-read Product $product
 * @property-read Batch $batch
 * @property-read Collection<int, ReceivingAllocation> $allocations
 */
class ReceivingLine extends Model
{
    protected function casts(): array
    {
        return [
            'qty_delivery_note' => 'integer',
            'qty_physical' => 'integer',
        ];
    }

    /** @return BelongsTo<ReceivingDocument, $this> */
    public function document(): BelongsTo
    {
        return $this->belongsTo(ReceivingDocument::class, 'receiving_document_id');
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

    /** @return HasMany<ReceivingAllocation, $this> */
    public function allocations(): HasMany
    {
        return $this->hasMany(ReceivingAllocation::class);
    }
}
