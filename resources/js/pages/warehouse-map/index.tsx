import { Head } from '@inertiajs/react';
import {
    ArchiveIcon,
    BoxesIcon,
    MapIcon,
    SearchIcon,
    ShieldAlertIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select as ShadcnSelect,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type Stock = {
    id: number;
    product: {
        sku: string;
        name: string;
        max_cartons_per_valet: number;
    };
    batch: {
        batch_no: string;
        expires_on: string;
        status: string;
        hold_reason: string | null;
        expiry_state: 'expired' | 'soon' | 'ok';
    };
    qty_on_hand: number;
    qty_reserved: number;
    qty_held: number;
    qty_available: number;
};

type Valet = {
    id: number;
    code: string;
    status: string;
    physical_cartons: number;
    reserved_cartons: number;
    held_cartons: number;
    available_cartons: number;
    utilization_percent: number;
    stocks: Stock[];
};

type Row = {
    id: number;
    code: string;
    name: string;
    valets: Valet[];
};

type Summary = {
    active_rows: number;
    active_valets: number;
    physical_cartons: number;
    reserved_cartons: number;
    held_cartons: number;
};

type Filter = 'all' | 'occupied' | 'empty' | 'held';

const number = new Intl.NumberFormat('id-ID');

function stockSearchText(stock: Stock) {
    return `${stock.product.sku} ${stock.product.name} ${stock.batch.batch_no}`.toLowerCase();
}

function ValetCard({ valet, onOpen }: { valet: Valet; onOpen: () => void }) {
    const skuGroups = Array.from(
        valet.stocks.reduce((groups, stock) => {
            const current = groups.get(stock.product.sku) ?? 0;
            groups.set(stock.product.sku, current + stock.qty_on_hand);
            return groups;
        }, new Map<string, number>()),
    );
    const visibleSkuGroups = skuGroups.slice(0, 3);
    const remainingSkuCount = Math.max(skuGroups.length - 3, 0);

    return (
        <Button
            type="button"
            variant="outline"
            className="h-auto min-h-48 w-full flex-col items-stretch justify-start gap-4 p-4 text-left whitespace-normal"
            onClick={onOpen}
            aria-label={`Buka detail valet ${valet.code}`}
        >
            <span className="flex items-start justify-between gap-3">
                <span>
                    <span className="font-data text-xl font-bold">
                        {valet.code}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                        {valet.stocks.length === 0
                            ? 'Valet kosong'
                            : `${valet.stocks.length} batch tercatat`}
                    </span>
                </span>
                <Badge
                    variant={valet.held_cartons > 0 ? 'warning' : 'secondary'}
                >
                    {valet.utilization_percent}% muatan
                </Badge>
            </span>
            <span className="grid grid-cols-3 gap-2 text-xs">
                <span className="flex flex-col gap-1 rounded-md bg-muted/60 p-2">
                    <span className="text-muted-foreground">Fisik</span>
                    <span className="font-data text-base font-semibold tabular-nums">
                        {number.format(valet.physical_cartons)}
                    </span>
                </span>
                <span className="flex flex-col gap-1 rounded-md bg-muted/60 p-2">
                    <span className="text-muted-foreground">Tersedia</span>
                    <span className="font-data text-base font-semibold tabular-nums">
                        {number.format(valet.available_cartons)}
                    </span>
                </span>
                <span className="flex flex-col gap-1 rounded-md bg-muted/60 p-2">
                    <span className="text-muted-foreground">Reservasi</span>
                    <span className="font-data text-base font-semibold tabular-nums">
                        {number.format(valet.reserved_cartons)}
                    </span>
                </span>
            </span>
            <span className="flex flex-col gap-1 text-xs">
                {visibleSkuGroups.length > 0 ? (
                    visibleSkuGroups.map(([sku, qty]) => (
                        <span key={sku} className="flex justify-between gap-3">
                            <span className="font-data font-semibold">
                                {sku}
                            </span>
                            <span className="tabular-nums">
                                {number.format(qty)} karton
                            </span>
                        </span>
                    ))
                ) : (
                    <span className="text-muted-foreground">
                        Belum ada karton
                    </span>
                )}
                {remainingSkuCount > 0 && (
                    <span className="text-muted-foreground">
                        +{remainingSkuCount} SKU lain
                    </span>
                )}
            </span>
            <span className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                <span>Klik untuk rincian batch</span>
                {valet.held_cartons > 0 && (
                    <span className="flex items-center gap-1">
                        <ShieldAlertIcon className="size-3.5" />
                        {number.format(valet.held_cartons)} ditahan
                    </span>
                )}
            </span>
        </Button>
    );
}

function ValetDetail({ valet }: { valet: Valet | null }) {
    if (!valet) return null;

    return (
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
            <SheetHeader>
                <SheetTitle className="font-data text-2xl">
                    {valet.code}
                </SheetTitle>
                <SheetDescription>
                    Rincian stok fisik, reservasi, hold, dan kedaluwarsa pada
                    valet ini.
                </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-6 p-4 pt-0">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">Fisik</p>
                        <p className="font-data text-xl font-semibold tabular-nums">
                            {number.format(valet.physical_cartons)}
                        </p>
                    </div>
                    <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">
                            Tersedia
                        </p>
                        <p className="font-data text-xl font-semibold tabular-nums">
                            {number.format(valet.available_cartons)}
                        </p>
                    </div>
                    <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">
                            Reservasi
                        </p>
                        <p className="font-data text-xl font-semibold tabular-nums">
                            {number.format(valet.reserved_cartons)}
                        </p>
                    </div>
                    <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">Muatan</p>
                        <p className="font-data text-xl font-semibold tabular-nums">
                            {valet.utilization_percent}%
                        </p>
                    </div>
                </div>
                {valet.stocks.length > 0 ? (
                    <Table aria-label={`Rincian batch valet ${valet.code}`}>
                        <TableHeader>
                            <TableRow>
                                <TableHead>SKU / batch</TableHead>
                                <TableHead>Fisik</TableHead>
                                <TableHead>Tersedia</TableHead>
                                <TableHead>Kedaluwarsa</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {valet.stocks.map((stock) => (
                                <TableRow key={stock.id}>
                                    <TableCell>
                                        <span className="font-data font-semibold">
                                            {stock.product.sku}
                                        </span>
                                        <span className="block text-xs text-muted-foreground">
                                            {stock.batch.batch_no}
                                        </span>
                                        {stock.batch.hold_reason && (
                                            <span className="mt-1 block text-xs text-muted-foreground">
                                                Hold: {stock.batch.hold_reason}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-data tabular-nums">
                                        {number.format(stock.qty_on_hand)}
                                    </TableCell>
                                    <TableCell className="font-data tabular-nums">
                                        {number.format(stock.qty_available)}
                                    </TableCell>
                                    <TableCell>
                                        <span className="flex flex-col gap-1">
                                            <span>
                                                {stock.batch.expires_on}
                                            </span>
                                            {stock.batch.expiry_state ===
                                                'expired' && (
                                                <Badge
                                                    variant="warning"
                                                    className="w-fit"
                                                >
                                                    Kedaluwarsa
                                                </Badge>
                                            )}
                                            {stock.batch.expiry_state ===
                                                'soon' && (
                                                <Badge
                                                    variant="outline"
                                                    className="w-fit"
                                                >
                                                    ≤ 30 hari
                                                </Badge>
                                            )}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <ArchiveIcon />
                            </EmptyMedia>
                            <EmptyTitle>Valet kosong</EmptyTitle>
                            <EmptyDescription>
                                Valet tetap terlihat dan siap menerima alokasi
                                baru.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                )}
            </div>
        </SheetContent>
    );
}

export default function WarehouseMap({
    rows,
    summary,
}: {
    rows: Row[];
    summary: Summary;
}) {
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<Filter>('all');
    const [selectedValet, setSelectedValet] = useState<Valet | null>(null);
    const normalizedQuery = query.trim().toLowerCase();

    const filteredRows = useMemo(() => {
        return rows
            .map((row) => {
                const rowMatches = `${row.code} ${row.name}`
                    .toLowerCase()
                    .includes(normalizedQuery);
                const valets = row.valets.filter((valet) => {
                    const matchesQuery =
                        normalizedQuery === '' ||
                        rowMatches ||
                        valet.code.toLowerCase().includes(normalizedQuery) ||
                        valet.stocks.some((stock) =>
                            stockSearchText(stock).includes(normalizedQuery),
                        );
                    const matchesFilter =
                        filter === 'all' ||
                        (filter === 'occupied' && valet.physical_cartons > 0) ||
                        (filter === 'empty' && valet.physical_cartons === 0) ||
                        (filter === 'held' && valet.held_cartons > 0);
                    return matchesQuery && matchesFilter;
                });

                return { ...row, valets };
            })
            .filter((row) => row.valets.length > 0);
    }, [filter, normalizedQuery, rows]);

    const shownValets = filteredRows.flatMap((row) => row.valets);
    const shownPhysical = shownValets.reduce(
        (total, valet) => total + valet.physical_cartons,
        0,
    );
    const shownReserved = shownValets.reduce(
        (total, valet) => total + valet.reserved_cartons,
        0,
    );

    return (
        <>
            <Head title="Peta gudang" />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Status stok pusat"
                    title="Peta gudang"
                    description="Lihat row, valet, kapasitas muatan, reservasi, batch, dan kedaluwarsa dari saldo pusat."
                    actions={<Badge variant="success">Data tersambung</Badge>}
                />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Row aktif</CardDescription>
                            <CardTitle className="font-data text-3xl tabular-nums">
                                {number.format(summary.active_rows)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Valet aktif</CardDescription>
                            <CardTitle className="font-data text-3xl tabular-nums">
                                {number.format(summary.active_valets)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Total fisik</CardDescription>
                            <CardTitle className="font-data text-3xl tabular-nums">
                                {number.format(summary.physical_cartons)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>
                                Terreservasi / ditahan
                            </CardDescription>
                            <CardTitle className="font-data text-3xl tabular-nums">
                                {number.format(summary.reserved_cartons)} /{' '}
                                {number.format(summary.held_cartons)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <FieldGroup className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                            <Field>
                                <FieldLabel htmlFor="warehouse-map-search">
                                    Cari row, valet, SKU, atau batch
                                </FieldLabel>
                                <div className="relative">
                                    <SearchIcon className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
                                    <Input
                                        id="warehouse-map-search"
                                        value={query}
                                        onChange={(event) =>
                                            setQuery(event.target.value)
                                        }
                                        placeholder="Contoh: ROW-A01, V-0001, CIKI-A, LOT-01"
                                        className="pl-9"
                                    />
                                </div>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="warehouse-map-filter">
                                    Tampilkan
                                </FieldLabel>
                                <ShadcnSelect
                                    value={filter}
                                    onValueChange={(value) =>
                                        setFilter(value as Filter)
                                    }
                                >
                                    <SelectTrigger id="warehouse-map-filter">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="all">
                                                Semua valet
                                            </SelectItem>
                                            <SelectItem value="occupied">
                                                Ada stok
                                            </SelectItem>
                                            <SelectItem value="empty">
                                                Valet kosong
                                            </SelectItem>
                                            <SelectItem value="held">
                                                Ada hold
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </ShadcnSelect>
                            </Field>
                        </FieldGroup>
                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span>
                                {number.format(shownValets.length)} valet
                                ditampilkan
                            </span>
                            <span>
                                {number.format(shownPhysical)} karton fisik
                            </span>
                            <span>
                                {number.format(shownReserved)} terreservasi
                            </span>
                        </div>
                    </CardContent>
                </Card>
                {filteredRows.length > 0 ? (
                    <div className="flex flex-col gap-6">
                        {filteredRows.map((row) => {
                            const rowPhysical = row.valets.reduce(
                                (total, valet) =>
                                    total + valet.physical_cartons,
                                0,
                            );
                            const rowReserved = row.valets.reduce(
                                (total, valet) =>
                                    total + valet.reserved_cartons,
                                0,
                            );

                            return (
                                <Card key={row.id}>
                                    <CardHeader>
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    <MapIcon data-icon="inline-start" />
                                                    <span className="font-data">
                                                        {row.code}
                                                    </span>
                                                </CardTitle>
                                                <CardDescription>
                                                    {row.name}
                                                </CardDescription>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                                <Badge variant="secondary">
                                                    {row.valets.length} valet
                                                </Badge>
                                                <span className="font-data tabular-nums">
                                                    {number.format(rowPhysical)}{' '}
                                                    fisik
                                                </span>
                                                <span className="font-data tabular-nums">
                                                    {number.format(rowReserved)}{' '}
                                                    reservasi
                                                </span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                        {row.valets.map((valet) => (
                                            <ValetCard
                                                key={valet.id}
                                                valet={valet}
                                                onOpen={() =>
                                                    setSelectedValet(valet)
                                                }
                                            />
                                        ))}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <BoxesIcon />
                            </EmptyMedia>
                            <EmptyTitle>Tidak ada valet yang cocok</EmptyTitle>
                            <EmptyDescription>
                                Ubah pencarian atau filter untuk melihat row dan
                                valet lain.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                )}
            </main>
            <Sheet
                open={selectedValet !== null}
                onOpenChange={(open) => !open && setSelectedValet(null)}
            >
                <ValetDetail valet={selectedValet} />
            </Sheet>
        </>
    );
}

WarehouseMap.layout = {
    breadcrumbs: [{ title: 'Peta gudang', href: '/warehouse-map' }],
};
