import Link from 'next/link';

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--color-neutral-100)] bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="text-[15px] font-semibold tracking-tight text-[color:var(--color-neutral-800)]">
            NCS Jobtask
          </span>
        </Link>
        <nav className="ml-auto flex items-center gap-1 text-[15px]">
          <NavLink href="/jobtask/process" label="직무과제" emphasize />
          <NavLink href="/openings" label="공고" />
          <NavLink href="/explore" label="탐색" />
          <NavLink href="/treemap" label="히트맵" />
          <NavLink href="/orbits" label="궤도" />
          <NavLink href="/map" label="지도" />
          <NavLink href="/categories" label="카테고리" />
          <Link
            href="/treemap"
            className="ml-3 rounded-xl bg-[color:var(--color-primary)] px-4 py-2 text-[15px] font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
          >
            시작하기
          </Link>
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  label,
  muted,
  emphasize,
}: {
  href: string;
  label: string;
  muted?: boolean;
  emphasize?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        'rounded-md px-3 py-1.5 font-medium transition ' +
        (emphasize
          ? 'text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary-light)]'
          : muted
          ? 'text-[color:var(--color-neutral-500)] hover:text-[color:var(--color-neutral-700)]'
          : 'text-[color:var(--color-neutral-700)] hover:bg-[color:var(--color-neutral-50)] hover:text-[color:var(--color-neutral-900)]')
      }
    >
      {label}
    </Link>
  );
}

function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="2" width="9" height="9" rx="2" fill="#006CD1" />
      <rect x="13" y="2" width="9" height="9" rx="2" fill="#006CD1" opacity="0.55" />
      <rect x="2" y="13" width="9" height="9" rx="2" fill="#006CD1" opacity="0.3" />
      <rect x="13" y="13" width="9" height="9" rx="2" fill="#006CD1" opacity="0.85" />
    </svg>
  );
}
