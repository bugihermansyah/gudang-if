import { Head } from '@inertiajs/react';
import {
    BoxesIcon,
    MapPinnedIcon,
    PackageCheckIcon,
    PackageOpenIcon,
    ShieldAlertIcon,
    WarehouseIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';

type DashboardSummary = {
    active_products: number;
    active_rows: number;
    active_valets: number;
    physical_cartons: number;
    reserved_cartons: number;
    held_cartons: number;
};

const number = new Intl.NumberFormat('id-ID');

export default function Dashboard({ summary }: { summary: DashboardSummary }) {
    const available = Math.max(
        summary.physical_cartons -
            summary.reserved_cartons -
            summary.held_cartons,
        0,
    );

    return (
        <>
            <Head title="Ringkasan gudang" />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Status stok pusat"
                    title="Ringkasan gudang"
                    description="Angka fisik, reservasi, dan hold dibaca dari saldo pusat yang sama untuk seluruh operator."
                    actions={
                        <Badge variant="success">Layanan tersambung</Badge>
                    }
                />

                <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <WarehouseIcon />
                                Manifest stok karton
                            </CardTitle>
                            <CardDescription>
                                Reservasi dan hold tidak mengubah jumlah fisik.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
                            <div className="flex flex-col justify-between gap-4 border-l-4 border-accent pl-4">
                                <div className="flex flex-col gap-1">
                                    <span className="font-data text-xs tracking-[0.14em] text-muted-foreground uppercase">
                                        Total fisik
                                    </span>
                                    <span className="font-display text-6xl font-semibold tabular-nums">
                                        {number.format(
                                            summary.physical_cartons,
                                        )}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        karton tercatat di seluruh valet
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <PackageCheckIcon className="size-5 text-success" />
                                    <span className="font-data text-xl font-semibold tabular-nums">
                                        {number.format(available)}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        tersedia
                                    </span>
                                </div>
                            </div>
                            <dl className="grid gap-3">
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <PackageOpenIcon className="size-4" />
                                        Terreservasi
                                    </dt>
                                    <dd className="font-data font-semibold tabular-nums">
                                        {number.format(
                                            summary.reserved_cartons,
                                        )}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <ShieldAlertIcon className="size-4" />
                                        Ditahan
                                    </dt>
                                    <dd className="font-data font-semibold tabular-nums">
                                        {number.format(summary.held_cartons)}
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Jangkauan master aktif</CardTitle>
                            <CardDescription>
                                Referensi yang siap dipakai transaksi baru.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                                <div className="flex items-center justify-between gap-4">
                                    <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <BoxesIcon className="size-4" />
                                        SKU aktif
                                    </dt>
                                    <dd className="font-data text-2xl font-semibold tabular-nums">
                                        {number.format(summary.active_products)}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPinnedIcon className="size-4" />
                                        Row aktif
                                    </dt>
                                    <dd className="font-data text-2xl font-semibold tabular-nums">
                                        {number.format(summary.active_rows)}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <WarehouseIcon className="size-4" />
                                        Valet aktif
                                    </dt>
                                    <dd className="font-data text-2xl font-semibold tabular-nums">
                                        {number.format(summary.active_valets)}
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Ringkasan gudang',
            href: dashboard(),
        },
    ],
};
