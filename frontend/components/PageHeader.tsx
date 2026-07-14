interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line bg-paper px-8 py-7">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-paprika">
          {eyebrow}
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-xl text-sm text-ink-soft">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
