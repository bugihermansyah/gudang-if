import { Link, useForm } from '@inertiajs/react';
import { SaveIcon } from 'lucide-react';
import type { FormEvent } from 'react';
import { buttonVariants, Button } from '@/components/ui/button';
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

type RowOption = { id: number; code: string; name: string };
type StatusOption = { value: string; label: string };

export type ValetData = {
    id?: number;
    code: string;
    row_id: string | number;
    status: string;
    label_color: string;
};

export function ValetForm({
    valet,
    rows,
    statusOptions,
}: {
    valet?: ValetData;
    rows: RowOption[];
    statusOptions: StatusOption[];
}) {
    const form = useForm<ValetData>({
        code: valet?.code ?? '',
        row_id: valet?.row_id ?? '',
        status: valet?.status ?? 'aktif',
        label_color: valet?.label_color ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (valet?.id) {
            form.put(`/master/valets/${valet.id}`, { preserveScroll: true });

            return;
        }

        form.post('/master/valets', { preserveScroll: true });
    };

    return (
        <form noValidate onSubmit={submit}>
            <Card>
                <CardHeader>
                    <CardTitle>Identitas dan penempatan valet</CardTitle>
                    <CardDescription>
                        Kode valet permanen. Valet fisik tetap berada di gudang
                        dan dapat dipindahkan row melalui alur mutasi.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FieldGroup>
                        <div className="grid gap-6 md:grid-cols-2">
                            <Field data-invalid={Boolean(form.errors.code)}>
                                <FieldLabel htmlFor="valet-code">
                                    Kode valet
                                </FieldLabel>
                                <Input
                                    id="valet-code"
                                    name="code"
                                    autoComplete="off"
                                    value={form.data.code}
                                    onChange={(event) =>
                                        form.setData('code', event.target.value)
                                    }
                                    aria-invalid={Boolean(form.errors.code)}
                                    aria-describedby={
                                        form.errors.code
                                            ? 'valet-code-error'
                                            : 'valet-code-help'
                                    }
                                />
                                <FieldDescription id="valet-code-help">
                                    Kode unik yang dapat dipindai, misalnya
                                    VAL-001.
                                </FieldDescription>
                                <FieldError id="valet-code-error">
                                    {form.errors.code}
                                </FieldError>
                            </Field>

                            <Field data-invalid={Boolean(form.errors.row_id)}>
                                <FieldLabel htmlFor="valet-row">
                                    Row aktif
                                </FieldLabel>
                                <ShadcnSelect
                                    value={String(form.data.row_id)}
                                    onValueChange={(value) =>
                                        form.setData('row_id', value)
                                    }
                                >
                                    <SelectTrigger
                                        id="valet-row"
                                        aria-invalid={Boolean(
                                            form.errors.row_id,
                                        )}
                                        aria-describedby={
                                            form.errors.row_id
                                                ? 'valet-row-error'
                                                : undefined
                                        }
                                    >
                                        <SelectValue placeholder="Pilih row" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {rows.map((row) => (
                                                <SelectItem
                                                    key={row.id}
                                                    value={String(row.id)}
                                                >
                                                    {row.code} — {row.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </ShadcnSelect>
                                <FieldError id="valet-row-error">
                                    {form.errors.row_id}
                                </FieldError>
                            </Field>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Field data-invalid={Boolean(form.errors.status)}>
                                <FieldLabel htmlFor="valet-status">
                                    Status valet
                                </FieldLabel>
                                <ShadcnSelect
                                    value={form.data.status}
                                    onValueChange={(value) =>
                                        form.setData('status', value)
                                    }
                                >
                                    <SelectTrigger
                                        id="valet-status"
                                        aria-invalid={Boolean(
                                            form.errors.status,
                                        )}
                                        aria-describedby={
                                            form.errors.status
                                                ? 'valet-status-error'
                                                : undefined
                                        }
                                    >
                                        <SelectValue placeholder="Pilih status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {statusOptions.map((status) => (
                                                <SelectItem
                                                    key={status.value}
                                                    value={status.value}
                                                >
                                                    {status.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </ShadcnSelect>
                                <FieldError id="valet-status-error">
                                    {form.errors.status}
                                </FieldError>
                            </Field>

                            <Field
                                data-invalid={Boolean(form.errors.label_color)}
                            >
                                <FieldLabel htmlFor="label-color">
                                    Warna label (opsional)
                                </FieldLabel>
                                <Input
                                    id="label-color"
                                    name="label_color"
                                    autoComplete="off"
                                    value={form.data.label_color}
                                    onChange={(event) =>
                                        form.setData(
                                            'label_color',
                                            event.target.value,
                                        )
                                    }
                                    aria-invalid={Boolean(
                                        form.errors.label_color,
                                    )}
                                    aria-describedby={
                                        form.errors.label_color
                                            ? 'label-color-error'
                                            : 'label-color-help'
                                    }
                                />
                                <FieldDescription id="label-color-help">
                                    Petunjuk visual tambahan; bukan identitas
                                    resmi valet.
                                </FieldDescription>
                                <FieldError id="label-color-error">
                                    {form.errors.label_color}
                                </FieldError>
                            </Field>
                        </div>
                    </FieldGroup>
                </CardContent>
                <CardFooter className="justify-end gap-2">
                    <Link
                        href="/master/valets"
                        className={buttonVariants({ variant: 'outline' })}
                    >
                        Batal
                    </Link>
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? (
                            <Spinner data-icon="inline-start" />
                        ) : (
                            <SaveIcon data-icon="inline-start" />
                        )}
                        {form.processing ? 'Menyimpan...' : 'Simpan valet'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
