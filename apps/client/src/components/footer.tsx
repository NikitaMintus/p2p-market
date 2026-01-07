import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row mx-auto px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-lg">P2P Market</span>
        </Link>
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-right">
          © {new Date().getFullYear()} All rights reserved.
        </p>
      </div>
    </footer>
  );
}

