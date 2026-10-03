<?php

namespace App\Enums;

enum BatchStatus: string
{
    case Active = 'aktif';
    case Held = 'ditahan';
    case Questionable = 'meragukan';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Aktif',
            self::Held => 'Ditahan',
            self::Questionable => 'Meragukan',
        };
    }
}
