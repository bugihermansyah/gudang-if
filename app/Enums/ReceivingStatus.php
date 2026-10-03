<?php

namespace App\Enums;

enum ReceivingStatus: string
{
    case Draft = 'draft';
    case Loading = 'bongkar';
    case ReadyToFinalize = 'siap_finalisasi';
    case Completed = 'selesai';
    case Cancelled = 'dibatalkan';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Loading => 'Sedang bongkar',
            self::ReadyToFinalize => 'Siap difinalisasi',
            self::Completed => 'Selesai',
            self::Cancelled => 'Dibatalkan',
        };
    }
}
