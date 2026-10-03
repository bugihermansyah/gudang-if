<?php

namespace App\Http\Requests;

use App\Enums\ValetStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreValetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'code' => mb_strtoupper(trim((string) $this->input('code'))),
            'label_color' => filled($this->input('label_color'))
                ? trim((string) $this->input('label_color'))
                : null,
        ]);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:64', Rule::unique('valets', 'code')],
            'row_id' => [
                'required',
                'integer',
                Rule::exists('rows', 'id')->where(fn ($query) => $query->where('active', true)),
            ],
            'status' => ['required', Rule::enum(ValetStatus::class)],
            'label_color' => ['nullable', 'string', 'max:32'],
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return [
            'code' => 'kode valet',
            'row_id' => 'row',
            'status' => 'status valet',
            'label_color' => 'warna label',
        ];
    }
}
