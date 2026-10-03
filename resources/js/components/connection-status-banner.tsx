import { router } from '@inertiajs/react';
import { RefreshCwIcon, WifiOffIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

const REVALIDATE_AFTER_MS = 60_000;

export function ConnectionStatusBanner() {
    const [isOnline, setIsOnline] = useState(true);
    const [isStale, setIsStale] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const lastRevalidatedAt = useRef(0);

    const revalidate = useCallback(() => {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            setIsOnline(false);
            setIsStale(true);
            return;
        }

        setIsRefreshing(true);
        router.reload({
            async: true,
            onStart: () => setIsRefreshing(true),
            onSuccess: () => {
                lastRevalidatedAt.current = Date.now();
                setIsOnline(true);
                setIsStale(false);
            },
            onError: () => setIsStale(true),
            onFinish: () => setIsRefreshing(false),
        });
    }, []);

    useEffect(() => {
        const handleOffline = () => {
            setIsOnline(false);
            setIsStale(true);
        };
        const handleOnline = () => {
            setIsOnline(true);
            revalidate();
        };
        const handleVisibilityChange = () => {
            if (
                document.visibilityState === 'visible' &&
                Date.now() - lastRevalidatedAt.current >= REVALIDATE_AFTER_MS
            ) {
                revalidate();
            }
        };

        const removeNetworkErrorListener = router.on('networkError', () => {
            setIsStale(true);
        });
        const removeHttpExceptionListener = router.on(
            'httpException',
            (event) => {
                if (event.detail.response.status >= 500) {
                    setIsStale(true);
                }
            },
        );

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        if (!navigator.onLine) {
            handleOffline();
        } else {
            lastRevalidatedAt.current = Date.now();
        }

        return () => {
            removeNetworkErrorListener();
            removeHttpExceptionListener();
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );
        };
    }, [revalidate]);

    if (isOnline && !isStale) {
        return null;
    }

    const title = isOnline
        ? 'Data mungkin belum mutakhir'
        : 'Koneksi ke server terputus';
    const description = isOnline
        ? 'Data halaman dapat berubah. Muat ulang untuk mengambil kondisi terbaru dari server.'
        : 'Data terakhir tetap terlihat sebagai salinan lama. Perubahan baru akan dicoba setelah koneksi pulih.';

    return (
        <Alert
            variant={isOnline ? 'default' : 'destructive'}
            className="rounded-none border-x-0 border-t-0 px-6 py-3 md:px-8 print:hidden"
        >
            {isOnline ? (
                <RefreshCwIcon data-icon="inline-start" />
            ) : (
                <WifiOffIcon data-icon="inline-start" />
            )}
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription className="flex flex-wrap items-center gap-3">
                <span>{description}</span>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={revalidate}
                    disabled={isRefreshing}
                >
                    {isRefreshing ? (
                        <Spinner data-icon="inline-start" />
                    ) : (
                        <RefreshCwIcon data-icon="inline-start" />
                    )}
                    {isRefreshing ? 'Memuat ulang...' : 'Coba lagi'}
                </Button>
            </AlertDescription>
        </Alert>
    );
}
