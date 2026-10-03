<?php

namespace App\Http\Controllers\Master;

use App\Enums\ValetStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreValetRequest;
use App\Http\Requests\UpdateValetRequest;
use App\Models\StorageRow;
use App\Models\Valet;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ValetController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = (string) $request->query('status', 'all');

        $valets = Valet::query()
            ->with('row:id,code,name')
            ->withSum('stocks', 'qty_on_hand')
            ->when($search !== '', function ($query) use ($search) {
                $needle = '%'.mb_strtolower($search).'%';
                $query->where(function ($query) use ($needle) {
                    $query->whereRaw('LOWER(valets.code) LIKE ?', [$needle])
                        ->orWhereHas('row', function ($query) use ($needle) {
                            $query->whereRaw('LOWER(rows.code) LIKE ?', [$needle]);
                        });
                });
            })
            ->when($status !== 'all', fn ($query) => $query->where('status', $status))
            ->orderBy('code')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('master/valets/index', [
            'valets' => $valets,
            'filters' => compact('search', 'status'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('master/valets/create', [
            'rows' => StorageRow::query()->where('active', true)->orderBy('code')->get(['id', 'code', 'name']),
        ]);
    }

    public function store(StoreValetRequest $request): RedirectResponse
    {
        Valet::query()->create($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Valet berhasil dibuat.']);

        return to_route('master.valets.index');
    }

    public function edit(Valet $valet): Response
    {
        return Inertia::render('master/valets/edit', [
            'valet' => $valet->only(['id', 'code', 'row_id', 'status', 'label_color']),
            'rows' => StorageRow::query()
                ->where(function ($query) use ($valet) {
                    $query->where('active', true)->orWhereKey($valet->row_id);
                })
                ->orderBy('code')
                ->get(['id', 'code', 'name']),
            'statusOptions' => array_map(
                fn (ValetStatus $status) => ['value' => $status->value, 'label' => $status->label()],
                ValetStatus::cases(),
            ),
        ]);
    }

    public function update(UpdateValetRequest $request, Valet $valet): RedirectResponse
    {
        $valet->update($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Perubahan valet disimpan.']);

        return to_route('master.valets.index');
    }

    public function updateStatus(Request $request, Valet $valet): RedirectResponse
    {
        $data = $request->validate(['status' => ['required', 'string', 'in:aktif,perawatan,nonaktif']]);
        $valet->update($data);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Status valet diperbarui.']);

        return back();
    }
}
