<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCompanyRequest;
use App\Http\Requests\UpdateCompanyRequest;
use App\Models\Company;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompanyController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = (string) $request->query('status', 'all');

        $companies = Company::query()
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

        return Inertia::render('master/companies/index', [
            'companies' => $companies,
            'filters' => compact('search', 'status'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('master/companies/create');
    }

    public function store(StoreCompanyRequest $request): RedirectResponse
    {
        Company::query()->create($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Perusahaan berhasil dibuat.']);

        return to_route('master.companies.index');
    }

    public function edit(Company $company): Response
    {
        return Inertia::render('master/companies/edit', [
            'company' => $company->only(['id', 'code', 'name', 'active']),
        ]);
    }

    public function update(UpdateCompanyRequest $request, Company $company): RedirectResponse
    {
        $company->update($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Perubahan perusahaan disimpan.']);

        return to_route('master.companies.index');
    }

    public function updateStatus(Request $request, Company $company): RedirectResponse
    {
        $company->update($request->validate(['active' => ['required', 'boolean']]));
        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $company->active ? 'Perusahaan diaktifkan.' : 'Perusahaan dinonaktifkan.',
        ]);

        return back();
    }
}
