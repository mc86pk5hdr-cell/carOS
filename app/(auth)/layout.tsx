import Link from "next/link";
import { Car } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
        <Car className="size-5" />
        carOS
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
