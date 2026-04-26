import Link from 'next/link';

export function Crumbs({ items }: { items: { href: string; label: string }[] }) {
  return (
    <nav className="text-[15px] text-[color:var(--color-neutral-500)]">
      {items.map((it, i) => (
        <span key={it.href}>
          {i > 0 && <span className="mx-2 text-[color:var(--color-neutral-300)]">/</span>}
          {i === items.length - 1 ? (
            <span className="font-medium text-[color:var(--color-primary)]">{it.label}</span>
          ) : (
            <Link href={it.href} className="hover:text-[color:var(--color-neutral-700)]">
              {it.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
