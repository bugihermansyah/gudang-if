import { Head } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { ProductForm } from '@/components/products/product-form';

export default function CreateProduct() {
    return (
        <>
            <Head title="Tambah produk" />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Master / Produk"
                    title="Tambah produk"
                    description="Tetapkan identitas SKU dan kapasitas karton sebelum barang diterima ke valet."
                />
                <div className="max-w-4xl">
                    <ProductForm />
                </div>
            </main>
        </>
    );
}

CreateProduct.layout = {
    breadcrumbs: [
        { title: 'Produk', href: '/master/products' },
        { title: 'Tambah', href: '/master/products/create' },
    ],
};
