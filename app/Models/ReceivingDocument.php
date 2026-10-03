<?php

namespace App\Models;

use App\Enums\ReceivingStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

#[Fillable([
    'internal_no',
    'external_delivery_note_no',
    'company_id',
    'vehicle_plate',
    'driver_name',
    'status',
    'unloading_started_at',
    'unloading_finished_at',
    'discrepancy_reason',
    'created_by',
    'finalized_by',
    'finalization_key',
])]
/**
 * @property int $id
 * @property string $internal_no
 * @property string $external_delivery_note_no
 * @property int $company_id
 * @property string $vehicle_plate
 * @property string $driver_name
 * @property ReceivingStatus $status
 * @property Carbon|null $unloading_started_at
 * @property Carbon|null $unloading_finished_at
 * @property string|null $discrepancy_reason
 * @property int $created_by
 * @property int|null $finalized_by
 * @property string $finalization_key
 * @property-read Company $company
 * @property-read User $creator
 * @property-read User|null $finalizer
 * @property-read Collection<int, ReceivingLine> $lines
 */
class ReceivingDocument extends Model
{
    protected function casts(): array
    {
        return [
            'status' => ReceivingStatus::class,
            'unloading_started_at' => 'datetime',
            'unloading_finished_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Company, $this> */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /** @return BelongsTo<User, $this> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** @return BelongsTo<User, $this> */
    public function finalizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'finalized_by');
    }

    /** @return HasMany<ReceivingLine, $this> */
    public function lines(): HasMany
    {
        return $this->hasMany(ReceivingLine::class);
    }
}
