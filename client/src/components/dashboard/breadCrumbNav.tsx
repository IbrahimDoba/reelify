'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"

export function BreadcrumbNav() {
  const pathname = usePathname()
  const pathSegments = pathname.split('/').filter(Boolean)

  return (
    <nav className="mb-4 flex items-center text-sm text-muted-foreground">
      {pathSegments.map((segment, index) => {
        const href = `/${pathSegments.slice(0, index + 1).join('/')}`
        const isLast = index === pathSegments.length - 1
        
        return (
          <div key={href} className="flex items-center">
            {!isLast ? (
              <>
                <Link
                  href={href}
                  className="capitalize hover:text-foreground transition-colors"
                >
                  {segment.replace(/-/g, ' ')}
                </Link>
                <ChevronRight className="mx-2 h-4 w-4" />
              </>
            ) : (
              <span className="text-foreground capitalize">
                {segment.replace(/-/g, ' ')}
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}