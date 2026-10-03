import { Head } from '@inertiajs/react';
import { CodeNameForm } from '@/components/master/code-name-form';
import { PageHeader } from '@/components/page-header';

type Row = { id: number; code: string; name: string; active: boolean };

export default function EditRow({ row }: { row: Row }) {
    return (
        <>
            <Head title={`Edit ${row.code}`} />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Master / Row"
                    title={`Edit ${row.code}`}
                    description="Row aktif yang masih memiliki valet aktif tidak dapat dinonaktifkan."
                />
                <div className="max-w-4xl">
                    <CodeNameForm
                        resource="rows"
                        itemLabel="row"
                        codeLabel="Kode row"
                        title="Perbarui identitas row"
                        description="Kode row tetap menjadi identitas yang dipakai pada peta gudang."
                        item={row}
                    />
                </div>
            </main>
        </>
    );
}

EditRow.layout = {
    breadcrumbs: [
        { title: 'Row', href: '/master/rows' },
        { title: 'Edit', href: '/master/rows' },
    ],
};
