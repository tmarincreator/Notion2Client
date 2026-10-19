import { Wordmark } from "@/components/ui/Logo";

export function Pie() {
  return (
    <footer className="border-t border-[var(--border)]">
      <div className="wrap flex flex-wrap items-center justify-between gap-3 py-6 text-[13px] text-[var(--ink-muted)]">
        <span className="n2c-wordmark text-sm">
          <Wordmark pequeno />
        </span>
        <span>© 2026 Notion2Client Portal</span>
      </div>
    </footer>
  );
}
