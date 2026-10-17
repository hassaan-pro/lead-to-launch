import { cn } from "@/lib/utils";

/** Four small corner marks that lock onto whatever sits inside the box. */
export function Bracket({ className, color = "border-lamp" }: { className?: string; color?: string }) {
  return (
    <span aria-hidden="true" className={cn("pointer-events-none absolute inset-0", className)}>
      <span className={cn("absolute left-0 top-0 h-3.5 w-3.5 border-l-2 border-t-2", color)} />
      <span className={cn("absolute right-0 top-0 h-3.5 w-3.5 border-r-2 border-t-2", color)} />
      <span className={cn("absolute bottom-0 left-0 h-3.5 w-3.5 border-b-2 border-l-2", color)} />
      <span className={cn("absolute bottom-0 right-0 h-3.5 w-3.5 border-b-2 border-r-2", color)} />
    </span>
  );
}
