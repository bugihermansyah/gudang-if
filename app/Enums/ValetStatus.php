<?php

namespace App\Enums;

enum ValetStatus: string
{
    case Active = 'aktif';
    case Maintenance = 'perawatan';
    case Retired = 'nonaktif';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Aktif',
            self::Maintenance => 'Perawatan',
            self::Retired => 'Nonaktif',
        };
    }
}
