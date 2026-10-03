<?php

namespace App\Http\Controllers;

use App\Enums\BatchStatus;
use App\Enums\ReceivingStatus;
use App\Enums\ValetStatus;
use App\Http\Requests\StoreReceivingRequest;
use App\Models\Batch;
use App\Models\ReceivingDocument;
use App\Models\ReceivingLine;
use App\Models\StockMovement;
use App\Models\Valet;
use App\Models\ValetStock;
use Brick\Math\BigRational;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ReceivingController extends Controller
{
    public function index(Request $request): Response
    {
        $status = (string) $request->query('status', 'all');
        $search = trim((string) $request->query('search', ''));

        $documents = ReceivingDocument::query()
            ->with('company:id,code,name')
            ->when($status !== 'all', fn ($query) => $query->where('status', $status))
            ->when($search !== '', function ($query) use ($search) {
                $needle = '%'.mb_strtolower($search).'%';

                $query->where(function ($query) use ($needle) {
                    $query->whereRaw('LOWER(internal_no) LIKE ?', [$needle])
                        ->orWhereRaw('LOWER(external_delivery_note_no) LIKE ?', [$needle]);
                });
            })
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('receiving/index', [
            'documents' => $documents,
            'filters' => compact('search', 'status'),
            'statusOptions' => collect(ReceivingStatus::cases())
                ->map(fn (ReceivingStatus $item): array => [
                    'value' => $item->value,
                    'label' => $item->label(),
                ])
                ->values(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('receiving/create', [
            'companies' => DB::table('companies')
                ->where('active', true)
                ->orderBy('code')
                ->get(['id', 'code', 'name']),
            'products' => DB::table('products')
                ->where('active', true)
                ->orderBy('sku')
                ->get(['id', 'sku', 'name', 'max_cartons_per_valet']),
            'valets' => Valet::query()
                ->where('status', ValetStatus::Active)
                ->with('row:id,code,name')
                ->orderBy('code')
                ->get(['id', 'code', 'row_id'])
                ->map(fn (Valet $valet): array => [
                    'id' => $valet->id,
                    'code' => $valet->code,
                    'row' => $valet->row->only(['code', 'name']),
                ]),
        ]);
    }

    public function store(StoreReceivingRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $document = DB::transaction(function () use ($data, $request): ReceivingDocument {
            $preview = [];
            $document = ReceivingDocument::query()->create([
                'internal_no' => $this->newInternalNumber(),
                'external_delivery_note_no' => $data['external_delivery_note_no'],
                'company_id' => $data['company_id'],
                'vehicle_plate' => $data['vehicle_plate'],
                'driver_name' => $data['driver_name'],
                'status' => ReceivingStatus::Draft,
                'discrepancy_reason' => $data['discrepancy_reason'] ?? null,
                'created_by' => $request->user()->id,
                'finalization_key' => (string) Str::uuid(),
            ]);

            foreach ($data['lines'] as $lineIndex => $lineData) {
                if ((int) $lineData['qty_delivery_note'] !== (int) $lineData['qty_physical']
                    && blank($lineData['discrepancy_reason'] ?? null)) {
                    throw ValidationException::withMessages([
                        "lines.{$lineIndex}.discrepancy_reason" => 'Alasan selisih wajib diisi jika jumlah fisik berbeda dari surat jalan.',
                    ]);
                }

                $batch = $this->findOrCreateBatch($lineData, $lineIndex);
                $allocations = $lineData['allocations'];
                $valetIds = array_column($allocations, 'valet_id');

                if (count(array_unique($valetIds)) !== count($valetIds)) {
                    throw ValidationException::withMessages([
                        "lines.{$lineIndex}.allocations" => 'Satu valet hanya boleh muncul sekali pada baris ini.',
                    ]);
                }

                $allocatedQty = 0;
                foreach ($allocations as $allocation) {
                    $allocatedQty += (int) $allocation['qty'];
                }
                if ($allocatedQty !== (int) $lineData['qty_physical']) {
                    throw ValidationException::withMessages([
                        "lines.{$lineIndex}.allocations" => 'Total alokasi valet harus sama dengan jumlah fisik.',
                    ]);
                }

                $line = $document->lines()->create([
                    'product_id' => $lineData['product_id'],
                    'batch_id' => $batch->id,
                    'qty_delivery_note' => $lineData['qty_delivery_note'],
                    'qty_physical' => $lineData['qty_physical'],
                    'discrepancy_reason' => $lineData['discrepancy_reason'] ?? null,
                ]);

                foreach ($allocations as $allocation) {
                    $line->allocations()->create([
                        'valet_id' => $allocation['valet_id'],
                        'qty' => $allocation['qty'],
                    ]);
                    $preview[] = [
                        'valet_id' => (int) $allocation['valet_id'],
                        'product_id' => (int) $lineData['product_id'],
                        'qty' => (int) $allocation['qty'],
                    ];
                }
            }

            $this->ensureCapacity($preview);

            return $document;
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Draft penerimaan {$document->internal_no} berhasil dibuat.",
        ]);

        return to_route('receiving.show', $document);
    }

    public function show(ReceivingDocument $receiving): Response
    {
        $receiving->load([
            'company:id,code,name',
            'creator:id,name',
            'finalizer:id,name',
            'lines.product:id,sku,name,max_cartons_per_valet',
            'lines.batch:id,product_id,batch_no,expires_on,status,hold_reason,held_by,held_at',
            'lines.allocations.valet:id,code,row_id',
            'lines.allocations.valet.row:id,code,name',
        ]);

        return Inertia::render('receiving/show', [
            'document' => [
                'id' => $receiving->id,
                'internal_no' => $receiving->internal_no,
                'external_delivery_note_no' => $receiving->external_delivery_note_no,
                'company' => $receiving->company->only(['code', 'name']),
                'vehicle_plate' => $receiving->vehicle_plate,
                'driver_name' => $receiving->driver_name,
                'finalization_key' => $receiving->finalization_key,
                'status' => $this->statusValue($receiving),
                'status_label' => $this->statusValue($receiving)->label(),
                'unloading_started_at' => $this->timestampValue($receiving, 'unloading_started_at'),
                'unloading_finished_at' => $this->timestampValue($receiving, 'unloading_finished_at'),
                'discrepancy_reason' => $receiving->discrepancy_reason,
                'creator' => $receiving->creator->only(['name']),
                'finalizer' => $receiving->finalizer?->only(['name']),
                'lines' => $this->linePayload($receiving->lines),
            ],
        ]);
    }

    public function start(ReceivingDocument $receiving): RedirectResponse
    {
        abort_unless($this->statusValue($receiving) === ReceivingStatus::Draft, 422, 'Dokumen tidak berada pada status draft.');

        $receiving->update([
            'status' => ReceivingStatus::Loading,
            'unloading_started_at' => now(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Waktu mulai bongkar dicatat.']);

        return back();
    }

    public function finish(ReceivingDocument $receiving): RedirectResponse
    {
        abort_unless($this->statusValue($receiving) === ReceivingStatus::Loading, 422, 'Dokumen belum dalam proses bongkar.');

        $finishedAt = now();
        abort_if(
            ($startedAt = $this->timestampCarbon($receiving, 'unloading_started_at'))?->isAfter($finishedAt) === true,
            422,
            'Waktu selesai bongkar tidak boleh lebih awal dari waktu mulai.',
        );

        $receiving->update([
            'status' => ReceivingStatus::ReadyToFinalize,
            'unloading_finished_at' => $finishedAt,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Bongkar selesai. Periksa kembali sebelum finalisasi.']);

        return back();
    }

    public function holdBatch(Request $request, ReceivingDocument $receiving, ReceivingLine $line): RedirectResponse
    {
        $data = $request->validate([
            'reason' => ['required', 'string', 'min:3', 'max:500'],
        ], [
            'reason.required' => 'Alasan penahanan batch wajib diisi.',
            'reason.min' => 'Alasan penahanan batch minimal 3 karakter.',
        ]);

        abort_unless($line->receiving_document_id === $receiving->id, 404);
        abort_unless(
            in_array($this->statusValue($receiving), [
                ReceivingStatus::Draft,
                ReceivingStatus::Loading,
                ReceivingStatus::ReadyToFinalize,
            ], true),
            422,
            'Batch hanya dapat ditandai saat penerimaan belum selesai.',
        );

        DB::transaction(function () use ($data, $request, $line): void {
            $batch = Batch::query()->whereKey($line->batch_id)->lockForUpdate()->firstOrFail();
            $isExpired = $this->batchExpiry($batch)->isBefore(today());

            $batch->update([
                'status' => $isExpired ? BatchStatus::Held : BatchStatus::Questionable,
                'hold_reason' => $data['reason'],
                'held_by' => $request->user()->id,
                'held_at' => now(),
            ]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Batch ditandai untuk ditahan dan perlu pemeriksaan supervisor.']);

        return back();
    }

    public function finalize(Request $request, ReceivingDocument $receiving): RedirectResponse
    {
        $finalizationKey = trim((string) $request->input('finalization_key'));
        abort_if($finalizationKey === '', 422, 'Kunci finalisasi wajib dikirim.');

        DB::transaction(function () use ($request, $receiving, $finalizationKey): void {
            $document = ReceivingDocument::query()
                ->whereKey($receiving->id)
                ->lockForUpdate()
                ->with([
                    'lines.product',
                    'lines.batch',
                    'lines.allocations.valet',
                ])
                ->firstOrFail();

            $status = $this->statusValue($document);
            if ($status === ReceivingStatus::Completed) {
                abort_unless(
                    hash_equals((string) $document->finalization_key, $finalizationKey),
                    409,
                    'Dokumen sudah difinalisasi dengan kunci yang berbeda.',
                );

                return;
            }

            abort_unless(
                $status === ReceivingStatus::ReadyToFinalize,
                422,
                'Dokumen harus selesai bongkar sebelum difinalisasi.',
            );
            abort_unless($document->unloading_finished_at !== null, 422, 'Waktu selesai bongkar wajib dicatat.');

            $preview = [];
            foreach ($document->lines as $line) {
                foreach ($line->allocations as $allocation) {
                    $preview[] = [
                        'valet_id' => $allocation->valet_id,
                        'product_id' => $line->product_id,
                        'qty' => $allocation->qty,
                    ];
                }
            }
            Valet::query()
                ->whereIn('id', array_values(array_unique(array_column($preview, 'valet_id'))))
                ->lockForUpdate()
                ->get();
            $this->ensureCapacity($preview);

            foreach ($document->lines as $line) {
                foreach ($line->allocations as $allocation) {
                    $valet = Valet::query()->whereKey($allocation->valet_id)->lockForUpdate()->firstOrFail();
                    abort_unless($this->valetStatusValue($valet) === ValetStatus::Active, 422, "Valet {$valet->code} tidak lagi aktif.");

                    $stock = ValetStock::query()
                        ->where('valet_id', $valet->id)
                        ->where('product_id', $line->product_id)
                        ->where('batch_id', $line->batch_id)
                        ->lockForUpdate()
                        ->first();
                    $batchStatus = BatchStatus::from((string) $line->batch->getRawOriginal('status'));
                    $isExpired = $this->batchExpiry($line->batch)->isBefore(today());
                    $isHeld = $isExpired || in_array($batchStatus, [BatchStatus::Held, BatchStatus::Questionable], true);
                    $heldQty = $isHeld ? $allocation->qty : 0;
                    if ($isExpired && ($batchStatus !== BatchStatus::Held || $line->batch->held_at === null)) {
                        $line->batch->update([
                            'status' => BatchStatus::Held,
                            'hold_reason' => $line->batch->hold_reason ?? 'Otomatis ditahan karena kedaluwarsa.',
                            'held_by' => $line->batch->held_by ?? $request->user()->id,
                            'held_at' => $line->batch->held_at ?? now(),
                        ]);
                    }

                    if ($stock === null) {
                        $stock = ValetStock::query()->create([
                            'valet_id' => $valet->id,
                            'product_id' => $line->product_id,
                            'batch_id' => $line->batch_id,
                            'qty_on_hand' => $allocation->qty,
                            'qty_reserved' => 0,
                            'qty_held' => $heldQty,
                        ]);
                    } else {
                        $stock->update([
                            'qty_on_hand' => $stock->qty_on_hand + $allocation->qty,
                            'qty_held' => $stock->qty_held + $heldQty,
                        ]);
                    }

                    StockMovement::query()->create([
                        'receiving_document_id' => $document->id,
                        'valet_id' => $valet->id,
                        'product_id' => $line->product_id,
                        'batch_id' => $line->batch_id,
                        'qty_delta' => $allocation->qty,
                        'movement_type' => 'receiving',
                        'created_by' => $request->user()->id,
                    ]);
                }
            }

            $document->update([
                'status' => ReceivingStatus::Completed,
                'finalized_by' => $request->user()->id,
            ]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Penerimaan difinalisasi dan stok diperbarui.']);

        return back();
    }

    /** @param array<string, mixed> $lineData */
    private function findOrCreateBatch(array $lineData, int $lineIndex): Batch
    {
        $batch = Batch::query()
            ->where('product_id', $lineData['product_id'])
            ->where('batch_no', $lineData['batch_no'])
            ->first();

        if ($batch !== null) {
            if ($this->batchExpiry($batch)->toDateString() !== $lineData['expires_on']) {
                throw ValidationException::withMessages([
                    "lines.{$lineIndex}.expires_on" => 'Nomor batch yang sama untuk SKU ini sudah memiliki tanggal kedaluwarsa berbeda.',
                ]);
            }

            return $batch;
        }

        return Batch::query()->create([
            'product_id' => $lineData['product_id'],
            'batch_no' => $lineData['batch_no'],
            'expires_on' => $lineData['expires_on'],
            'status' => $lineData['expires_on'] < today()->toDateString()
                ? BatchStatus::Held
                : BatchStatus::Active,
        ]);
    }

    /** @param array<int, array{valet_id:int, product_id:int, qty:int}> $preview */
    private function ensureCapacity(array $preview): void
    {
        /** @var array<int, array<int, array{valet_id:int, product_id:int, qty:int}>> $byValet */
        $byValet = [];
        foreach ($preview as $incoming) {
            $byValet[$incoming['valet_id']][] = $incoming;
        }

        $valets = Valet::query()
            ->whereIn('id', array_keys($byValet))
            ->with(['stocks' => fn ($query) => $query->where('qty_on_hand', '>', 0)->with('product:id,max_cartons_per_valet')])
            ->get()
            ->keyBy('id');

        foreach ($byValet as $valetId => $incoming) {
            $valet = $valets->get($valetId);
            abort_unless($valet instanceof Valet && $this->valetStatusValue($valet) === ValetStatus::Active, 422, 'Setiap alokasi harus menuju valet aktif.');
            $usage = BigRational::zero();

            foreach ($valet->stocks as $stock) {
                $usage = $usage->plus(BigRational::ofFraction($stock->qty_on_hand, $stock->product->max_cartons_per_valet));
            }

            /** @var array<int, int> $incomingByProduct */
            $incomingByProduct = [];
            foreach ($incoming as $incomingRow) {
                $incomingByProduct[$incomingRow['product_id']] = ($incomingByProduct[$incomingRow['product_id']] ?? 0) + $incomingRow['qty'];
            }
            foreach ($incomingByProduct as $productId => $incomingQty) {
                $product = DB::table('products')->where('id', $productId)->first(['max_cartons_per_valet']);
                abort_unless($product !== null, 422, 'Produk pada alokasi tidak ditemukan.');
                $usage = $usage->plus(BigRational::ofFraction($incomingQty, $product->max_cartons_per_valet));
            }

            abort_unless(
                $usage->isLessThanOrEqualTo(1),
                422,
                "Alokasi ke valet {$valet->code} melebihi kapasitas 100%.",
            );
        }
    }

    private function statusValue(ReceivingDocument $document): ReceivingStatus
    {
        return ReceivingStatus::from((string) $document->getRawOriginal('status'));
    }

    private function valetStatusValue(Valet $valet): ValetStatus
    {
        return ValetStatus::from((string) $valet->getRawOriginal('status'));
    }

    private function batchExpiry(Batch $batch): Carbon
    {
        return Carbon::parse((string) $batch->getRawOriginal('expires_on'));
    }

    private function timestampValue(ReceivingDocument $document, string $column): ?string
    {
        $value = $document->getRawOriginal($column);

        return $value === null ? null : Carbon::parse((string) $value)->toIso8601String();
    }

    private function timestampCarbon(ReceivingDocument $document, string $column): ?Carbon
    {
        $value = $document->getRawOriginal($column);

        return $value === null ? null : Carbon::parse((string) $value);
    }

    /** @param Collection<int, ReceivingLine> $lines
     * @return array<int, array<string, mixed>>
     */
    private function linePayload(Collection $lines): array
    {
        $payload = [];
        foreach ($lines as $line) {
            $allocations = [];
            foreach ($line->allocations as $allocation) {
                $allocations[] = [
                    'id' => $allocation->id,
                    'qty' => $allocation->qty,
                    'valet' => [
                        'code' => $allocation->valet->code,
                        'row' => $allocation->valet->row->only(['code', 'name']),
                    ],
                ];
            }
            $payload[] = [
                'id' => $line->id,
                'product' => $line->product->only(['sku', 'name', 'max_cartons_per_valet']),
                'batch' => [
                    'batch_no' => $line->batch->batch_no,
                    'expires_on' => $this->batchExpiry($line->batch)->toDateString(),
                    'status' => BatchStatus::from((string) $line->batch->getRawOriginal('status'))->value,
                    'hold_reason' => $line->batch->hold_reason,
                ],
                'qty_delivery_note' => $line->qty_delivery_note,
                'qty_physical' => $line->qty_physical,
                'discrepancy_reason' => $line->discrepancy_reason,
                'allocations' => $allocations,
            ];
        }

        return $payload;
    }

    private function newInternalNumber(): string
    {
        do {
            $number = 'GR-'.now()->format('Ymd').'-'.mb_strtoupper(Str::random(6));
        } while (ReceivingDocument::query()->where('internal_no', $number)->exists());

        return $number;
    }
}
