import { Head, Link, router } from '@inertiajs/react';
import {
    ClipboardPlusIcon,
    EyeIcon,
    PlusIcon,
    SearchIcon,
    XIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { PageHeader } from '@/components/page-header';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

type ReceivingDocument = {
    id: number;
    internal_no: string;
    external_delivery_note_no: string;
    company: { code: string; name: string };
    vehicle_plate: string;
    driver_name: string;
    status: string;
    unloading_started_at: string | null;
    unloading_finished_at: string | null;
    created_at: string;
};
type PaginatedDocuments = {
    data: ReceivingDocument[];
    current_page: number;
    from: number | null;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};
type Filter = { search: string; status: string };
type StatusOption = { value: string; label: string };

const statusLabels: Record<string, string> = {
    draft: 'Draft',
    bongkar: 'Sedang bongkar',
    siap_finalisasi: 'Siap difinalisasi',
    selesai: 'Selesai',
    dibatalkan: 'Dibatalkan',
};

function formatDate(value: string | null) {
    if (!value) return '—';
    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

export default function ReceivingIndex({
    documents,
    filters,
    statusOptions,
}: {
    documents: PaginatedDocuments;
    filters: Filter;
    statusOptions: StatusOption[];
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
        const timeout = window.setTimeout(() => {
            router.get(
                '/receiving',
                { search: search || undefined, status },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    only: ['documents', 'filters'],
                },
            );
        }, 300);
        return () => window.clearTimeout(timeout);
    }, [isComposing, search, status]);

    const emptyDataset =
        documents.total === 0 && !filters.search && filters.status === 'all';

    return (
        <>
            <Head title="Barang masuk" />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Operasional / F-03"
                    title="Barang masuk"
                    description="Catat surat jalan eksternal, hasil bongkar, batch, kedaluwarsa, dan alokasi karton ke valet."
                    actions={
                        <Link
                            href="/receiving/create"
                            className={buttonVariants()}
                        >
                            <PlusIcon data-icon="inline-start" />
                            Buat penerimaan
                        </Link>
                    }
                />
                <Card>
                    <CardHeader>
                        <CardTitle>Dokumen penerimaan</CardTitle>
                        <CardDescription>
                            {documents.total} dokumen tersimpan. Draft belum
                            mengubah saldo stok.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-end">
                            <Field className="md:max-w-md">
                                <FieldLabel htmlFor="receiving-search">
                                    Cari dokumen
                                </FieldLabel>
                                <InputGroup>
                                    <InputGroupAddon>
                                        <SearchIcon aria-hidden="true" />
                                    </InputGroupAddon>
                                    <InputGroupInput
                                        id="receiving-search"
                                        type="search"
                                        value={search}
                                        placeholder="Nomor internal atau surat jalan"
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
                                <FieldLabel htmlFor="receiving-status">
                                    Status
                                </FieldLabel>
                                <ShadcnSelect
                                    value={status}
                                    onValueChange={setStatus}
                                >
                                    <SelectTrigger id="receiving-status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="all">
                                                Semua status
                                            </SelectItem>
                                            {statusOptions.map((option) => (
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
                        </div>

                        {documents.data.length > 0 ? (
                            <>
                                <Table aria-label="Daftar dokumen barang masuk">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                Nomor internal
                                            </TableHead>
                                            <TableHead>
                                                Surat jalan / PT asal
                                            </TableHead>
                                            <TableHead>Angkutan</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Mulai bongkar</TableHead>
                                            <TableHead className="text-right">
                                                Tindakan
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {documents.data.map((document) => (
                                            <TableRow key={document.id}>
                                                <TableCell>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-data font-semibold">
                                                            {
                                                                document.internal_no
                                                            }
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            Dibuat{' '}
                                                            {formatDate(
                                                                document.created_at,
                                                            )}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-medium">
                                                            {
                                                                document.external_delivery_note_no
                                                            }
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {
                                                                document.company
                                                                    .code
                                                            }{' '}
                                                            —{' '}
                                                            {
                                                                document.company
                                                                    .name
                                                            }
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-data">
                                                            {
                                                                document.vehicle_plate
                                                            }
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {
                                                                document.driver_name
                                                            }
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            document.status ===
                                                            'selesai'
                                                                ? 'success'
                                                                : document.status ===
                                                                    'dibatalkan'
                                                                  ? 'secondary'
                                                                  : 'warning'
                                                        }
                                                    >
                                                        {statusLabels[
                                                            document.status
                                                        ] ?? document.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(
                                                        document.unloading_started_at,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex justify-end">
                                                        <Link
                                                            className={cn(
                                                                buttonVariants({
                                                                    variant:
                                                                        'outline',
                                                                    size: 'sm',
                                                                }),
                                                            )}
                                                            href={`/receiving/${document.id}`}
                                                        >
                                                            <EyeIcon data-icon="inline-start" />
                                                            Buka
                                                        </Link>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                                    <p aria-live="polite">
                                        Menampilkan {documents.from}–
                                        {documents.to} dari {documents.total}{' '}
                                        dokumen
                                    </p>
                                    <Pagination className="mx-0 w-auto">
                                        <PaginationContent>
                                            <PaginationItem>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={
                                                        !documents.prev_page_url
                                                    }
                                                    asChild={Boolean(
                                                        documents.prev_page_url,
                                                    )}
                                                >
                                                    {documents.prev_page_url ? (
                                                        <Link
                                                            href={
                                                                documents.prev_page_url
                                                            }
                                                            preserveState
                                                            preserveScroll
                                                        >
                                                            Sebelumnya
                                                        </Link>
                                                    ) : (
                                                        'Sebelumnya'
                                                    )}
                                                </Button>
                                            </PaginationItem>
                                            <PaginationItem>
                                                <span className="px-2 font-data text-foreground">
                                                    {documents.current_page} /{' '}
                                                    {documents.last_page}
                                                </span>
                                            </PaginationItem>
                                            <PaginationItem>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={
                                                        !documents.next_page_url
                                                    }
                                                    asChild={Boolean(
                                                        documents.next_page_url,
                                                    )}
                                                >
                                                    {documents.next_page_url ? (
                                                        <Link
                                                            href={
                                                                documents.next_page_url
                                                            }
                                                            preserveState
                                                            preserveScroll
                                                        >
                                                            Berikutnya
                                                        </Link>
                                                    ) : (
                                                        'Berikutnya'
                                                    )}
                                                </Button>
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            </>
                        ) : (
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <ClipboardPlusIcon />
                                    </EmptyMedia>
                                    <EmptyTitle>
                                        {emptyDataset
                                            ? 'Belum ada barang masuk'
                                            : 'Dokumen tidak ditemukan'}
                                    </EmptyTitle>
                                    <EmptyDescription>
                                        {emptyDataset
                                            ? 'Buat draft penerimaan pertama untuk mulai mencatat hasil bongkar.'
                                            : 'Ubah kata pencarian atau bersihkan filter status.'}
                                    </EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    {emptyDataset ? (
                                        <Link
                                            href="/receiving/create"
                                            className={buttonVariants()}
                                        >
                                            <PlusIcon data-icon="inline-start" />
                                            Buat penerimaan
                                        </Link>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setSearch('');
                                                setStatus('all');
                                            }}
                                        >
                                            Bersihkan filter
                                        </Button>
                                    )}
                                </EmptyContent>
                            </Empty>
                        )}
                    </CardContent>
                </Card>
            </main>
        </>
    );
}

ReceivingIndex.layout = {
    breadcrumbs: [{ title: 'Barang masuk', href: '/receiving' }],
};
