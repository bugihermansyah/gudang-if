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
import { Spinner } from '@/components/ui/spinner';

type CodeNameData = {
    id?: number;
    code: string;
    name: string;
};

type Props = {
    resource: 'companies' | 'rows';
    title: string;
    description: string;
    itemLabel: string;
    codeLabel: string;
    item?: CodeNameData;
};

export function CodeNameForm({
    resource,
    title,
    description,
    itemLabel,
    codeLabel,
    item,
}: Props) {
    const form = useForm<CodeNameData>({
        code: item?.code ?? '',
        name: item?.name ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (item?.id) {
            form.put(`/master/${resource}/${item.id}`, {
                preserveScroll: true,
            });

            return;
        }

        form.post(`/master/${resource}`, { preserveScroll: true });
    };

    return (
        <form noValidate onSubmit={submit}>
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <FieldGroup>
                        <div className="grid gap-6 md:grid-cols-2">
                            <Field data-invalid={Boolean(form.errors.code)}>
                                <FieldLabel htmlFor="master-code">
                                    {codeLabel}
                                </FieldLabel>
                                <Input
                                    id="master-code"
                                    name="code"
                                    autoComplete="off"
                                    value={form.data.code}
                                    onChange={(event) =>
                                        form.setData('code', event.target.value)
                                    }
                                    aria-invalid={Boolean(form.errors.code)}
                                    aria-describedby={
                                        form.errors.code
                                            ? 'master-code-error'
                                            : 'master-code-help'
                                    }
                                />
                                <FieldDescription id="master-code-help">
                                    Kode unik, dinormalisasi menjadi huruf
                                    besar.
                                </FieldDescription>
                                <FieldError id="master-code-error">
                                    {form.errors.code}
                                </FieldError>
                            </Field>

                            <Field data-invalid={Boolean(form.errors.name)}>
                                <FieldLabel htmlFor="master-name">
                                    Nama {itemLabel}
                                </FieldLabel>
                                <Input
                                    id="master-name"
                                    name="name"
                                    autoComplete="off"
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                    aria-invalid={Boolean(form.errors.name)}
                                    aria-describedby={
                                        form.errors.name
                                            ? 'master-name-error'
                                            : undefined
                                    }
                                />
                                <FieldError id="master-name-error">
                                    {form.errors.name}
                                </FieldError>
                            </Field>
                        </div>
                    </FieldGroup>
                </CardContent>
                <CardFooter className="justify-end gap-2">
                    <Link
                        href={`/master/${resource}`}
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
                        {form.processing
                            ? 'Menyimpan...'
                            : `Simpan ${itemLabel}`}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
