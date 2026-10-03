import { Head, Link, router } from '@inertiajs/react';
import { PencilIcon, PlusIcon, SearchIcon, XIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
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

type Valet = {
    id: number;
    code: string;
    status: 'aktif' | 'perawatan' | 'nonaktif';
    row: { code: string; name: string };
    stocks_sum_qty_on_hand: number | null;
};
type Page = {
    data: Valet[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
    total: number;
};

const statusLabel: Record<Valet['status'], string> = {
    aktif: 'Aktif',
    perawatan: 'Perawatan',
    nonaktif: 'Nonaktif',
};

export default function ValetsIndex({
    valets,
    filters,
}: {
    valets: Page;
    filters: { search: string; status: string };
}) {
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
        const timeout = window.setTimeout(
            () =>
                router.get(
                    '/master/valets',
                    { search: search || undefined, status },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                        only: ['valets', 'filters'],
                    },
                ),
            300,
        );
        return () => window.clearTimeout(timeout);
    }, [isComposing, search, status]);

    return (
        <>
            <Head title="Valet" />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Master data / Valet"
                    title="Valet gudang"
                    description="Valet berkode unik tetap berada di gudang dan selalu terhubung ke satu row aktif."
                    actions={
                        <Link
                            href="/master/valets/create"
                            className={buttonVariants()}
                        >
                            <PlusIcon data-icon="inline-start" />
                            Tambah valet
                        </Link>
                    }
                />
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar valet</CardTitle>
                        <CardDescription>
                            {valets.total} valet tersimpan. Isi fisik dihitung
                            dari saldo valet dan tidak berubah saat valet
                            berpindah row.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-end">
                            <Field className="md:max-w-md">
                                <FieldLabel htmlFor="valet-search">
                                    Cari valet
                                </FieldLabel>
                                <InputGroup>
                                    <InputGroupAddon>
                                        <SearchIcon aria-hidden="true" />
                                    </InputGroupAddon>
                                    <InputGroupInput
                                        id="valet-search"
                                        type="search"
                                        value={search}
                                        placeholder="Kode valet atau row"
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
                                <FieldLabel htmlFor="valet-status">
                                    Status
                                </FieldLabel>
                                <ShadcnSelect
                                    value={status}
                                    onValueChange={setStatus}
                                >
                                    <SelectTrigger id="valet-status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="all">
                                                Semua status
                                            </SelectItem>
                                            <SelectItem value="aktif">
                                                Aktif
                                            </SelectItem>
                                            <SelectItem value="perawatan">
                                                Perawatan
                                            </SelectItem>
                                            <SelectItem value="nonaktif">
                                                Nonaktif
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </ShadcnSelect>
                            </Field>
                        </div>
                        {valets.data.length > 0 ? (
                            <Table aria-label="Daftar valet">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Kode valet</TableHead>
                                        <TableHead>Row</TableHead>
                                        <TableHead>Karton fisik</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">
                                            Tindakan
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {valets.data.map((valet) => (
                                        <TableRow key={valet.id}>
                                            <TableCell className="font-data font-semibold">
                                                {valet.code}
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-data">
                                                    {valet.row.code}
                                                </span>
                                                <span className="ml-2 text-muted-foreground">
                                                    {valet.row.name}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {valet.stocks_sum_qty_on_hand ??
                                                    0}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        valet.status === 'aktif'
                                                            ? 'success'
                                                            : valet.status ===
                                                                'perawatan'
                                                              ? 'warning'
                                                              : 'secondary'
                                                    }
                                                >
                                                    {statusLabel[valet.status]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link
                                                    href={`/master/valets/${valet.id}/edit`}
                                                    className={buttonVariants({
                                                        variant: 'outline',
                                                        size: 'sm',
                                                    })}
                                                >
                                                    <PencilIcon data-icon="inline-start" />
                                                    Edit
                                                </Link>
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
                                        {filters.search || status !== 'all'
                                            ? 'Valet tidak ditemukan'
                                            : 'Belum ada valet'}
                                    </EmptyTitle>
                                    <EmptyDescription>
                                        {filters.search || status !== 'all'
                                            ? 'Ubah pencarian atau status.'
                                            : 'Tambahkan valet pertama dan tempatkan pada row aktif.'}
                                    </EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    <Link
                                        href="/master/valets/create"
                                        className={buttonVariants()}
                                    >
                                        <PlusIcon data-icon="inline-start" />
                                        Tambah valet
                                    </Link>
                                </EmptyContent>
                            </Empty>
                        )}
                        {valets.last_page > 1 && (
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        {valets.prev_page_url ? (
                                            <Link
                                                href={valets.prev_page_url}
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
                                            Halaman {valets.current_page} dari{' '}
                                            {valets.last_page}
                                        </span>
                                    </PaginationItem>
                                    <PaginationItem>
                                        {valets.next_page_url ? (
                                            <Link
                                                href={valets.next_page_url}
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

ValetsIndex.layout = {
    breadcrumbs: [{ title: 'Valet', href: '/master/valets' }],
};
