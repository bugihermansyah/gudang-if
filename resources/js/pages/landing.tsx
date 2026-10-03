import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRightIcon, NetworkIcon, WarehouseIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard, login } from '@/routes';
import { cn } from '@/lib/utils';

export default function Landing() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Akses gudang" />
            <main className="grid min-h-screen bg-background lg:grid-cols-[1.25fr_0.75fr]">
                <section className="flex min-h-[58vh] flex-col justify-between gap-12 bg-primary p-6 text-primary-foreground md:p-12 lg:min-h-screen lg:p-16">
                    <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                            <WarehouseIcon aria-hidden="true" />
                        </div>
                        <div>
                            <p className="font-display text-xl font-semibold">
                                Gudang Indofood
                            </p>
                            <p className="font-data text-xs tracking-[0.14em] text-primary-foreground/70 uppercase">
                                Stok pusat intranet
                            </p>
                        </div>
                    </div>

                    <div className="flex max-w-3xl flex-col gap-6">
                        <Badge className="w-fit" variant="warning">
                            Satu sumber stok untuk semua operator
                        </Badge>
                        <h1 className="font-display text-5xl leading-[0.98] font-semibold tracking-tight md:text-7xl">
                            Setiap karton,
                            <br />
                            jelas lokasinya.
                        </h1>
                        <p className="max-w-xl text-base leading-relaxed text-primary-foreground/75 md:text-lg">
                            Catat penerimaan, row, valet, batch, reservasi, dan
                            pengeluaran dari layanan gudang yang sama—tanpa
                            database terpisah di PC operator.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-primary-foreground/70">
                        <NetworkIcon className="size-4" aria-hidden="true" />
                        <span>Dirancang untuk jaringan LAN gudang</span>
                    </div>
                </section>

                <section className="flex items-center justify-center p-6 md:p-12">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Akses operasional</CardTitle>
                            <CardDescription>
                                Gunakan akun pribadi yang dibuat oleh admin
                                gudang. Aktivitas dicatat atas nama operator.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link
                                href={auth.user ? dashboard() : login()}
                                className={cn(
                                    buttonVariants({ size: 'lg' }),
                                    'w-full',
                                )}
                            >
                                {auth.user
                                    ? 'Buka ringkasan gudang'
                                    : 'Masuk ke aplikasi'}
                                <ArrowRightIcon data-icon="inline-end" />
                            </Link>
                            <p className="mt-4 text-center text-xs text-muted-foreground">
                                Pendaftaran mandiri dinonaktifkan. Hubungi admin
                                bila Anda belum memiliki akun.
                            </p>
                        </CardContent>
                    </Card>
                </section>
            </main>
        </>
    );
}
