<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'sku' => mb_strtoupper(trim((string) $this->input('sku'))),
            'name' => trim((string) $this->input('name')),
            'carton_size_note' => filled($this->input('carton_size_note'))
                ? trim((string) $this->input('carton_size_note'))
                : null,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'sku' => ['required', 'string', 'max:64', Rule::unique('products', 'sku')],
            'name' => ['required', 'string', 'max:255'],
            'max_cartons_per_valet' => ['required', 'integer', 'min:1', 'max:1000000'],
            'carton_size_note' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function attributes(): array
    {
        return [
            'sku' => 'kode SKU',
            'name' => 'nama produk',
            'max_cartons_per_valet' => 'maksimum karton per valet',
            'carton_size_note' => 'catatan ukuran karton',
        ];
    }
}
