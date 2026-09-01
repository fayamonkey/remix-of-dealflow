/**
 * Co-branded lockup: Golem Karrierewelt × Dirk.
 * Typographic reproduction in the Golem Karrierewelt style
 * (dark wordmark, red arrow mark, indigo "Karrierewelt").
 */
export function GolemDirkLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col leading-tight ${className}`}>
      <div className="flex items-center gap-1.5">
        <span className="text-[15px] font-bold tracking-tight text-sidebar-foreground">
          Golem
        </span>
        <svg
          viewBox="0 0 14 10"
          aria-hidden="true"
          className="h-2.5 w-3.5 shrink-0 text-golem-red"
        >
          <path d="M0 4h8V0l6 5-6 5V6H0z" fill="currentColor" />
        </svg>
        <span className="text-[15px] font-bold tracking-tight text-golem-indigo">
          Karrierewelt
        </span>
      </div>
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-sidebar-foreground/60">
        × Dirk · CRM
      </span>
    </div>
  );
}
