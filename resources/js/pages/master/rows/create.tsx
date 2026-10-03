import { Head } from '@inertiajs/react';
import { CodeNameForm } from '@/components/master/code-name-form';
import { PageHeader } from '@/components/page-header';

export default function CreateRow() {
    return (
        <>
            <Head title="Tambah row" />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Master / Row"
                    title="Tambah row"
                    description="Buat kelompok penyimpanan berkode unik tanpa nomor slot."
                />
                <div className="max-w-4xl">
                    <CodeNameForm
                        resource="rows"
                        itemLabel="row"
                        codeLabel="Kode row"
                        title="Identitas row"
                        description="Contoh kode: ROW-A01. Satu row dapat menampung banyak valet."
                    />
                </div>
            </main>
        </>
    );
}

CreateRow.layout = {
    breadcrumbs: [
        { title: 'Row', href: '/master/rows' },
        { title: 'Tambah', href: '/master/rows/create' },
    ],
};
