import { Head } from '@inertiajs/react';
import { ValetForm } from '@/components/master/valet-form';
import { PageHeader } from '@/components/page-header';

type Row = { id: number; code: string; name: string };
const statusOptions = [
    { value: 'aktif', label: 'Aktif' },
    { value: 'perawatan', label: 'Perawatan' },
    { value: 'nonaktif', label: 'Nonaktif' },
];

export default function CreateValet({ rows }: { rows: Row[] }) {
    return (
        <>
            <Head title="Tambah valet" />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Master / Valet"
                    title="Tambah valet"
                    description="Buat identitas valet permanen dan tempatkan pada row aktif."
                />
                <div className="max-w-4xl">
                    <ValetForm rows={rows} statusOptions={statusOptions} />
                </div>
            </main>
        </>
    );
}

CreateValet.layout = {
    breadcrumbs: [
        { title: 'Valet', href: '/master/valets' },
        { title: 'Tambah', href: '/master/valets/create' },
    ],
};
