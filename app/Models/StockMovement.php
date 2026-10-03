<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'receiving_document_id',
    'valet_id',
    'product_id',
    'batch_id',
    'qty_delta',
    'movement_type',
    'created_by',
])]
/**
 * @property int $id
 * @property int|null $receiving_document_id
 * @property int $valet_id
 * @property int $product_id
 * @property int $batch_id
 * @property int $qty_delta
 * @property string $movement_type
 * @property int $created_by
 */
class StockMovement extends Model
{
    /** @return BelongsTo<ReceivingDocument, $this> */
    public function receivingDocument(): BelongsTo
    {
        return $this->belongsTo(ReceivingDocument::class);
    }
}
