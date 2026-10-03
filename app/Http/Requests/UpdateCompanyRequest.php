<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateCompanyRequest extends StoreCompanyRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'code' => [
                'required',
                'string',
                'max:64',
                Rule::unique('companies', 'code')->ignore($this->route('company')),
            ],
            'name' => ['required', 'string', 'max:255'],
        ];
    }
}
