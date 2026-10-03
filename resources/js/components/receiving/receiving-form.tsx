import { Link, useForm } from '@inertiajs/react';
import { PlusIcon, SaveIcon, Trash2Icon } from 'lucide-react';
import type { FormEvent } from 'react';

import { Button, buttonVariants } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select as ShadcnSelect,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

type CompanyOption = { id: number; code: string; name: string };
type ProductOption = {
    id: number;
    sku: string;
    name: string;
    max_cartons_per_valet: number;
};
type ValetOption = {
    id: number;
    code: string;
    row: { code: string; name: string };
};

type AllocationData = { valet_id: string | number; qty: string | number };
type LineData = {
    product_id: string | number;
    batch_no: string;
    expires_on: string;
    qty_delivery_note: string | number;
    qty_physical: string | number;
    discrepancy_reason: string;
    allocations: AllocationData[];
};

export type ReceivingFormData = {
    external_delivery_note_no: string;
    company_id: string | number;
    vehicle_plate: string;
    driver_name: string;
    discrepancy_reason: string;
    lines: LineData[];
};

function emptyLine(products: ProductOption[], valets: ValetOption[]): LineData {
    return {
        product_id: products[0]?.id ?? '',
        batch_no: '',
        expires_on: '',
        qty_delivery_note: '',
        qty_physical: '',
        discrepancy_reason: '',
        allocations: [{ valet_id: valets[0]?.id ?? '', qty: '' }],
    };
}

