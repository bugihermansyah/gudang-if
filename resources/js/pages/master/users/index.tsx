import { Head, Link, router } from '@inertiajs/react';
import {
    PencilIcon,
    PlusIcon,
    SearchIcon,
    UserRoundIcon,
    XIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { Field, FieldLabel } from '@/components/ui/field';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from '@/components/ui/input-group';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
} from '@/components/ui/pagination';
import {
    Select as ShadcnSelect,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { RoleOption, UserRoleValue } from '@/components/master/user-form';

type User = {
    id: number;
    name: string;
    email: string;
    role: UserRoleValue;
    role_label: string;
    active: boolean;
    created_at: string | null;
};

type Page = {
    data: User[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
    total: number;
};

type Props = {
    users: Page;
    filters: { search: string; status: string; role: string };
    roleOptions: RoleOption[];
};

function UserStatusAction({ user }: { user: User }) {
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const submit = () => {
        setProcessing(true);
        router.patch(
            `/master/users/${user.id}/status`,
            { active: !user.active },
            {
                preserveScroll: true,
                only: ['users', 'filters'],
                onSuccess: () => setOpen(false),
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <AlertDialog
            open={open}
            onOpenChange={(value) => !processing && setOpen(value)}
        >
            <AlertDialogTrigger
                type="button"
                className={buttonVariants({
                    variant: user.active ? 'warning' : 'secondary',
                    size: 'sm',
                })}
            >
                {user.active ? 'Nonaktifkan' : 'Aktifkan'}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {user.active ? 'Nonaktifkan' : 'Aktifkan'} akun?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {user.active
                            ? `Akun ${user.name} tidak dapat masuk atau memakai aplikasi sampai diaktifkan kembali.`
                            : `Akun ${user.name} dapat masuk kembali dengan peran ${user.role_label}.`}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={processing}>
                        Batal
                    </AlertDialogCancel>
                    <AlertDialogAction
                        variant={user.active ? 'warning' : 'default'}
                        disabled={processing}
                        onClick={(event) => {
                            event.preventDefault();
                            submit();
                        }}
                    >
                        {processing && <Spinner data-icon="inline-start" />}
                        {processing
                            ? 'Menyimpan...'
                            : user.active
                              ? 'Nonaktifkan'
                              : 'Aktifkan'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default function UsersIndex({ users, filters, roleOptions }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);
    const [role, setRole] = useState(filters.role);
    const [isComposing, setIsComposing] = useState(false);
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        if (isComposing) return;

        const timeout = window.setTimeout(() => {
            router.get(
                '/master/users',
                {
                    search: search || undefined,
                    status,
                    role,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    only: ['users', 'filters'],
                },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [isComposing, role, search, status]);

    const emptyDataset =
        users.total === 0 &&
        !filters.search &&
        status === 'all' &&
        role === 'all';

    return (
        <>
            <Head title="Akun pengguna" />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Master data / Akun pengguna"
                    title="Akun pengguna"
                    description="Kelola identitas operator dan peran akses tanpa menghapus jejak aktivitas historis."
                    actions={
                        <Link
                            href="/master/users/create"
                            className={buttonVariants()}
                        >
                            <PlusIcon data-icon="inline-start" />
                            Tambah akun
                        </Link>
                    }
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar akun</CardTitle>
                        <CardDescription>
                            {users.total} akun tersimpan. Akun nonaktif tetap
                            dipertahankan agar histori dan audit tidak hilang.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-end">
                            <Field className="md:max-w-md">
                                <FieldLabel htmlFor="users-search">
                                    Cari akun
                                </FieldLabel>
                                <InputGroup>
                                    <InputGroupAddon>
                                        <SearchIcon aria-hidden="true" />
                                    </InputGroupAddon>
                                    <InputGroupInput
                                        id="users-search"
                                        type="search"
                                        value={search}
                                        placeholder="Nama atau email"
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        onCompositionStart={() =>
                                            setIsComposing(true)
                                        }
                                        onCompositionEnd={(event) => {
                                            setIsComposing(false);
                                            setSearch(
                                                event.currentTarget.value,
                                            );
                                        }}
                                    />
                                    {search && (
                                        <InputGroupAddon align="inline-end">
                                            <InputGroupButton
                                                size="icon-xs"
                                                aria-label="Bersihkan pencarian"
                                                onClick={() => setSearch('')}
                                            >
                                                <XIcon />
                                            </InputGroupButton>
                                        </InputGroupAddon>
                                    )}
                                </InputGroup>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="users-role">
                                    Peran
                                </FieldLabel>
                                <ShadcnSelect
                                    value={role}
                                    onValueChange={setRole}
                                >
                                    <SelectTrigger id="users-role">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="all">
                                                Semua peran
                                            </SelectItem>
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
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="users-status">
                                    Status
                                </FieldLabel>
                                <ShadcnSelect
                                    value={status}
                                    onValueChange={setStatus}
                                >
                                    <SelectTrigger id="users-status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="all">
                                                Semua status
                                            </SelectItem>
                                            <SelectItem value="active">
                                                Aktif
                                            </SelectItem>
                                            <SelectItem value="inactive">
                                                Nonaktif
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </ShadcnSelect>
                            </Field>
                        </div>

                        {users.data.length > 0 ? (
                            <Table aria-label="Daftar akun pengguna">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Peran</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">
                                            Tindakan
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">
                                                {user.name}
                                            </TableCell>
                                            <TableCell className="font-data text-sm">
                                                {user.email}
                                            </TableCell>
                                            <TableCell>
                                                {user.role_label}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        user.active
                                                            ? 'success'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {user.active
                                                        ? 'Aktif'
                                                        : 'Nonaktif'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={`/master/users/${user.id}/edit`}
                                                        className={buttonVariants(
                                                            {
                                                                variant:
                                                                    'outline',
                                                                size: 'sm',
                                                            },
                                                        )}
                                                    >
                                                        <PencilIcon data-icon="inline-start" />
                                                        Edit
                                                    </Link>
                                                    <UserStatusAction
                                                        user={user}
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <UserRoundIcon />
                                    </EmptyMedia>
                                    <EmptyTitle>
                                        {emptyDataset
                                            ? 'Belum ada akun pengguna'
                                            : 'Akun tidak ditemukan'}
                                    </EmptyTitle>
                                    <EmptyDescription>
                                        {emptyDataset
                                            ? 'Tambahkan akun pertama untuk operator gudang.'
                                            : 'Ubah pencarian atau bersihkan filter.'}
                                    </EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    {emptyDataset ? (
                                        <Link
                                            href="/master/users/create"
                                            className={buttonVariants()}
                                        >
                                            <PlusIcon data-icon="inline-start" />
                                            Tambah akun
                                        </Link>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setSearch('');
                                                setRole('all');
                                                setStatus('all');
                                            }}
                                        >
                                            Bersihkan filter
                                        </Button>
                                    )}
                                </EmptyContent>
                            </Empty>
                        )}

                        {users.last_page > 1 && (
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        {users.prev_page_url ? (
                                            <Link
                                                href={users.prev_page_url}
                                                className={buttonVariants({
                                                    variant: 'outline',
                                                    size: 'sm',
                                                })}
                                            >
                                                Sebelumnya
                                            </Link>
                                        ) : (
                                            <span className="px-3 py-2 text-sm text-muted-foreground">
                                                Sebelumnya
                                            </span>
                                        )}
                                    </PaginationItem>
                                    <PaginationItem>
                                        <span className="px-3 py-2 text-sm text-muted-foreground">
                                            Halaman {users.current_page} dari{' '}
                                            {users.last_page}
                                        </span>
                                    </PaginationItem>
                                    <PaginationItem>
                                        {users.next_page_url ? (
                                            <Link
                                                href={users.next_page_url}
                                                className={buttonVariants({
                                                    variant: 'outline',
                                                    size: 'sm',
                                                })}
                                            >
                                                Berikutnya
                                            </Link>
                                        ) : (
                                            <span className="px-3 py-2 text-sm text-muted-foreground">
                                                Berikutnya
                                            </span>
                                        )}
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </CardContent>
                </Card>
            </main>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [{ title: 'Akun pengguna', href: '/master/users' }],
};
