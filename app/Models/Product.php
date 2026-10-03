<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['sku', 'name', 'max_cartons_per_valet', 'carton_size_note', 'active'])]
/**
 * @property int $id
 * @property string $sku
 * @property string $name
 * @property int $max_cartons_per_valet
 * @property string|null $carton_size_note
 * @property bool $active
 * @property-read Collection<int, Batch> $batches
 * @property-read Collection<int, ValetStock> $valetStocks
 */
class Product extends Model
{
    protected function casts(): array
    {
        return [
            'active' => 'boolean',
            'max_cartons_per_valet' => 'integer',
        ];
    }

    /** @return Attribute<string, string> */
    protected function sku(): Attribute
    {
        return Attribute::make(set: fn (string $value): string => mb_strtoupper(trim($value)));
    }

    /** @return HasMany<Batch, $this> */
    public function batches(): HasMany
    {
        return $this->hasMany(Batch::class);
    }

    /** @return HasMany<ValetStock, $this> */
    public function valetStocks(): HasMany
    {
        return $this->hasMany(ValetStock::class);
    }
}
