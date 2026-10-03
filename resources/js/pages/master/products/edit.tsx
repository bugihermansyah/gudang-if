import { Head } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import {
    ProductForm,
    type ProductData,
} from '@/components/products/product-form';

export default function EditProduct({ product }: { product: ProductData }) {
    return (
        <>
            <Head title={`Edit ${product.sku}`} />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Master / Produk"
                    title={`Edit ${product.sku}`}
                    description="Perubahan kapasitas akan ditolak bila membuat valet yang sudah berisi melebihi 100%."
                />
                <div className="max-w-4xl">
                    <ProductForm product={product} />
                </div>
            </main>
        </>
    );
}

EditProduct.layout = {
    breadcrumbs: [
        { title: 'Produk', href: '/master/products' },
        { title: 'Edit', href: '/master/products' },
    ],
};
