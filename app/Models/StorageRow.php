<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['code', 'name', 'active'])]
/**
 * @property int $id
 * @property string $code
 * @property string $name
 * @property bool $active
 * @property-read Collection<int, Valet> $valets
 */
class StorageRow extends Model
{
    protected $table = 'rows';

    protected function casts(): array
    {
        return ['active' => 'boolean'];
    }

    /** @return Attribute<string, string> */
    protected function code(): Attribute
    {
        return Attribute::make(set: fn (string $value): string => mb_strtoupper(trim($value)));
    }

    /** @return HasMany<Valet, $this> */
    public function valets(): HasMany
    {
        return $this->hasMany(Valet::class, 'row_id');
    }
}
