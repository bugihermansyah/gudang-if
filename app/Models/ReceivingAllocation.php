<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['receiving_line_id', 'valet_id', 'qty'])]
/**
 * @property int $id
 * @property int $receiving_line_id
 * @property int $valet_id
 * @property int $qty
 * @property-read ReceivingLine $line
 * @property-read Valet $valet
 */
class ReceivingAllocation extends Model
{
    protected function casts(): array
    {
        return ['qty' => 'integer'];
    }

    /** @return BelongsTo<ReceivingLine, $this> */
    public function line(): BelongsTo
    {
        return $this->belongsTo(ReceivingLine::class, 'receiving_line_id');
    }

    /** @return BelongsTo<Valet, $this> */
    public function valet(): BelongsTo
    {
        return $this->belongsTo(Valet::class);
    }
}
