import { Head } from '@inertiajs/react';

import { ReceivingForm } from '@/components/receiving/receiving-form';
import { PageHeader } from '@/components/page-header';
import { Alert, AlertDescription } from '@/components/ui/alert';

type CompanyOption = { id: number; code: string; name: string };
type ProductOption = {
    id: number;
    sku: string;
    name: string;
    max_cartons_per_valet: number;
};
type ValetOption = {
    id: number;
    code: string;
    row: { code: string; name: string };
};

export default function CreateReceiving({
    companies,
    products,
    valets,
}: {
    companies: CompanyOption[];
    products: ProductOption[];
    valets: ValetOption[];
}) {
    return (
        <>
            <Head title="Buat barang masuk" />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Operasional / F-03"
                    title="Catat barang masuk"
                    description="Buat draft penerimaan, catat hasil bongkar per batch, lalu alokasikan karton ke satu atau beberapa valet."
                />
                {(companies.length === 0 ||
                    products.length === 0 ||
                    valets.length === 0) && (
                    <Alert className="border-warning/40 bg-warning/10 text-warning-foreground">
                        <AlertDescription>
                            Lengkapi master PT asal, produk aktif, dan valet
                            aktif sebelum membuat penerimaan.
                        </AlertDescription>
                    </Alert>
                )}
                <ReceivingForm
                    companies={companies}
                    products={products}
                    valets={valets}
                />
            </main>
        </>
    );
}

CreateReceiving.layout = {
    breadcrumbs: [
        { title: 'Barang masuk', href: '/receiving' },
        { title: 'Buat draft', href: '/receiving/create' },
    ],
};
