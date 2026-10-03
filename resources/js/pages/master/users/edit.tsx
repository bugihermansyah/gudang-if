import { Head } from '@inertiajs/react';
import {
    UserForm,
    type RoleOption,
    type UserFormData,
} from '@/components/master/user-form';
import { PageHeader } from '@/components/page-header';

type User = Omit<UserFormData, 'password' | 'password_confirmation'> & {
    active: boolean;
};

export default function EditUser({
    user,
    roleOptions,
}: {
    user: User;
    roleOptions: RoleOption[];
}) {
    return (
        <>
            <Head title={`Edit ${user.name}`} />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Master / Akun pengguna"
                    title={`Edit ${user.name}`}
                    description="Perubahan peran berlaku pada akses berikutnya setelah pengguna memuat ulang aplikasi."
                />
                <div className="max-w-4xl">
                    <UserForm user={user} roleOptions={roleOptions} />
                </div>
            </main>
        </>
    );
}

EditUser.layout = {
    breadcrumbs: [
        { title: 'Akun pengguna', href: '/master/users' },
        { title: 'Edit', href: '/master/users' },
    ],
};
