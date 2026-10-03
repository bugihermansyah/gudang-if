<?php

namespace App\Http\Controllers\Master;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = (string) $request->query('status', 'all');
        $role = (string) $request->query('role', 'all');

        $users = User::query()
            ->when($search !== '', function ($query) use ($search) {
                $needle = '%'.mb_strtolower($search).'%';
                $query->where(function ($query) use ($needle) {
                    $query->whereRaw('LOWER(name) LIKE ?', [$needle])
                        ->orWhereRaw('LOWER(email) LIKE ?', [$needle]);
                });
            })
            ->when($status === 'active', fn ($query) => $query->where('active', true))
            ->when($status === 'inactive', fn ($query) => $query->where('active', false))
            ->when($role !== 'all', fn ($query) => $query->where('role', $role))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
                'role_label' => $user->role->label(),
                'active' => $user->active,
                'created_at' => $user->created_at?->toDateString(),
            ]);

        return Inertia::render('master/users/index', [
            'users' => $users,
            'filters' => compact('search', 'status', 'role'),
            'roleOptions' => $this->roleOptions(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('master/users/create', [
            'roleOptions' => $this->roleOptions(),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        User::query()->create($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Akun pengguna berhasil dibuat.']);

        return to_route('master.users.index');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('master/users/edit', [
            'user' => $user->only(['id', 'name', 'email', 'role', 'active']),
            'roleOptions' => $this->roleOptions(),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();
        if (($data['password'] ?? null) === null) {
            unset($data['password']);
        }

        $user->update($data);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Perubahan akun disimpan.']);

        return to_route('master.users.index');
    }

    public function updateStatus(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate(['active' => ['required', 'boolean']]);

        if (! $data['active'] && $request->user()?->is($user)) {
            throw ValidationException::withMessages([
                'active' => 'Akun yang sedang digunakan tidak dapat dinonaktifkan.',
            ]);
        }

        if (! $data['active'] && $user->role === UserRole::Admin) {
            $otherActiveAdminExists = User::query()
                ->where('active', true)
                ->where('role', UserRole::Admin)
                ->whereKeyNot($user)
                ->exists();

            if (! $otherActiveAdminExists) {
                throw ValidationException::withMessages([
                    'active' => 'Setidaknya satu akun admin aktif harus dipertahankan.',
                ]);
            }
        }

        $user->update($data);
        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $user->active ? 'Akun diaktifkan.' : 'Akun dinonaktifkan.',
        ]);

        return back();
    }

    /** @return array<int, array{value: string, label: string}> */
    private function roleOptions(): array
    {
        return array_map(
            fn (UserRole $role): array => [
                'value' => $role->value,
                'label' => $role->label(),
            ],
            UserRole::cases(),
        );
    }
}
