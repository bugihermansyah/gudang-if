import { Head } from '@inertiajs/react';
import {
    SimpleMasterIndex,
    type SimpleMasterPage,
} from '@/components/master/simple-master-index';

export default function RowsIndex({
    rows,
    filters,
}: {
    rows: SimpleMasterPage;
    filters: { search: string; status: string };
}) {
    return (
        <>
            <Head title="Row" />
            <SimpleMasterIndex
                resource="rows"
                itemLabel="row"
                title="Row penyimpanan"
                description="Row berkode unik menampung banyak valet. Sistem tidak mencatat nomor slot atau posisi fisik semu."
                page={rows}
                filters={filters}
            />
        </>
    );
}

RowsIndex.layout = {
    breadcrumbs: [{ title: 'Row', href: '/master/rows' }],
};
