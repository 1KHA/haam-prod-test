import type React from "react"
import "./globals.css"
import { Cairo } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "@/app/providers"

const cairo = Cairo({ subsets: ["arabic"] })

export const metadata = {
  title: "لوحة تحكم الهاكاثون",
  description: "إدارة الهاكاثونات والمستخدمين والفرق والمزيد",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={cairo.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
