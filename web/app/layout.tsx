import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import "./globals.css"
import { BackgroundParticles } from "@/components/ui/BackgroundParticles"
import { Mascot } from "@/components/mascot/Mascot"
import { NavBar } from "@/components/ui/NavBar"

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
})

export const metadata: Metadata = {
  title: "Nota Kaki 🌟",
  description: "Nota belajar seronok untuk kanak-kanak Muslim",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms" className={`${nunito.variable} h-full`} data-scroll-behavior="smooth">
      <body className="min-h-full font-nunito bg-amber-50 text-gray-800 antialiased">
        <BackgroundParticles />
        <NavBar />
        <Mascot />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  )
}
