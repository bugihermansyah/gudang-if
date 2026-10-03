<?php

namespace App\Models;

use App\Enums\BatchStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

#[Fillable(['product_id', 'batch_no', 'expires_on', 'status', 'hold_reason', 'held_by', 'held_at'])]
/**
 * @property int $id
 * @property int $product_id
 * @property string $batch_no
 * @property Carbon $expires_on
 * @property BatchStatus $status
 * @property string|null $hold_reason
 * @property int|null $held_by
 * @property Carbon|null $held_at
 * @property-read Product $product
 * @property-read Collection<int, ValetStock> $valetStocks
 */
class Batch extends Model
{
    protected function casts(): array
    {
        return [
            'expires_on' => 'date',
            'status' => BatchStatus::class,
            'held_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /** @return HasMany<ValetStock, $this> */
    public function valetStocks(): HasMany
    {
        return $this->hasMany(ValetStock::class);
    }
}
