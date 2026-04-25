import Link from "next/link";
import { Home } from "lucide-react";

export function BackButton() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <Home className="h-4 w-4" />
      หน้าแรก
    </Link>
  );
}
