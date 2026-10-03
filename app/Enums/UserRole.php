<?php

namespace App\Enums;

enum UserRole: string
{
    case WarehouseOfficer = 'petugas_gudang';
    case Supervisor = 'supervisor';
    case Admin = 'admin';

    public function label(): string
    {
        return match ($this) {
            self::WarehouseOfficer => 'Petugas gudang',
            self::Supervisor => 'Supervisor',
            self::Admin => 'Admin',
        };
    }
}
