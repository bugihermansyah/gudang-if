import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle2Icon,
    PlayIcon,
    PrinterIcon,
    ShieldAlertIcon,
    TagIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

type Line = {
    id: number;
    product: { sku: string; name: string; max_cartons_per_valet: number };
    batch: {
        batch_no: string;
        expires_on: string;
        status: string;
        hold_reason: string | null;
    };
    qty_delivery_note: number;
    qty_physical: number;
    discrepancy_reason: string | null;
    allocations: {
        id: number;
        qty: number;
        valet: { code: string; row: { code: string; name: string } };
    }[];
};
type Document = {
    id: number;
    internal_no: string;
    external_delivery_note_no: string;
    company: { code: string; name: string };
    vehicle_plate: string;
    driver_name: string;
    finalization_key: string;
    status: string;
    status_label: string;
    unloading_started_at: string | null;
    unloading_finished_at: string | null;
    discrepancy_reason: string | null;
    creator: { name: string };
    finalizer: { name: string } | null;
    lines: Line[];
};

type PrintMode = 'proof' | 'labels' | null;

function formatDate(value: string | null) {
    if (!value) return '—';
    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

function WorkflowAction({
    document,
    action,
    label,
    icon: Icon,
    variant = 'default',
}: {
    document: Document;
    action: 'start' | 'finish';
    label: string;
    icon: typeof PlayIcon;
    variant?: 'default' | 'outline';
}) {
    const [processing, setProcessing] = useState(false);
    return (
        <Button
            type="button"
            variant={variant}
            disabled={processing}
            onClick={() =>
                router.patch(
                    `/receiving/${document.id}/${action}`,
                    {},
                    {
                        preserveScroll: true,
                        onStart: () => setProcessing(true),
                        onFinish: () => setProcessing(false),
                    },
                )
            }
        >
            {processing ? (
                <Spinner data-icon="inline-start" />
            ) : (
                <Icon data-icon="inline-start" />
            )}
            {processing ? 'Menyimpan...' : label}
        </Button>
    );
}

export default function ReceivingShow({ document }: { document: Document }) {
    const [finalizeOpen, setFinalizeOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [holdLine, setHoldLine] = useState<Line | null>(null);
    const [holdReason, setHoldReason] = useState('');
    const [holdProcessing, setHoldProcessing] = useState(false);
    const [printMode, setPrintMode] = useState<PrintMode>(null);
    const canStart = document.status === 'draft';
    const canFinish = document.status === 'bongkar';
    const canFinalize = document.status === 'siap_finalisasi';
    const canPrint = document.status === 'selesai';
    const canHoldBatch = ['draft', 'bongkar', 'siap_finalisasi'].includes(
        document.status,
    );

    useEffect(() => {
        const handleAfterPrint = () => setPrintMode(null);
        window.addEventListener('afterprint', handleAfterPrint);

        return () => window.removeEventListener('afterprint', handleAfterPrint);
    }, []);

    const startPrint = (mode: Exclude<PrintMode, null>) => {
        setPrintMode(mode);
        window.setTimeout(() => window.print(), 0);
    };

    const openHoldDialog = (line: Line) => {
        setHoldLine(line);
        setHoldReason(line.batch.hold_reason ?? '');
    };

    return (
        <>
            <Head title={document.internal_no} />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 print:hidden">
                <PageHeader
                    eyebrow="Operasional / Barang masuk"
                    title={document.internal_no}
                    description={`${document.external_delivery_note_no} · ${document.company.code} — ${document.company.name}`}
                    actions={
                        <div className="flex flex-wrap gap-2">
                            <Link
                                href="/receiving"
                                className={buttonVariants({
                                    variant: 'outline',
                                })}
                            >
                                Kembali
                            </Link>
                            {canStart && (
                                <WorkflowAction
                                    document={document}
                                    action="start"
                                    label="Mulai bongkar"
                                    icon={PlayIcon}
                                />
                            )}
                            {canFinish && (
                                <WorkflowAction
                                    document={document}
                                    action="finish"
                                    label="Selesai bongkar"
                                    icon={CheckCircle2Icon}
                                />
                            )}
                            {canFinalize && (
                                <Button
                                    type="button"
                                    onClick={() => setFinalizeOpen(true)}
                                >
                                    <CheckCircle2Icon data-icon="inline-start" />
                                    Finalisasi
                                </Button>
                            )}
                            <Button
                                type="button"
                                variant="outline"
                                disabled={!canPrint}
                                onClick={() => startPrint('proof')}
                            >
                                <PrinterIcon data-icon="inline-start" />
                                Cetak bukti
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={!canPrint}
                                onClick={() => startPrint('labels')}
                            >
                                <TagIcon data-icon="inline-start" />
                                Cetak label valet
                            </Button>
                        </div>
                    }
                />
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            Status penerimaan{' '}
                            <Badge
                                variant={
                                    document.status === 'selesai'
                                        ? 'success'
                                        : document.status === 'dibatalkan'
                                          ? 'secondary'
                                          : 'warning'
                                }
                            >
                                {document.status_label}
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            Draft tidak mengubah stok. Finalisasi mencatat saldo
                            dan ledger dalam satu transaksi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-4">
                        <div>
                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Nomor polisi
                            </p>
                            <p className="font-data font-semibold">
                                {document.vehicle_plate}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Driver
                            </p>
                            <p>{document.driver_name}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Mulai bongkar
                            </p>
                            <p>{formatDate(document.unloading_started_at)}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Selesai bongkar
                            </p>
                            <p>{formatDate(document.unloading_finished_at)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Rincian barang</CardTitle>
                        <CardDescription>
                            {document.lines.length} baris SKU · angka fisik
                            menjadi dasar penambahan stok saat finalisasi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table aria-label="Rincian barang masuk">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>SKU / batch</TableHead>
                                    <TableHead>Surat jalan</TableHead>
                                    <TableHead>Fisik</TableHead>
                                    <TableHead>Alokasi valet</TableHead>
                                    <TableHead>Selisih</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {document.lines.map((line) => (
                                    <TableRow key={line.id}>
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-data font-semibold">
                                                    {line.product.sku}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {line.product.name} ·{' '}
                                                    {line.batch.batch_no} · exp{' '}
                                                    {line.batch.expires_on}
                                                </span>
                                                {line.batch.status ===
                                                    'ditahan' && (
                                                    <Badge
                                                        variant="warning"
                                                        className="w-fit"
                                                    >
                                                        Ditahan karena
                                                        kedaluwarsa
                                                    </Badge>
                                                )}
                                                {line.batch.status ===
                                                    'meragukan' && (
                                                    <Badge
                                                        variant="warning"
                                                        className="w-fit"
                                                    >
                                                        Batch meragukan
                                                    </Badge>
                                                )}
                                                {line.batch.hold_reason && (
                                                    <span className="text-xs text-muted-foreground">
                                                        Alasan:{' '}
                                                        {line.batch.hold_reason}
                                                    </span>
                                                )}
                                                {canHoldBatch &&
                                                    line.batch.status ===
                                                        'aktif' && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-fit"
                                                            onClick={() =>
                                                                openHoldDialog(
                                                                    line,
                                                                )
                                                            }
                                                        >
                                                            <ShieldAlertIcon data-icon="inline-start" />
                                                            Tandai meragukan
                                                        </Button>
                                                    )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-data tabular-nums">
                                            {line.qty_delivery_note}
                                        </TableCell>
                                        <TableCell className="font-data font-semibold tabular-nums">
                                            {line.qty_physical}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {line.allocations.map(
                                                    (allocation) => (
                                                        <span
                                                            key={allocation.id}
                                                            className="text-sm"
                                                        >
                                                            <span className="font-data font-semibold">
                                                                {
                                                                    allocation
                                                                        .valet
                                                                        .code
                                                                }
                                                            </span>{' '}
                                                            ·{' '}
                                                            {
                                                                allocation.valet
                                                                    .row.code
                                                            }{' '}
                                                            · {allocation.qty}{' '}
                                                            karton
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {line.qty_delivery_note ===
                                            line.qty_physical ? (
                                                '—'
                                            ) : (
                                                <span className="text-sm">
                                                    <span className="font-data font-semibold">
                                                        {line.qty_physical -
                                                            line.qty_delivery_note}
                                                    </span>
                                                    <br />
                                                    {line.discrepancy_reason}
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                {document.discrepancy_reason && (
                    <Alert>
                        <AlertDescription>
                            Catatan: {document.discrepancy_reason}
                        </AlertDescription>
                    </Alert>
                )}
            </main>
            <AlertDialog
                open={finalizeOpen}
                onOpenChange={(value) => {
                    if (!processing) setFinalizeOpen(value);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Finalisasi penerimaan?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Stok fisik akan ditambahkan ke valet sesuai alokasi
                            dan ledger penerimaan dibuat. Draft tidak dapat
                            diedit setelah selesai.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processing}>
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={processing}
                            onClick={(event) => {
                                event.preventDefault();
                                setProcessing(true);
                                router.patch(
                                    `/receiving/${document.id}/finalize`,
                                    {
                                        finalization_key:
                                            document.finalization_key,
                                    },
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => setFinalizeOpen(false),
                                        onFinish: () => setProcessing(false),
                                    },
                                );
                            }}
                        >
                            {processing && <Spinner data-icon="inline-start" />}
                            {processing
                                ? 'Memfinalisasi...'
                                : 'Finalisasi penerimaan'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog
                open={holdLine !== null}
                onOpenChange={(value) => {
                    if (!holdProcessing && !value) {
                        setHoldLine(null);
                        setHoldReason('');
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Tandai batch meragukan?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Karton batch ini tetap tercatat secara fisik, tetapi
                            tidak tersedia untuk pengeluaran normal sampai
                            diperiksa supervisor.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="hold-reason">
                                Alasan penahanan
                            </FieldLabel>
                            <Textarea
                                id="hold-reason"
                                className="min-h-24 resize-none"
                                value={holdReason}
                                onChange={(event) =>
                                    setHoldReason(event.target.value)
                                }
                                placeholder="Contoh: label tanggal kedaluwarsa buram"
                                aria-describedby="hold-reason-description"
                                disabled={holdProcessing}
                            />
                            <FieldDescription id="hold-reason-description">
                                Minimal 3 karakter. Alasan ini ikut tampil pada
                                detail penerimaan.
                            </FieldDescription>
                        </Field>
                    </FieldGroup>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={holdProcessing}>
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={
                                holdProcessing || holdReason.trim().length < 3
                            }
                            onClick={(event) => {
                                event.preventDefault();
                                if (!holdLine) return;
                                setHoldProcessing(true);
                                router.patch(
                                    `/receiving/${document.id}/lines/${holdLine.id}/hold`,
                                    { reason: holdReason.trim() },
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            setHoldLine(null);
                                            setHoldReason('');
                                        },
                                        onFinish: () =>
                                            setHoldProcessing(false),
                                    },
                                );
                            }}
                        >
                            {holdProcessing && (
                                <Spinner data-icon="inline-start" />
                            )}
                            {holdProcessing ? 'Menyimpan...' : 'Tandai batch'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {printMode === 'proof' && (
                <section className="print-sheet hidden p-8 print:block">
                    <div className="mb-8 flex items-start justify-between gap-8">
                        <div>
                            <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                                Gudang Indofood
                            </p>
                            <h1 className="mt-2 text-3xl font-bold">
                                Bukti penerimaan
                            </h1>
                        </div>
                        <div className="text-right text-sm">
                            <p className="font-data font-semibold">
                                {document.internal_no}
                            </p>
                            <p>{formatDate(document.unloading_finished_at)}</p>
                        </div>
                    </div>
                    <div className="mb-8 grid grid-cols-2 gap-4 text-sm">
                        <p>
                            <span className="font-semibold">Surat jalan:</span>{' '}
                            {document.external_delivery_note_no}
                        </p>
                        <p>
                            <span className="font-semibold">Perusahaan:</span>{' '}
                            {document.company.code} · {document.company.name}
                        </p>
                        <p>
                            <span className="font-semibold">Nomor polisi:</span>{' '}
                            {document.vehicle_plate}
                        </p>
                        <p>
                            <span className="font-semibold">Driver:</span>{' '}
                            {document.driver_name}
                        </p>
                    </div>
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b text-left">
                                <th className="px-2 py-2">SKU / batch</th>
                                <th className="px-2 py-2">Surat jalan</th>
                                <th className="px-2 py-2">Fisik</th>
                                <th className="px-2 py-2">Alokasi valet</th>
                            </tr>
                        </thead>
                        <tbody>
                            {document.lines.map((line) => (
                                <tr
                                    key={line.id}
                                    className="border-b align-top"
                                >
                                    <td className="px-2 py-2">
                                        <p className="font-data font-semibold">
                                            {line.product.sku}
                                        </p>
                                        <p className="text-xs">
                                            {line.batch.batch_no} · exp{' '}
                                            {line.batch.expires_on}
                                        </p>
                                    </td>
                                    <td className="px-2 py-2 font-data">
                                        {line.qty_delivery_note}
                                    </td>
                                    <td className="px-2 py-2 font-data font-semibold">
                                        {line.qty_physical}
                                    </td>
                                    <td className="px-2 py-2">
                                        {line.allocations
                                            .map(
                                                (allocation) =>
                                                    `${allocation.valet.code} (${allocation.qty})`,
                                            )
                                            .join(', ')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="mt-10 text-sm text-muted-foreground">
                        Dokumen dicetak dari Gudang Indofood.
                    </p>
                </section>
            )}
            {printMode === 'labels' && (
                <section className="hidden grid-cols-2 gap-4 p-8 print:grid">
                    {document.lines.flatMap((line) =>
                        line.allocations.map((allocation) => (
                            <article
                                key={`${line.id}-${allocation.id}`}
                                className="break-inside-avoid rounded-lg border p-4"
                            >
                                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    Label valet
                                </p>
                                <h2 className="mt-2 font-data text-2xl font-bold">
                                    {allocation.valet.code}
                                </h2>
                                <p className="mt-1 text-sm">
                                    Row {allocation.valet.row.code}
                                </p>
                                <p className="mt-3 text-sm font-semibold">
                                    {line.product.sku} · {line.batch.batch_no}
                                </p>
                                <p className="text-sm">
                                    {allocation.qty} karton · exp{' '}
                                    {line.batch.expires_on}
                                </p>
                            </article>
                        )),
                    )}
                </section>
            )}
        </>
    );
}

ReceivingShow.layout = {
    breadcrumbs: [
        { title: 'Barang masuk', href: '/receiving' },
        { title: 'Detail', href: '#' },
    ],
};
