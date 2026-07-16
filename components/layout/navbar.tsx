import Link from "next/link";
import { Car, LogOut } from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Navbar({ email }: { email?: string }) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Car className="size-5" />
          VMS
        </Link>
        <div className="flex items-center gap-2">
          {email && (
            <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
          )}
          <ThemeToggle />
          <form action={logout}>
            <Button variant="ghost" size="icon" aria-label="Sign out" type="submit">
              <LogOut className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
