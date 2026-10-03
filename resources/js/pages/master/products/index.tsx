import { Head, Link, router } from '@inertiajs/react';
import {
    ArchiveIcon,
    PencilIcon,
    PlusIcon,
    SearchIcon,
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
import { cn } from '@/lib/utils';

type Product = {
    id: number;
    sku: string;
    name: string;
    max_cartons_per_valet: number;
    carton_size_note: string | null;
    active: boolean;
};

type PaginatedProducts = {
    data: Product[];
    current_page: number;
    from: number | null;
    last_page: number;
    next_page_url: string | null;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};

type ProductFilters = {
    search: string;
    status: string;
};

function ProductStatusAction({ product }: { product: Product }) {
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    return (
        <AlertDialog
            open={open}
            onOpenChange={(value) => {
                if (!processing) {
                    setOpen(value);
                }
            }}
        >
            <AlertDialogTrigger asChild>
                <Button
                    type="button"
                    onClick={() => setOpen(true)}
                    variant={product.active ? 'warning' : 'secondary'}
                    size="sm"
                >
                    <ArchiveIcon data-icon="inline-start" />
                    {product.active ? 'Nonaktifkan' : 'Aktifkan'}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {product.active
                            ? `Nonaktifkan ${product.sku}?`
                            : `Aktifkan ${product.sku}?`}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {product.active
                            ? 'Produk tidak dapat dipilih pada penerimaan baru, tetapi stok dan seluruh riwayat tetap tersimpan.'
                            : 'Produk dapat kembali dipilih pada transaksi baru.'}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={processing}>
                        Batal
                    </AlertDialogCancel>
                    <AlertDialogAction
                        variant={product.active ? 'warning' : 'default'}
                        disabled={processing}
                        onClick={(event) => {
                            event.preventDefault();
                            router.patch(
                                `/master/products/${product.id}/status`,
                                { active: !product.active },
                                {
                                    preserveScroll: true,
                                    onStart: () => setProcessing(true),
                                    onSuccess: () => setOpen(false),
                                    onFinish: () => setProcessing(false),
                                },
                            );
                        }}
                    >
                        {processing && <Spinner data-icon="inline-start" />}
                        {processing
                            ? 'Menyimpan...'
                            : product.active
                              ? 'Nonaktifkan'
                              : 'Aktifkan'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default function ProductsIndex({
    products,
    filters,
}: {
    products: PaginatedProducts;
    filters: ProductFilters;
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

        if (isComposing) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.get(
                '/master/products',
                { search: search || undefined, status },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    only: ['products', 'filters'],
                },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [search, status, isComposing]);

    const emptyDataset =
        products.total === 0 && !filters.search && status === 'all';

    return (
        <>
            <Head title="Produk" />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Master data / F-01"
                    title="Produk dan kapasitas valet"
                    description="Setiap SKU mempunyai batas karton sendiri. Nilai ini menjadi dasar validasi valet tunggal maupun campuran."
                    actions={
                        <Link
                            href="/master/products/create"
                            className={buttonVariants()}
                        >
                            <PlusIcon data-icon="inline-start" />
                            Tambah produk
                        </Link>
                    }
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar produk</CardTitle>
                        <CardDescription>
                            {products.total} SKU tersimpan. Produk nonaktif
                            tetap dipertahankan untuk riwayat transaksi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-end">
                            <Field className="md:max-w-md">
                                <FieldLabel htmlFor="product-search">
                                    Cari produk
                                </FieldLabel>
                                <InputGroup>
                                    <InputGroupAddon>
                                        <SearchIcon aria-hidden="true" />
                                    </InputGroupAddon>
                                    <InputGroupInput
                                        id="product-search"
                                        type="search"
                                        value={search}
                                        placeholder="Kode SKU atau nama produk"
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
                                <FieldLabel htmlFor="product-status">
                                    Status
                                </FieldLabel>
                                <ShadcnSelect
                                    value={status}
                                    onValueChange={setStatus}
                                >
                                    <SelectTrigger id="product-status">
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

                        {products.data.length > 0 ? (
                            <>
                                <Table aria-label="Daftar produk dan kapasitas valet">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>SKU</TableHead>
                                            <TableHead>Nama produk</TableHead>
                                            <TableHead>Kapasitas</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">
                                                Tindakan
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.data.map((product) => (
                                            <TableRow key={product.id}>
                                                <TableCell>
                                                    <span className="font-data font-semibold">
                                                        {product.sku}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-medium">
                                                            {product.name}
                                                        </span>
                                                        {product.carton_size_note && (
                                                            <span className="max-w-xs truncate text-xs text-muted-foreground">
                                                                {
                                                                    product.carton_size_note
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-data tabular-nums">
                                                        {
                                                            product.max_cartons_per_valet
                                                        }
                                                    </span>{' '}
                                                    karton / valet
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            product.active
                                                                ? 'success'
                                                                : 'secondary'
                                                        }
                                                    >
                                                        {product.active
                                                            ? 'Aktif'
                                                            : 'Nonaktif'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            className={cn(
                                                                buttonVariants({
                                                                    variant:
                                                                        'outline',
                                                                    size: 'sm',
                                                                }),
                                                            )}
                                                            href={`/master/products/${product.id}/edit`}
                                                        >
                                                            <PencilIcon data-icon="inline-start" />
                                                            Edit
                                                        </Link>
                                                        <ProductStatusAction
                                                            product={product}
                                                        />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                                    <p aria-live="polite">
                                        Menampilkan {products.from}–
                                        {products.to} dari {products.total}{' '}
                                        produk
                                    </p>
                                    <Pagination className="mx-0 w-auto">
                                        <PaginationContent>
                                            <PaginationItem>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={
                                                        !products.prev_page_url
                                                    }
                                                    asChild={Boolean(
                                                        products.prev_page_url,
                                                    )}
                                                >
                                                    {products.prev_page_url ? (
                                                        <Link
                                                            href={
                                                                products.prev_page_url
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
                                                    {products.current_page} /{' '}
                                                    {products.last_page}
                                                </span>
                                            </PaginationItem>
                                            <PaginationItem>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={
                                                        !products.next_page_url
                                                    }
                                                    asChild={Boolean(
                                                        products.next_page_url,
                                                    )}
                                                >
                                                    {products.next_page_url ? (
                                                        <Link
                                                            href={
                                                                products.next_page_url
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
                                        <ArchiveIcon />
                                    </EmptyMedia>
                                    <EmptyTitle>
                                        {emptyDataset
                                            ? 'Belum ada produk'
                                            : 'Produk tidak ditemukan'}
                                    </EmptyTitle>
                                    <EmptyDescription>
                                        {emptyDataset
                                            ? 'Tambahkan SKU pertama sebelum mencatat barang masuk.'
                                            : 'Ubah kata pencarian atau bersihkan filter status.'}
                                    </EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    {emptyDataset ? (
                                        <Link
                                            href="/master/products/create"
                                            className={buttonVariants()}
                                        >
                                            <PlusIcon data-icon="inline-start" />
                                            Tambah produk
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

ProductsIndex.layout = {
    breadcrumbs: [{ title: 'Produk', href: '/master/products' }],
};
