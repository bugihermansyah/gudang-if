import { Head } from '@inertiajs/react';
import { CodeNameForm } from '@/components/master/code-name-form';
import { PageHeader } from '@/components/page-header';

type Company = { id: number; code: string; name: string; active: boolean };

export default function EditCompany({ company }: { company: Company }) {
    return (
        <>
            <Head title={`Edit ${company.code}`} />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Master / Perusahaan"
                    title={`Edit ${company.code}`}
                    description="Perubahan nama atau kode tidak menghapus transaksi historis."
                />
                <div className="max-w-4xl">
                    <CodeNameForm
                        resource="companies"
                        itemLabel="perusahaan"
                        codeLabel="Kode perusahaan"
                        title="Perbarui identitas perusahaan"
                        description="Pastikan kode tetap mudah dibaca pada dokumen dan pencarian."
                        item={company}
                    />
                </div>
            </main>
        </>
    );
}

EditCompany.layout = {
    breadcrumbs: [
        { title: 'Perusahaan', href: '/master/companies' },
        { title: 'Edit', href: '/master/companies' },
    ],
};
