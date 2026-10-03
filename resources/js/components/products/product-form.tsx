import { Link, useForm } from '@inertiajs/react';
import { SaveIcon } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
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
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

export type ProductData = {
    id?: number;
    sku: string;
    name: string;
    max_cartons_per_valet: number | string;
    carton_size_note: string;
};

export function ProductForm({ product }: { product?: ProductData }) {
    const form = useForm<ProductData>({
        sku: product?.sku ?? '',
        name: product?.name ?? '',
        max_cartons_per_valet: product?.max_cartons_per_valet ?? '',
        carton_size_note: product?.carton_size_note ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (product?.id) {
            form.put(`/master/products/${product.id}`, {
                preserveScroll: true,
            });

            return;
        }

        form.post('/master/products', { preserveScroll: true });
    };

    return (
        <form noValidate onSubmit={submit}>
            <Card>
                <CardHeader>
                    <CardTitle>Identitas dan kapasitas SKU</CardTitle>
                    <CardDescription>
                        Kapasitas dipakai untuk menghitung muatan setiap valet,
                        termasuk valet campuran.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FieldGroup>
                        <div className="grid gap-6 md:grid-cols-2">
                            <Field data-invalid={Boolean(form.errors.sku)}>
                                <FieldLabel htmlFor="sku">Kode SKU</FieldLabel>
                                <Input
                                    id="sku"
                                    name="sku"
                                    autoComplete="off"
                                    value={form.data.sku}
                                    onChange={(event) =>
                                        form.setData('sku', event.target.value)
                                    }
                                    aria-invalid={Boolean(form.errors.sku)}
                                    aria-describedby={
                                        form.errors.sku
                                            ? 'sku-error'
                                            : 'sku-help'
                                    }
                                />
                                <FieldDescription id="sku-help">
                                    Kode unik, misalnya CK-A-001.
                                </FieldDescription>
                                <FieldError id="sku-error">
                                    {form.errors.sku}
                                </FieldError>
                            </Field>

                            <Field data-invalid={Boolean(form.errors.name)}>
                                <FieldLabel htmlFor="name">
                                    Nama produk
                                </FieldLabel>
                                <Input
                                    id="name"
                                    name="name"
                                    autoComplete="off"
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                    aria-invalid={Boolean(form.errors.name)}
                                    aria-describedby={
                                        form.errors.name
                                            ? 'name-error'
                                            : undefined
                                    }
                                />
                                <FieldError id="name-error">
                                    {form.errors.name}
                                </FieldError>
                            </Field>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Field
                                data-invalid={Boolean(
                                    form.errors.max_cartons_per_valet,
                                )}
                            >
                                <FieldLabel htmlFor="max_cartons_per_valet">
                                    Maksimum karton per valet
                                </FieldLabel>
                                <Input
                                    id="max_cartons_per_valet"
                                    name="max_cartons_per_valet"
                                    type="number"
                                    inputMode="numeric"
                                    min={1}
                                    step={1}
                                    value={form.data.max_cartons_per_valet}
                                    onChange={(event) =>
                                        form.setData(
                                            'max_cartons_per_valet',
                                            event.target.value,
                                        )
                                    }
                                    aria-invalid={Boolean(
                                        form.errors.max_cartons_per_valet,
                                    )}
                                    aria-describedby={
                                        form.errors.max_cartons_per_valet
                                            ? 'capacity-error'
                                            : 'capacity-help'
                                    }
                                />
                                <FieldDescription id="capacity-help">
                                    Bilangan bulat positif sesuai ukuran karton
                                    SKU.
                                </FieldDescription>
                                <FieldError id="capacity-error">
                                    {form.errors.max_cartons_per_valet}
                                </FieldError>
                            </Field>

                            <Field
                                data-invalid={Boolean(
                                    form.errors.carton_size_note,
                                )}
                            >
                                <FieldLabel htmlFor="carton_size_note">
                                    Catatan ukuran karton
                                </FieldLabel>
                                <Textarea
                                    className="min-h-24 resize-none"
                                    id="carton_size_note"
                                    name="carton_size_note"
                                    rows={3}
                                    value={form.data.carton_size_note}
                                    onChange={(event) =>
                                        form.setData(
                                            'carton_size_note',
                                            event.target.value,
                                        )
                                    }
                                    aria-invalid={Boolean(
                                        form.errors.carton_size_note,
                                    )}
                                    aria-describedby={
                                        form.errors.carton_size_note
                                            ? 'carton-note-error'
                                            : undefined
                                    }
                                />
                                <FieldError id="carton-note-error">
                                    {form.errors.carton_size_note}
                                </FieldError>
                            </Field>
                        </div>
                    </FieldGroup>
                </CardContent>
                <CardFooter className="justify-end gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/master/products">Batal</Link>
                    </Button>
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? (
                            <Spinner data-icon="inline-start" />
                        ) : (
                            <SaveIcon data-icon="inline-start" />
                        )}
                        Simpan produk
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