export function ReceivingForm({
    companies,
    products,
    valets,
}: {
    companies: CompanyOption[];
    products: ProductOption[];
    valets: ValetOption[];
}) {
    const form = useForm<ReceivingFormData>({
        external_delivery_note_no: '',
        company_id: companies[0]?.id ?? '',
        vehicle_plate: '',
        driver_name: '',
        discrepancy_reason: '',
        lines: [emptyLine(products, valets)],
    });

    const error = (key: string) =>
        (form.errors as Record<string, string | undefined>)[key];
    const updateLine = (index: number, patch: Partial<LineData>) => {
        form.setData(
            'lines',
            form.data.lines.map((line, lineIndex) =>
                lineIndex === index ? { ...line, ...patch } : line,
            ),
        );
    };
    const updateAllocation = (
        lineIndex: number,
        allocationIndex: number,
        patch: Partial<AllocationData>,
    ) => {
        updateLine(lineIndex, {
            allocations: form.data.lines[lineIndex].allocations.map(
                (allocation, currentIndex) =>
                    currentIndex === allocationIndex
                        ? { ...allocation, ...patch }
                        : allocation,
            ),
        });
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/receiving', { preserveScroll: true });
    };

    return (
        <form noValidate onSubmit={submit}>
            <div className="flex flex-col gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Dokumen dan angkutan</CardTitle>
                        <CardDescription>
                            Nomor surat jalan berasal dari dokumen eksternal.
                            Nomor internal dibuat otomatis saat draft disimpan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FieldGroup>
                            <div className="grid gap-6 md:grid-cols-2">
                                <Field
                                    data-invalid={Boolean(
                                        error('external_delivery_note_no'),
                                    )}
                                >
                                    <FieldLabel htmlFor="external-delivery-note-no">
                                        Nomor surat jalan
                                    </FieldLabel>
                                    <Input
                                        id="external-delivery-note-no"
                                        value={
                                            form.data.external_delivery_note_no
                                        }
                                        onChange={(event) =>
                                            form.setData(
                                                'external_delivery_note_no',
                                                event.target.value,
                                            )
                                        }
                                        aria-invalid={Boolean(
                                            error('external_delivery_note_no'),
                                        )}
                                        aria-describedby="external-delivery-note-no-error"
                                    />
                                    <FieldError id="external-delivery-note-no-error">
                                        {error('external_delivery_note_no')}
                                    </FieldError>
                                </Field>
                                <Field
                                    data-invalid={Boolean(error('company_id'))}
                                >
                                    <FieldLabel htmlFor="receiving-company">
                                        PT asal
                                    </FieldLabel>
                                    <ShadcnSelect
                                        value={String(form.data.company_id)}
                                        onValueChange={(value) =>
                                            form.setData('company_id', value)
                                        }
                                    >
                                        <SelectTrigger
                                            id="receiving-company"
                                            aria-invalid={Boolean(
                                                error('company_id'),
                                            )}
                                            aria-describedby="receiving-company-error"
                                        >
                                            <SelectValue placeholder="Pilih PT asal" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {companies.map((company) => (
                                                    <SelectItem
                                                        key={company.id}
                                                        value={String(
                                                            company.id,
                                                        )}
                                                    >
                                                        {company.code} —{' '}
                                                        {company.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </ShadcnSelect>
                                    <FieldError id="receiving-company-error">
                                        {error('company_id')}
                                    </FieldError>
                                </Field>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2">
                                <Field
                                    data-invalid={Boolean(
                                        error('vehicle_plate'),
                                    )}
                                >
                                    <FieldLabel htmlFor="vehicle-plate">
                                        Nomor polisi
                                    </FieldLabel>
                                    <Input
                                        id="vehicle-plate"
                                        autoComplete="off"
                                        value={form.data.vehicle_plate}
                                        onChange={(event) =>
                                            form.setData(
                                                'vehicle_plate',
                                                event.target.value,
                                            )
                                        }
                                        aria-invalid={Boolean(
                                            error('vehicle_plate'),
                                        )}
                                        aria-describedby="vehicle-plate-error"
                                    />
                                    <FieldError id="vehicle-plate-error">
                                        {error('vehicle_plate')}
                                    </FieldError>
                                </Field>
                                <Field
                                    data-invalid={Boolean(error('driver_name'))}
                                >
                                    <FieldLabel htmlFor="driver-name">
                                        Nama driver
                                    </FieldLabel>
                                    <Input
                                        id="driver-name"
                                        autoComplete="name"
                                        value={form.data.driver_name}
                                        onChange={(event) =>
                                            form.setData(
                                                'driver_name',
                                                event.target.value,
                                            )
                                        }
                                        aria-invalid={Boolean(
                                            error('driver_name'),
                                        )}
                                        aria-describedby="driver-name-error"
                                    />
                                    <FieldError id="driver-name-error">
                                        {error('driver_name')}
                                    </FieldError>
                                </Field>
                            </div>
                        </FieldGroup>
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h2 className="font-display text-xl font-semibold">
                                SKU, batch, dan alokasi
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Jumlah alokasi valet harus sama dengan karton
                                fisik yang diterima.
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                form.setData('lines', [
                                    ...form.data.lines,
                                    emptyLine(products, valets),
                                ])
                            }
                        >
                            <PlusIcon data-icon="inline-start" />
                            Tambah baris SKU
                        </Button>
                    </div>

                    {form.data.lines.map((line, lineIndex) => {
                        const lineKey = `lines.${lineIndex}`;
                        const physical = Number(line.qty_physical);
                        const deliveryNote = Number(line.qty_delivery_note);
                        const hasDiscrepancy =
                            Number.isFinite(physical) &&
                            Number.isFinite(deliveryNote) &&
                            physical !== deliveryNote;

                        return (
                            <Card key={lineIndex}>
                                <CardHeader className="flex flex-row items-start justify-between gap-4">
                                    <div className="flex flex-col gap-1">
                                        <CardTitle className="text-base">
                                            Baris {lineIndex + 1}
                                        </CardTitle>
                                        <CardDescription>
                                            Batch dan tanggal kedaluwarsa wajib
                                            diisi dari kemasan atau dokumen yang
                                            diverifikasi.
                                        </CardDescription>
                                    </div>
                                    {form.data.lines.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Hapus baris ${lineIndex + 1}`}
                                            onClick={() =>
                                                form.setData(
                                                    'lines',
                                                    form.data.lines.filter(
                                                        (_, index) =>
                                                            index !== lineIndex,
                                                    ),
                                                )
                                            }
                                        >
                                            <Trash2Icon />
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <FieldGroup>
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <Field
                                                data-invalid={Boolean(
                                                    error(
                                                        `${lineKey}.product_id`,
                                                    ),
                                                )}
                                            >
                                                <FieldLabel
                                                    htmlFor={`product-${lineIndex}`}
                                                >
                                                    Produk / SKU
                                                </FieldLabel>
                                                <ShadcnSelect
                                                    value={String(
                                                        line.product_id,
                                                    )}
                                                    onValueChange={(value) =>
                                                        updateLine(lineIndex, {
                                                            product_id: value,
                                                        })
                                                    }
                                                >
                                                    <SelectTrigger
                                                        id={`product-${lineIndex}`}
                                                        aria-invalid={Boolean(
                                                            error(
                                                                `${lineKey}.product_id`,
                                                            ),
                                                        )}
                                                        aria-describedby={`product-${lineIndex}-error`}
                                                    >
                                                        <SelectValue placeholder="Pilih SKU" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {products.map(
                                                                (product) => (
                                                                    <SelectItem
                                                                        key={
                                                                            product.id
                                                                        }
                                                                        value={String(
                                                                            product.id,
                                                                        )}
                                                                    >
                                                                        {
                                                                            product.sku
                                                                        }{' '}
                                                                        —{' '}
                                                                        {
                                                                            product.name
                                                                        }{' '}
                                                                        (maks.{' '}
                                                                        {
                                                                            product.max_cartons_per_valet
                                                                        }
                                                                        )
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </ShadcnSelect>
                                                <FieldError
                                                    id={`product-${lineIndex}-error`}
                                                >
                                                    {error(
                                                        `${lineKey}.product_id`,
                                                    )}
                                                </FieldError>
                                            </Field>
                                            <Field
                                                data-invalid={Boolean(
                                                    error(
                                                        `${lineKey}.batch_no`,
                                                    ),
                                                )}
                                            >
                                                <FieldLabel
                                                    htmlFor={`batch-${lineIndex}`}
                                                >
                                                    Nomor batch
                                                </FieldLabel>
                                                <Input
                                                    id={`batch-${lineIndex}`}
                                                    value={line.batch_no}
                                                    onChange={(event) =>
                                                        updateLine(lineIndex, {
                                                            batch_no:
                                                                event.target
                                                                    .value,
                                                        })
                                                    }
                                                    aria-invalid={Boolean(
                                                        error(
                                                            `${lineKey}.batch_no`,
                                                        ),
                                                    )}
                                                    aria-describedby={`batch-${lineIndex}-error`}
                                                />
                                                <FieldError
                                                    id={`batch-${lineIndex}-error`}
                                                >
                                                    {error(
                                                        `${lineKey}.batch_no`,
                                                    )}
                                                </FieldError>
                                            </Field>
                                        </div>
                                        <div className="grid gap-6 md:grid-cols-3">
                                            <Field
                                                data-invalid={Boolean(
                                                    error(
                                                        `${lineKey}.expires_on`,
                                                    ),
                                                )}
                                            >
                                                <FieldLabel
                                                    htmlFor={`expires-${lineIndex}`}
                                                >
                                                    Kedaluwarsa
                                                </FieldLabel>
                                                <Input
                                                    id={`expires-${lineIndex}`}
                                                    type="date"
                                                    value={line.expires_on}
                                                    onChange={(event) =>
                                                        updateLine(lineIndex, {
                                                            expires_on:
                                                                event.target
                                                                    .value,
                                                        })
                                                    }
                                                    aria-invalid={Boolean(
                                                        error(
                                                            `${lineKey}.expires_on`,
                                                        ),
                                                    )}
                                                    aria-describedby={`expires-${lineIndex}-help ${lineIndex}-expires-error`}
                                                />
                                                <FieldDescription
                                                    id={`expires-${lineIndex}-help`}
                                                >
                                                    Batch lewat tanggal tetap
                                                    dicatat sebagai ditahan.
                                                </FieldDescription>
                                                <FieldError
                                                    id={`${lineIndex}-expires-error`}
                                                >
                                                    {error(
                                                        `${lineKey}.expires_on`,
                                                    )}
                                                </FieldError>
                                            </Field>
                                            <Field
                                                data-invalid={Boolean(
                                                    error(
                                                        `${lineKey}.qty_delivery_note`,
                                                    ),
                                                )}
                                            >
                                                <FieldLabel
                                                    htmlFor={`delivery-note-qty-${lineIndex}`}
                                                >
                                                    Karton surat jalan
                                                </FieldLabel>
                                                <Input
                                                    id={`delivery-note-qty-${lineIndex}`}
                                                    type="number"
                                                    min={1}
                                                    step={1}
                                                    inputMode="numeric"
                                                    value={
                                                        line.qty_delivery_note
                                                    }
                                                    onChange={(event) =>
                                                        updateLine(lineIndex, {
                                                            qty_delivery_note:
                                                                event.target
                                                                    .value,
                                                        })
                                                    }
                                                    aria-invalid={Boolean(
                                                        error(
                                                            `${lineKey}.qty_delivery_note`,
                                                        ),
                                                    )}
                                                    aria-describedby={`delivery-note-qty-${lineIndex}-error`}
                                                />
                                                <FieldError
                                                    id={`delivery-note-qty-${lineIndex}-error`}
                                                >
                                                    {error(
                                                        `${lineKey}.qty_delivery_note`,
                                                    )}
                                                </FieldError>
                                            </Field>
                                            <Field
                                                data-invalid={Boolean(
                                                    error(
                                                        `${lineKey}.qty_physical`,
                                                    ),
                                                )}
                                            >
                                                <FieldLabel
                                                    htmlFor={`physical-qty-${lineIndex}`}
                                                >
                                                    Karton fisik
                                                </FieldLabel>
                                                <Input
                                                    id={`physical-qty-${lineIndex}`}
                                                    type="number"
                                                    min={1}
                                                    step={1}
                                                    inputMode="numeric"
                                                    value={line.qty_physical}
                                                    onChange={(event) =>
                                                        updateLine(lineIndex, {
                                                            qty_physical:
                                                                event.target
                                                                    .value,
                                                        })
                                                    }
                                                    aria-invalid={Boolean(
                                                        error(
                                                            `${lineKey}.qty_physical`,
                                                        ),
                                                    )}
                                                    aria-describedby={`physical-qty-${lineIndex}-error`}
                                                />
                                                <FieldError
                                                    id={`physical-qty-${lineIndex}-error`}
                                                >
                                                    {error(
                                                        `${lineKey}.qty_physical`,
                                                    )}
                                                </FieldError>
                                            </Field>
                                        </div>
                                        {hasDiscrepancy && (
                                            <Field
                                                data-invalid={Boolean(
                                                    error(
                                                        `${lineKey}.discrepancy_reason`,
                                                    ),
                                                )}
                                            >
                                                <FieldLabel
                                                    htmlFor={`discrepancy-${lineIndex}`}
                                                >
                                                    Alasan selisih
                                                </FieldLabel>
                                                <Textarea
                                                    className="min-h-20 resize-none"
                                                    id={`discrepancy-${lineIndex}`}
                                                    value={
                                                        line.discrepancy_reason
                                                    }
                                                    onChange={(event) =>
                                                        updateLine(lineIndex, {
                                                            discrepancy_reason:
                                                                event.target
                                                                    .value,
                                                        })
                                                    }
                                                    aria-invalid={Boolean(
                                                        error(
                                                            `${lineKey}.discrepancy_reason`,
                                                        ),
                                                    )}
                                                    aria-describedby={`discrepancy-${lineIndex}-error`}
                                                />
                                                <FieldError
                                                    id={`discrepancy-${lineIndex}-error`}
                                                >
                                                    {error(
                                                        `${lineKey}.discrepancy_reason`,
                                                    )}
                                                </FieldError>
                                            </Field>
                                        )}
                                        <Field
                                            data-invalid={Boolean(
                                                error(`${lineKey}.allocations`),
                                            )}
                                        >
                                            <FieldLabel>
                                                Alokasi valet
                                            </FieldLabel>
                                            <FieldDescription>
                                                Isi bisa dibagi ke beberapa
                                                valet. Kapasitas dihitung
                                                berdasarkan ukuran karton SKU.
                                            </FieldDescription>
                                            <FieldGroup>
                                                {line.allocations.map(
                                                    (
                                                        allocation,
                                                        allocationIndex,
                                                    ) => (
                                                        <div
                                                            className="grid gap-3 md:grid-cols-[minmax(0,1fr)_10rem_auto] md:items-end"
                                                            key={
                                                                allocationIndex
                                                            }
                                                        >
                                                            <Field
                                                                data-invalid={Boolean(
                                                                    error(
                                                                        `${lineKey}.allocations.${allocationIndex}.valet_id`,
                                                                    ),
                                                                )}
                                                            >
                                                                <FieldLabel
                                                                    htmlFor={`allocation-valet-${lineIndex}-${allocationIndex}`}
                                                                >
                                                                    Valet{' '}
                                                                    {allocationIndex +
                                                                        1}
                                                                </FieldLabel>
                                                                <ShadcnSelect
                                                                    value={String(
                                                                        allocation.valet_id,
                                                                    )}
                                                                    onValueChange={(
                                                                        value,
                                                                    ) =>
                                                                        updateAllocation(
                                                                            lineIndex,
                                                                            allocationIndex,
                                                                            {
                                                                                valet_id:
                                                                                    value,
                                                                            },
                                                                        )
                                                                    }
                                                                >
                                                                    <SelectTrigger
                                                                        id={`allocation-valet-${lineIndex}-${allocationIndex}`}
                                                                        aria-invalid={Boolean(
                                                                            error(
                                                                                `${lineKey}.allocations.${allocationIndex}.valet_id`,
                                                                            ),
                                                                        )}
                                                                    >
                                                                        <SelectValue placeholder="Pilih valet" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectGroup>
                                                                            {valets.map(
                                                                                (
                                                                                    valet,
                                                                                ) => (
                                                                                    <SelectItem
                                                                                        key={
                                                                                            valet.id
                                                                                        }
                                                                                        value={String(
                                                                                            valet.id,
                                                                                        )}
                                                                                    >
                                                                                        {
                                                                                            valet.code
                                                                                        }{' '}
                                                                                        —{' '}
                                                                                        {
                                                                                            valet
                                                                                                .row
                                                                                                .code
                                                                                        }
                                                                                    </SelectItem>
                                                                                ),
                                                                            )}
                                                                        </SelectGroup>
                                                                    </SelectContent>
                                                                </ShadcnSelect>
                                                                <FieldError>
                                                                    {error(
                                                                        `${lineKey}.allocations.${allocationIndex}.valet_id`,
                                                                    )}
                                                                </FieldError>
                                                            </Field>
                                                            <Field
                                                                data-invalid={Boolean(
                                                                    error(
                                                                        `${lineKey}.allocations.${allocationIndex}.qty`,
                                                                    ),
                                                                )}
                                                            >
                                                                <FieldLabel
                                                                    htmlFor={`allocation-qty-${lineIndex}-${allocationIndex}`}
                                                                >
                                                                    Karton
                                                                </FieldLabel>
                                                                <Input
                                                                    id={`allocation-qty-${lineIndex}-${allocationIndex}`}
                                                                    type="number"
                                                                    min={1}
                                                                    step={1}
                                                                    inputMode="numeric"
                                                                    value={
                                                                        allocation.qty
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        updateAllocation(
                                                                            lineIndex,
                                                                            allocationIndex,
                                                                            {
                                                                                qty: event
                                                                                    .target
                                                                                    .value,
                                                                            },
                                                                        )
                                                                    }
                                                                    aria-invalid={Boolean(
                                                                        error(
                                                                            `${lineKey}.allocations.${allocationIndex}.qty`,
                                                                        ),
                                                                    )}
                                                                />
                                                                <FieldError>
                                                                    {error(
                                                                        `${lineKey}.allocations.${allocationIndex}.qty`,
                                                                    )}
                                                                </FieldError>
                                                            </Field>
                                                            {line.allocations
                                                                .length > 1 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    aria-label={`Hapus alokasi ${allocationIndex + 1}`}
                                                                    onClick={() =>
                                                                        updateLine(
                                                                            lineIndex,
                                                                            {
                                                                                allocations:
                                                                                    line.allocations.filter(
                                                                                        (
                                                                                            _,
                                                                                            index,
                                                                                        ) =>
                                                                                            index !==
                                                                                            allocationIndex,
                                                                                    ),
                                                                            },
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2Icon />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ),
                                                )}
                                                <FieldError>
                                                    {error(
                                                        `${lineKey}.allocations`,
                                                    )}
                                                </FieldError>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-fit"
                                                    onClick={() =>
                                                        updateLine(lineIndex, {
                                                            allocations: [
                                                                ...line.allocations,
                                                                {
                                                                    valet_id:
                                                                        valets[0]
                                                                            ?.id ??
                                                                        '',
                                                                    qty: '',
                                                                },
                                                            ],
                                                        })
                                                    }
                                                >
                                                    <PlusIcon data-icon="inline-start" />
                                                    Tambah valet
                                                </Button>
                                            </FieldGroup>
                                        </Field>
                                    </FieldGroup>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Catatan penerimaan</CardTitle>
                        <CardDescription>
                            Opsional untuk konteks dokumen secara keseluruhan;
                            alasan selisih diisi pada baris SKU terkait.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Field
                            data-invalid={Boolean(error('discrepancy_reason'))}
                        >
                            <FieldLabel htmlFor="receiving-note">
                                Catatan
                            </FieldLabel>
                            <Textarea
                                className="min-h-24 resize-none"
                                id="receiving-note"
                                value={form.data.discrepancy_reason}
                                onChange={(event) =>
                                    form.setData(
                                        'discrepancy_reason',
                                        event.target.value,
                                    )
                                }
                                aria-invalid={Boolean(
                                    error('discrepancy_reason'),
                                )}
                                aria-describedby="receiving-note-error"
                            />
                            <FieldError id="receiving-note-error">
                                {error('discrepancy_reason')}
                            </FieldError>
                        </Field>
                    </CardContent>
                    <CardFooter className="justify-end gap-2">
                        <Link
                            href="/receiving"
                            className={buttonVariants({ variant: 'outline' })}
                        >
                            Batal
                        </Link>
                        <Button
                            type="submit"
                            disabled={
                                form.processing ||
                                companies.length === 0 ||
                                products.length === 0 ||
                                valets.length === 0
                            }
                        >
                            {form.processing ? (
                                <Spinner data-icon="inline-start" />
                            ) : (
                                <SaveIcon data-icon="inline-start" />
                            )}
                            {form.processing
                                ? 'Menyimpan...'
                                : 'Simpan draft penerimaan'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </form>
    );
}
