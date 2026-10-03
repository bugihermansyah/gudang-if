import { Head } from '@inertiajs/react';
import { ValetForm, type ValetData } from '@/components/master/valet-form';
import { PageHeader } from '@/components/page-header';

type Row = { id: number; code: string; name: string };
type Props = {
    valet: ValetData;
    rows: Row[];
    statusOptions: { value: string; label: string }[];
};

export default function EditValet({ valet, rows, statusOptions }: Props) {
    return (
        <>
            <Head title={`Edit ${valet.code}`} />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Master / Valet"
                    title={`Edit ${valet.code}`}
                    description="Perubahan row, status, dan label tidak mengubah saldo stok valet."
                />
                <div className="max-w-4xl">
                    <ValetForm
                        valet={valet}
                        rows={rows}
                        statusOptions={statusOptions}
                    />
                </div>
            </main>
        </>
    );
}

EditValet.layout = {
    breadcrumbs: [
        { title: 'Valet', href: '/master/valets' },
        { title: 'Edit', href: '/master/valets' },
    ],
};
