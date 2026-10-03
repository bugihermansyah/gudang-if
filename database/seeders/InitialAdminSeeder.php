<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class InitialAdminSeeder extends Seeder
{
    public function run(): void
    {
        $name = config('warehouse.initial_admin.name');
        $email = config('warehouse.initial_admin.email');
        $password = config('warehouse.initial_admin.password');

        if (! is_string($name) || ! is_string($email) || ! is_string($password) || $password === '') {
            $this->command->warn('Admin awal tidak dibuat. Isi INITIAL_ADMIN_NAME, INITIAL_ADMIN_EMAIL, dan INITIAL_ADMIN_PASSWORD.');

            return;
        }

        User::query()->updateOrCreate(
            ['email' => mb_strtolower(trim($email))],
            [
                'name' => trim($name),
                'password' => Hash::make($password),
                'role' => UserRole::Admin,
                'active' => true,
                'email_verified_at' => now(),
            ],
        );
    }
}
