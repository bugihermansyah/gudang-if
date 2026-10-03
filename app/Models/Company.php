<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['code', 'name', 'active'])]
/**
 * @property int $id
 * @property string $code
 * @property string $name
 * @property bool $active
 */
class Company extends Model
{
    protected function casts(): array
    {
        return ['active' => 'boolean'];
    }

    /** @return Attribute<string, string> */
    protected function code(): Attribute
    {
        return Attribute::make(set: fn (string $value): string => mb_strtoupper(trim($value)));
    }
}
