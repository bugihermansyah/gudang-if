<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
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
            'sku' => [
                'required',
                'string',
                'max:64',
                Rule::unique('products', 'sku')->ignore($this->route('product')),
            ],
            'name' => ['required', 'string', 'max:255'],
            'max_cartons_per_valet' => ['required', 'integer', 'min:1', 'max:1000000'],
            'carton_size_note' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function attributes(): array
    {
        return (new StoreProductRequest)->attributes();
    }
}
