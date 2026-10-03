import { Link, usePage } from '@inertiajs/react';
import {
    Building2Icon,
    ContainerIcon,
    LayoutDashboardIcon,
    MapIcon,
    PackageIcon,
    ReceiptTextIcon,
    Rows3Icon,
    UsersIcon,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Ringkasan gudang',
        href: dashboard(),
        icon: LayoutDashboardIcon,
    },
    {
        title: 'Barang masuk',
        href: '/receiving',
        icon: ReceiptTextIcon,
    },
    {
        title: 'Peta gudang',
        href: '/warehouse-map',
        icon: MapIcon,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Produk',
        href: '/master/products',
        icon: PackageIcon,
    },
    {
        title: 'Perusahaan',
        href: '/master/companies',
        icon: Building2Icon,
    },
    {
        title: 'Row',
        href: '/master/rows',
        icon: Rows3Icon,
    },
    {
        title: 'Valet',
        href: '/master/valets',
        icon: ContainerIcon,
    },
    {
        title: 'Akun pengguna',
        href: '/master/users',
        icon: UsersIcon,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;

    return (
        <Sidebar collapsible="icon" variant="inset" className="print:hidden">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} label="Operasional" />
                {auth.user.role === 'admin' && (
                    <NavMain items={adminNavItems} label="Master data" />
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
