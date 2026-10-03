import { Link, router } from '@inertiajs/react';
import { PencilIcon, PlusIcon, SearchIcon, XIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Spinner } from '@/components/ui/spinner';

export type SimpleMasterItem = {
    id: number;
    code: string;
    name: string;
    active: boolean;
    valets_count?: number;
};

export type SimpleMasterPage = {
    data: SimpleMasterItem[];
    current_page: number;
    from: number | null;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};

type Props = {
    resource: 'companies' | 'rows';
    itemLabel: string;
    title: string;
    description: string;
    page: SimpleMasterPage;
    filters: { search: string; status: string };
};

function StatusToggleAction({
    item,
    resource,
    itemLabel,
}: {
    item: SimpleMasterItem;
    resource: Props['resource'];
    itemLabel: string;
}) {
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const nextStatus = item.active ? 'nonaktifkan' : 'aktifkan';

    const submit = () => {
        setProcessing(true);
        router.patch(
            `/master/${resource}/${item.id}/status`,
            { active: !item.active },
            {
                preserveScroll: true,
                only: [resource, 'filters'],
                onFinish: () => setProcessing(false),
                onSuccess: () => setOpen(false),
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
                    variant: item.active ? 'warning' : 'secondary',
                    size: 'sm',
                })}
            >
                {item.active ? 'Nonaktifkan' : 'Aktifkan'}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {item.active ? 'Nonaktifkan' : 'Aktifkan'} {itemLabel}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {item.active
                            ? `Data ${item.code} tidak akan muncul pada pilihan baru, tetapi tetap dipertahankan untuk riwayat transaksi.`
                            : `Data ${item.code} akan tersedia kembali pada pilihan transaksi.`}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={processing}>
                        Batal
                    </AlertDialogCancel>
                    <AlertDialogAction
                        variant={item.active ? 'warning' : 'default'}
                        disabled={processing}
                        onClick={(event) => {
                            event.preventDefault();
                            submit();
                        }}
                    >
                        {processing && <Spinner data-icon="inline-start" />}
                        {processing ? 'Menyimpan...' : nextStatus}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export function SimpleMasterIndex({
    resource,
    itemLabel,
    title,
    description,
    page,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);
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
                `/master/${resource}`,
                { search: search || undefined, status },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    only: [resource, 'filters'],
                },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [isComposing, resource, search, status]);

    const emptyDataset =
        page.total === 0 && !filters.search && status === 'all';

    return (
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <PageHeader
                eyebrow={`Master data / ${itemLabel}`}
                title={title}
                description={description}
                actions={
                    <Link
                        href={`/master/${resource}/create`}
                        className={buttonVariants()}
                    >
                        <PlusIcon data-icon="inline-start" />
                        Tambah {itemLabel}
                    </Link>
                }
            />

            <Card>
                <CardHeader>
                    <CardTitle>Daftar {itemLabel}</CardTitle>
                    <CardDescription>
                        {page.total} {itemLabel} tersimpan. Data nonaktif tetap
                        dipertahankan untuk riwayat transaksi.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end">
                        <Field className="md:max-w-md">
                            <FieldLabel htmlFor={`${resource}-search`}>
                                Cari {itemLabel}
                            </FieldLabel>
                            <InputGroup>
                                <InputGroupAddon>
                                    <SearchIcon aria-hidden="true" />
                                </InputGroupAddon>
                                <InputGroupInput
                                    id={`${resource}-search`}
                                    type="search"
                                    value={search}
                                    placeholder={`Kode atau nama ${itemLabel}`}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    onCompositionStart={() =>
                                        setIsComposing(true)
                                    }
                                    onCompositionEnd={(event) => {
                                        setIsComposing(false);
                                        setSearch(event.currentTarget.value);
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
                            <FieldLabel htmlFor={`${resource}-status`}>
                                Status
                            </FieldLabel>
                            <ShadcnSelect
                                value={status}
                                onValueChange={setStatus}
                            >
                                <SelectTrigger id={`${resource}-status`}>
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

                    {page.data.length > 0 ? (
                        <Table aria-label={`Daftar ${itemLabel}`}>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kode</TableHead>
                                    <TableHead>Nama</TableHead>
                                    {resource === 'rows' && (
                                        <TableHead>Valet</TableHead>
                                    )}
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Tindakan
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {page.data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-data font-semibold">
                                            {item.code}
                                        </TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        {resource === 'rows' && (
                                            <TableCell>
                                                {item.valets_count ?? 0}
                                            </TableCell>
                                        )}
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    item.active
                                                        ? 'success'
                                                        : 'secondary'
                                                }
                                            >
                                                {item.active
                                                    ? 'Aktif'
                                                    : 'Nonaktif'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/master/${resource}/${item.id}/edit`}
                                                    className={buttonVariants({
                                                        variant: 'outline',
                                                        size: 'sm',
                                                    })}
                                                >
                                                    <PencilIcon data-icon="inline-start" />
                                                    Edit
                                                </Link>
                                                <StatusToggleAction
                                                    item={item}
                                                    resource={resource}
                                                    itemLabel={itemLabel}
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
                                    <SearchIcon />
                                </EmptyMedia>
                                <EmptyTitle>
                                    {emptyDataset
                                        ? `Belum ada ${itemLabel}`
                                        : `${itemLabel} tidak ditemukan`}
                                </EmptyTitle>
                                <EmptyDescription>
                                    {emptyDataset
                                        ? `Tambahkan ${itemLabel} pertama untuk dipakai pada transaksi.`
                                        : 'Ubah kata pencarian atau bersihkan filter status.'}
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                {emptyDataset ? (
                                    <Link
                                        href={`/master/${resource}/create`}
                                        className={buttonVariants()}
                                    >
                                        <PlusIcon data-icon="inline-start" />
                                        Tambah {itemLabel}
                                    </Link>
                                ) : (
                                    <button
                                        type="button"
                                        className={buttonVariants({
                                            variant: 'outline',
                                        })}
                                        onClick={() => {
                                            setSearch('');
                                            setStatus('all');
                                        }}
                                    >
                                        Bersihkan filter
                                    </button>
                                )}
                            </EmptyContent>
                        </Empty>
                    )}

                    {page.last_page > 1 && (
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    {page.prev_page_url ? (
                                        <Link
                                            href={page.prev_page_url}
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
                                        Halaman {page.current_page} dari{' '}
                                        {page.last_page}
                                    </span>
                                </PaginationItem>
                                <PaginationItem>
                                    {page.next_page_url ? (
                                        <Link
                                            href={page.next_page_url}
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
    );
}
