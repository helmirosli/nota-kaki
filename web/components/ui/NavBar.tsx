"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import { useProgressStore } from "@/store/progress"
import { SUBJECTS } from "@/lib/types"
import { useState, useEffect } from "react"

const YEAR_LABELS: Record<string, string> = {
  "tahun-1": "Tahun 1", "tahun-2": "Tahun 2", "tahun-3": "Tahun 3",
  "tahun-4": "Tahun 4", "tahun-5": "Tahun 5", "tahun-6": "Tahun 6",
}

function buildBreadcrumbs(pathname: string) {
  // segments like ["jais", "tahun-1", "akhlak", "jais-tahun-1-akhlak-bab1"]
  const parts = pathname.split("/").filter(Boolean)
  if (parts.length === 0) return []

  const crumbs: { label: string; href: string }[] = []
  let href = ""

  for (let i = 0; i < parts.length; i++) {
    const seg = parts[i]
    href += `/${seg}`

    if (i === 0) {
      // source: jais, kssr
      crumbs.push({ label: seg.toUpperCase(), href })
    } else if (i === 1) {
      // year
      crumbs.push({ label: YEAR_LABELS[seg] ?? seg, href })
    } else if (i === 2) {
      // subject
      const meta = SUBJECTS.find((s) => s.id === seg)
      crumbs.push({ label: meta ? `${meta.emoji} ${meta.label}` : seg, href })
    }
    // skip note ID (i === 3) — already on that page
  }

  return crumbs
}

export function NavBar() {
  const pathname = usePathname()
  const totalStarsRaw = useProgressStore((s) => s.getTotalStars())
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const totalStars = mounted ? totalStarsRaw : 0

  const isHome = pathname === "/"
  const breadcrumbs = buildBreadcrumbs(pathname)

  return (
    <motion.nav
      className="relative z-20 flex items-center justify-between px-6 py-4"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <motion.span
            className="text-3xl"
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            📚
          </motion.span>
          {isHome && (
            <span className="text-2xl font-black text-amber-600 group-hover:text-amber-700 transition-colors">
              Nota Kaki
            </span>
          )}
        </Link>

        {breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1 min-w-0">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1 min-w-0">
                <span className="text-amber-400 font-bold text-sm shrink-0">›</span>
                <Link href={crumb.href}>
                  <motion.span
                    className="text-sm font-bold text-amber-700 hover:text-amber-900 transition-colors truncate block max-w-[120px]"
                    whileHover={{ scale: 1.05 }}
                  >
                    {crumb.label}
                  </motion.span>
                </Link>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <Link href="/progress">
          <motion.div
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold px-4 py-2 rounded-full shadow-md transition-colors cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>⭐</span>
            <span>{totalStars}</span>
          </motion.div>
        </Link>
      </div>
    </motion.nav>
  )
}
