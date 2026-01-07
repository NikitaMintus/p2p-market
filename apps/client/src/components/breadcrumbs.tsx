"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname?.split('/').filter(Boolean) || [];

  // Don't show on home page if somehow rendered there
  if (segments.length === 0) return null;

  let displaySegments = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`;
    const title = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    return { title, href };
  });

  // Custom Overrides
  if (pathname === '/products/create') {
      displaySegments = [
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Product Create', href: '/products/create' }
      ];
  } else if (pathname?.match(/^\/products\/[^/]+\/manage$/)) {
      displaySegments = [
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Manage Product', href: pathname }
      ];
  } else if (pathname?.match(/^\/products\/[^/]+\/edit$/)) {
      displaySegments = [
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Edit Product', href: pathname }
      ];
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      <Link href="/" className="hover:text-foreground flex items-center transition-colors">
        <Home className="w-4 h-4" />
      </Link>
      {displaySegments.map((item, index) => {
        const isLast = index === displaySegments.length - 1;
        const isClickable = item.href !== '/dashboard/transactions';

        return (
          <div key={item.href} className="flex items-center space-x-1">
            <ChevronRight className="w-4 h-4" />
            {isLast || !isClickable ? (
              <span className={isLast ? "font-medium text-foreground" : ""}>{item.title}</span>
            ) : (
              <Link href={item.href} className="hover:text-foreground transition-colors">
                {item.title}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  )
}
