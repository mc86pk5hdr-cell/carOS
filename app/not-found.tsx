import Link from "next/link";
import { Car } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <Car className="size-10 text-muted-foreground" />
      <div>
        <p className="font-medium">Page not found</p>
        <p className="text-sm text-muted-foreground">
          It may have been moved, deleted, or never existed.
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard">Back to your garage</Link>
      </Button>
    </div>
  );
}
