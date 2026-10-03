import { Head } from '@inertiajs/react';
import {
    SimpleMasterIndex,
    type SimpleMasterPage,
} from '@/components/master/simple-master-index';

export default function CompaniesIndex({
    companies,
    filters,
}: {
    companies: SimpleMasterPage;
    filters: { search: string; status: string };
}) {
    return (
        <>
            <Head title="Perusahaan" />
            <SimpleMasterIndex
                resource="companies"
                itemLabel="perusahaan"
                title="Perusahaan asal dan tujuan"
                description="Kelola PT asal untuk penerimaan dan PT tujuan untuk pengeluaran tanpa menghapus riwayat transaksi."
                page={companies}
                filters={filters}
            />
        </>
    );
}

CompaniesIndex.layout = {
    breadcrumbs: [{ title: 'Perusahaan', href: '/master/companies' }],
};
