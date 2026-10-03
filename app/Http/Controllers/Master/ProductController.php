<?php

namespace App\Http\Controllers\Master;

use App\Domain\Inventory\ValetCapacityService;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = (string) $request->query('status', 'all');

        $products = Product::query()
            ->when($search !== '', function ($query) use ($search) {
                $needle = '%'.mb_strtolower($search).'%';

                $query->where(function ($query) use ($needle) {
                    $query->whereRaw('LOWER(sku) LIKE ?', [$needle])
                        ->orWhereRaw('LOWER(name) LIKE ?', [$needle]);
                });
            })
            ->when($status === 'active', fn ($query) => $query->where('active', true))
            ->when($status === 'inactive', fn ($query) => $query->where('active', false))
            ->orderBy('sku')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('master/products/index', [
            'products' => $products,
            'filters' => compact('search', 'status'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('master/products/create');
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        Product::query()->create($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Produk berhasil dibuat.']);

        return to_route('master.products.index');
    }

    public function edit(Product $product): Response
    {
        return Inertia::render('master/products/edit', [
            'product' => $product->only([
                'id',
                'sku',
                'name',
                'max_cartons_per_valet',
                'carton_size_note',
                'active',
            ]),
        ]);
    }

    public function update(
        UpdateProductRequest $request,
        Product $product,
        ValetCapacityService $capacityService,
    ): RedirectResponse {
        $data = $request->validated();
        $newMaximum = (int) $data['max_cartons_per_valet'];

        if (
            $product->max_cartons_per_valet !== $newMaximum
            && ! $capacityService->productCapacityCanChange($product, $newMaximum)
        ) {
            throw ValidationException::withMessages([
                'max_cartons_per_valet' => 'Kapasitas baru membuat setidaknya satu valet terisi lebih dari 100%. Pindahkan stok terlebih dahulu.',
            ]);
        }

        $product->update($data);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Perubahan produk disimpan.']);

        return to_route('master.products.index');
    }

    public function updateStatus(Request $request, Product $product): RedirectResponse
    {
        $data = $request->validate(['active' => ['required', 'boolean']]);
        $product->update($data);
        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $product->active ? 'Produk diaktifkan.' : 'Produk dinonaktifkan.',
        ]);

        return back();
    }
}
