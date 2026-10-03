<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateRowRequest extends StoreRowRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'code' => [
                'required',
                'string',
                'max:64',
                Rule::unique('rows', 'code')->ignore($this->route('row')),
            ],
            'name' => ['required', 'string', 'max:255'],
        ];
    }
}
