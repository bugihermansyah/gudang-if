<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRowRequest;
use App\Http\Requests\UpdateRowRequest;
use App\Models\StorageRow;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StorageRowController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = (string) $request->query('status', 'all');

        $rows = StorageRow::query()
            ->withCount('valets')
            ->when($search !== '', function ($query) use ($search) {
                $needle = '%'.mb_strtolower($search).'%';
                $query->where(function ($query) use ($needle) {
                    $query->whereRaw('LOWER(code) LIKE ?', [$needle])
                        ->orWhereRaw('LOWER(name) LIKE ?', [$needle]);
                });
            })
            ->when($status === 'active', fn ($query) => $query->where('active', true))
            ->when($status === 'inactive', fn ($query) => $query->where('active', false))
            ->orderBy('code')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('master/rows/index', [
            'rows' => $rows,
            'filters' => compact('search', 'status'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('master/rows/create');
    }

    public function store(StoreRowRequest $request): RedirectResponse
    {
        StorageRow::query()->create($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Row berhasil dibuat.']);

        return to_route('master.rows.index');
    }

    public function edit(StorageRow $row): Response
    {
        return Inertia::render('master/rows/edit', [
            'row' => $row->only(['id', 'code', 'name', 'active']),
        ]);
    }

    public function update(UpdateRowRequest $request, StorageRow $row): RedirectResponse
    {
        $row->update($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Perubahan row disimpan.']);

        return to_route('master.rows.index');
    }

    public function updateStatus(Request $request, StorageRow $row): RedirectResponse
    {
        $data = $request->validate(['active' => ['required', 'boolean']]);

        if (! $data['active'] && $row->valets()->where('status', 'aktif')->exists()) {
            throw ValidationException::withMessages([
                'active' => 'Row tidak dapat dinonaktifkan karena masih memiliki valet aktif.',
            ]);
        }

        $row->update($data);
        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $row->active ? 'Row diaktifkan.' : 'Row dinonaktifkan.',
        ]);

        return back();
    }
}
