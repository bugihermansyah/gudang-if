<?php

namespace App\Http\Requests;

use App\Enums\ValetStatus;
use Illuminate\Validation\Rule;

class UpdateValetRequest extends StoreValetRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'code' => [
                'required',
                'string',
                'max:64',
                Rule::unique('valets', 'code')->ignore($this->route('valet')),
            ],
            'row_id' => [
                'required',
                'integer',
                Rule::exists('rows', 'id')->where(fn ($query) => $query->where('active', true)),
            ],
            'status' => ['required', Rule::enum(ValetStatus::class)],
            'label_color' => ['nullable', 'string', 'max:32'],
        ];
    }
}
