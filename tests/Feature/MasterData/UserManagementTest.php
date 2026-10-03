<?php

namespace Tests\Feature\MasterData;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_update_filter_and_toggle_user_accounts(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);

        $this->actingAs($admin)
            ->post(route('master.users.store'), [
                'name' => '  Supervisor Pagi ',
                'email' => ' SUPERVISOR@EXAMPLE.COM ',
                'role' => UserRole::Supervisor->value,
                'password' => 'Password123!',
                'password_confirmation' => 'Password123!',
            ])
            ->assertRedirect(route('master.users.index'));

        $user = User::query()->where('email', 'supervisor@example.com')->firstOrFail();
        $this->assertSame('Supervisor Pagi', $user->name);
        $this->assertSame(UserRole::Supervisor, $user->role);
        $this->assertTrue($user->active);
        $this->assertTrue(Hash::check('Password123!', $user->password));

        $this->actingAs($admin)
            ->get(route('master.users.index', [
                'search' => 'supervisor@example.com',
                'role' => UserRole::Supervisor->value,
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('master/users/index')
                ->has('users.data', 1)
                ->where('users.data.0.email', 'supervisor@example.com')
                ->where('filters.role', UserRole::Supervisor->value));

        $this->actingAs($admin)
            ->put(route('master.users.update', $user), [
                'name' => 'Supervisor Sore',
                'email' => 'supervisor@example.com',
                'role' => UserRole::Supervisor->value,
                'password' => '',
                'password_confirmation' => '',
            ])
            ->assertRedirect(route('master.users.index'));

        $this->actingAs($admin)
            ->patch(route('master.users.status', $user), ['active' => false])
            ->assertRedirect();

        $this->assertFalse($user->refresh()->active);
    }

    public function test_admin_cannot_disable_themselves_but_can_disable_another_admin(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);

        $this->actingAs($admin)
            ->patch(route('master.users.status', $admin), ['active' => false])
            ->assertSessionHasErrors('active');

        $otherAdmin = User::factory()->create(['role' => UserRole::Admin]);

        $this->actingAs($admin)
            ->patch(route('master.users.status', $otherAdmin), ['active' => false])
            ->assertRedirect();

        $this->assertFalse($otherAdmin->refresh()->active);
    }

    public function test_non_admin_cannot_manage_user_accounts_and_inactive_users_are_logged_out(): void
    {
        $officer = User::factory()->create(['role' => UserRole::WarehouseOfficer]);

        $this->actingAs($officer)
            ->get(route('master.users.index'))
            ->assertForbidden();

        $inactive = User::factory()->create(['active' => false]);

        $this->actingAs($inactive)
            ->get(route('dashboard'))
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('email');

        $this->assertGuest();

        $this->post(route('login.store'), [
            'email' => $inactive->email,
            'password' => 'password',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();
    }
}
