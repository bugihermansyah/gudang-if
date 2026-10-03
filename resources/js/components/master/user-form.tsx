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

export type UserRoleValue = 'petugas_gudang' | 'supervisor' | 'admin';

export type UserFormData = {
    id?: number;
    name: string;
    email: string;
    role: UserRoleValue;
    password: string;
    password_confirmation: string;
};

export type RoleOption = { value: UserRoleValue; label: string };

type Props = {
    roleOptions: RoleOption[];
    user?: Omit<UserFormData, 'password' | 'password_confirmation'> & {
        active: boolean;
    };
};

export function UserForm({ roleOptions, user }: Props) {
    const form = useForm<UserFormData>({
        name: user?.name ?? '',
        email: user?.email ?? '',
        role: user?.role ?? 'petugas_gudang',
        password: '',
        password_confirmation: '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (user?.id) {
            form.put(`/master/users/${user.id}`, { preserveScroll: true });

            return;
        }

        form.post('/master/users', { preserveScroll: true });
    };

    return (
        <form noValidate onSubmit={submit}>
            <Card>
                <CardHeader>
                    <CardTitle>
                        {user ? 'Perbarui akun' : 'Identitas akun'}
                    </CardTitle>
                    <CardDescription>
                        Setiap operator memakai akun sendiri agar hak akses dan
                        jejak aktivitas dapat ditelusuri.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FieldGroup>
                        <div className="grid gap-6 md:grid-cols-2">
                            <Field data-invalid={Boolean(form.errors.name)}>
                                <FieldLabel htmlFor="user-name">
                                    Nama pengguna
                                </FieldLabel>
                                <Input
                                    id="user-name"
                                    autoComplete="name"
                                    required
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                    aria-invalid={Boolean(form.errors.name)}
                                    aria-describedby={
                                        form.errors.name
                                            ? 'user-name-error'
                                            : undefined
                                    }
                                />
                                <FieldError id="user-name-error">
                                    {form.errors.name}
                                </FieldError>
                            </Field>

                            <Field data-invalid={Boolean(form.errors.email)}>
                                <FieldLabel htmlFor="user-email">
                                    Email login
                                </FieldLabel>
                                <Input
                                    id="user-email"
                                    type="email"
                                    autoComplete="username"
                                    required
                                    value={form.data.email}
                                    onChange={(event) =>
                                        form.setData(
                                            'email',
                                            event.target.value,
                                        )
                                    }
                                    aria-invalid={Boolean(form.errors.email)}
                                    aria-describedby={
                                        form.errors.email
                                            ? 'user-email-error'
                                            : undefined
                                    }
                                />
                                <FieldError id="user-email-error">
                                    {form.errors.email}
                                </FieldError>
                            </Field>

                            <Field data-invalid={Boolean(form.errors.role)}>
                                <FieldLabel htmlFor="user-role">
                                    Peran
                                </FieldLabel>
                                <ShadcnSelect
                                    value={form.data.role}
                                    onValueChange={(value) =>
                                        form.setData(
                                            'role',
                                            value as UserRoleValue,
                                        )
                                    }
                                >
                                    <SelectTrigger
                                        id="user-role"
                                        aria-describedby={
                                            form.errors.role
                                                ? 'user-role-help user-role-error'
                                                : 'user-role-help'
                                        }
                                        aria-invalid={Boolean(form.errors.role)}
                                    >
                                        <SelectValue placeholder="Pilih peran" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {roleOptions.map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </ShadcnSelect>
                                <FieldDescription id="user-role-help">
                                    Hak akses mengikuti peran yang dipilih.
                                </FieldDescription>
                                <FieldError id="user-role-error">
                                    {form.errors.role}
                                </FieldError>
                            </Field>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Field data-invalid={Boolean(form.errors.password)}>
                                <FieldLabel htmlFor="user-password">
                                    {user
                                        ? 'Kata sandi baru (opsional)'
                                        : 'Kata sandi'}
                                </FieldLabel>
                                <Input
                                    id="user-password"
                                    type="password"
                                    autoComplete="new-password"
                                    required={!user}
                                    value={form.data.password}
                                    onChange={(event) =>
                                        form.setData(
                                            'password',
                                            event.target.value,
                                        )
                                    }
                                    aria-invalid={Boolean(form.errors.password)}
                                    aria-describedby={
                                        form.errors.password
                                            ? 'user-password-help user-password-error'
                                            : 'user-password-help'
                                    }
                                />
                                <FieldDescription id="user-password-help">
                                    Gunakan kata sandi kuat dan jangan
                                    dibagikan.
                                </FieldDescription>
                                <FieldError id="user-password-error">
                                    {form.errors.password}
                                </FieldError>
                            </Field>

                            <Field
                                data-invalid={Boolean(
                                    form.errors.password_confirmation,
                                )}
                            >
                                <FieldLabel htmlFor="user-password-confirmation">
                                    Konfirmasi kata sandi
                                </FieldLabel>
                                <Input
                                    id="user-password-confirmation"
                                    type="password"
                                    autoComplete="new-password"
                                    value={form.data.password_confirmation}
                                    onChange={(event) =>
                                        form.setData(
                                            'password_confirmation',
                                            event.target.value,
                                        )
                                    }
                                    aria-invalid={Boolean(
                                        form.errors.password_confirmation,
                                    )}
                                    aria-describedby={
                                        form.errors.password_confirmation
                                            ? 'user-password-confirmation-error'
                                            : undefined
                                    }
                                />
                                <FieldError id="user-password-confirmation-error">
                                    {form.errors.password_confirmation}
                                </FieldError>
                            </Field>
                        </div>
                    </FieldGroup>
                </CardContent>
                <CardFooter className="justify-end gap-2">
                    <Link
                        href="/master/users"
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
                        {form.processing ? 'Menyimpan...' : 'Simpan akun'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
