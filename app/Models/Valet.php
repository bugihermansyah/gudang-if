<?php

namespace App\Models;

use App\Enums\ValetStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['code', 'row_id', 'status', 'label_color'])]
/**
 * @property int $id
 * @property int $row_id
 * @property string $code
 * @property string|null $label_color
 * @property ValetStatus $status
 * @property int|null $stocks_sum_qty_on_hand
 * @property-read StorageRow $row
 * @property-read Collection<int, ValetStock> $stocks
 */
class Valet extends Model
{
    protected function casts(): array
    {
        return ['status' => ValetStatus::class];
    }

    /** @return Attribute<string, string> */
    protected function code(): Attribute
    {
        return Attribute::make(set: fn (string $value): string => mb_strtoupper(trim($value)));
    }

    /** @return BelongsTo<StorageRow, $this> */
    public function row(): BelongsTo
    {
        return $this->belongsTo(StorageRow::class, 'row_id');
    }

    /** @return HasMany<ValetStock, $this> */
    public function stocks(): HasMany
    {
        return $this->hasMany(ValetStock::class);
    }
}
