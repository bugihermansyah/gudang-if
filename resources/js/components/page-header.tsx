import type { ReactNode } from 'react';

export function PageHeader({
    eyebrow,
    title,
    description,
    actions,
}: {
    eyebrow: string;
    title: string;
    description: string;
    actions?: ReactNode;
}) {
    return (
        <header className="flex flex-col gap-4 border-l-4 border-accent pl-4 md:flex-row md:items-end md:justify-between">
            <div className="flex max-w-3xl flex-col gap-1">
                <p className="font-data text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                    {eyebrow}
                </p>
                <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                    {title}
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground">
                    {description}
                </p>
            </div>
            {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
        </header>
    );
}
