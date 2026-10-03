import { Head } from '@inertiajs/react';
import { UserForm, type RoleOption } from '@/components/master/user-form';
import { PageHeader } from '@/components/page-header';

export default function CreateUser({
    roleOptions,
}: {
    roleOptions: RoleOption[];
}) {
    return (
        <>
            <Head title="Tambah akun pengguna" />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Master / Akun pengguna"
                    title="Tambah akun pengguna"
                    description="Buat akun personal untuk operator, supervisor, atau admin gudang."
                />
                <div className="max-w-4xl">
                    <UserForm roleOptions={roleOptions} />
                </div>
            </main>
        </>
    );
}

CreateUser.layout = {
    breadcrumbs: [
        { title: 'Akun pengguna', href: '/master/users' },
        { title: 'Tambah', href: '/master/users/create' },
    ],
};
