import { Head } from '@inertiajs/react';
import { CodeNameForm } from '@/components/master/code-name-form';
import { PageHeader } from '@/components/page-header';

export default function CreateCompany() {
    return (
        <>
            <Head title="Tambah perusahaan" />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Master / Perusahaan"
                    title="Tambah perusahaan"
                    description="Simpan PT asal dan tujuan sebagai referensi dokumen gudang."
                />
                <div className="max-w-4xl">
                    <CodeNameForm
                        resource="companies"
                        itemLabel="perusahaan"
                        codeLabel="Kode perusahaan"
                        title="Identitas perusahaan"
                        description="Kode dipakai untuk pencarian cepat dan harus unik."
                    />
                </div>
            </main>
        </>
    );
}

CreateCompany.layout = {
    breadcrumbs: [
        { title: 'Perusahaan', href: '/master/companies' },
        { title: 'Tambah', href: '/master/companies/create' },
    ],
};
