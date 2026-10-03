<?php

namespace App\Http\Requests;

use App\Enums\ValetStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReceivingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $lines = [];
        foreach ((array) $this->input('lines', []) as $line) {
            if (! is_array($line)) {
                $lines[] = $line;

                continue;
            }

            $line['batch_no'] = mb_strtoupper(trim((string) ($line['batch_no'] ?? '')));
            $line['discrepancy_reason'] = filled($line['discrepancy_reason'] ?? null)
                ? trim((string) $line['discrepancy_reason'])
                : null;
            $allocations = [];
            foreach ((array) ($line['allocations'] ?? []) as $allocation) {
                $allocations[] = is_array($allocation)
                    ? [...$allocation, 'qty' => $allocation['qty'] ?? null]
                    : $allocation;
            }
            $line['allocations'] = $allocations;
            $lines[] = $line;
        }

        $this->merge([
            'external_delivery_note_no' => trim((string) $this->input('external_delivery_note_no')),
            'vehicle_plate' => mb_strtoupper(trim((string) $this->input('vehicle_plate'))),
            'driver_name' => trim((string) $this->input('driver_name')),
            'discrepancy_reason' => filled($this->input('discrepancy_reason'))
                ? trim((string) $this->input('discrepancy_reason'))
                : null,
            'lines' => $lines,
        ]);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'external_delivery_note_no' => ['required', 'string', 'max:96'],
            'company_id' => [
                'required',
                'integer',
                Rule::exists('companies', 'id')->where(fn ($query) => $query->where('active', true)),
            ],
            'vehicle_plate' => ['required', 'string', 'max:32'],
            'driver_name' => ['required', 'string', 'max:160'],
            'discrepancy_reason' => ['nullable', 'string', 'max:1000'],
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.product_id' => [
                'required',
                'integer',
                Rule::exists('products', 'id')->where(fn ($query) => $query->where('active', true)),
            ],
            'lines.*.batch_no' => ['required', 'string', 'max:96'],
            'lines.*.expires_on' => ['required', 'date'],
            'lines.*.qty_delivery_note' => ['required', 'integer', 'min:1'],
            'lines.*.qty_physical' => ['required', 'integer', 'min:1'],
            'lines.*.discrepancy_reason' => ['nullable', 'string', 'max:1000'],
            'lines.*.allocations' => ['required', 'array', 'min:1'],
            'lines.*.allocations.*.valet_id' => [
                'required',
                'integer',
                Rule::exists('valets', 'id')->where(fn ($query) => $query->where('status', ValetStatus::Active->value)),
            ],
            'lines.*.allocations.*.qty' => ['required', 'integer', 'min:1'],
        ];
    }

    public function attributes(): array
    {
        return [
            'external_delivery_note_no' => 'nomor surat jalan',
            'company_id' => 'PT asal',
            'vehicle_plate' => 'nomor polisi',
            'driver_name' => 'nama driver',
            'lines' => 'baris barang',
            'lines.*.product_id' => 'produk',
            'lines.*.batch_no' => 'nomor batch',
            'lines.*.expires_on' => 'tanggal kedaluwarsa',
            'lines.*.qty_delivery_note' => 'jumlah surat jalan',
            'lines.*.qty_physical' => 'jumlah fisik',
            'lines.*.allocations' => 'alokasi valet',
            'lines.*.allocations.*.valet_id' => 'valet',
            'lines.*.allocations.*.qty' => 'jumlah alokasi',
        ];
    }
}
