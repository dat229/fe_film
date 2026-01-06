import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import QueryProvider from '@/components/QueryProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WebFilm - Xem Phim Online',
  description: 'Xem phim online miễn phí, chất lượng cao',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <QueryProvider>
          <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <main>{children}</main>
            <Footer />
          </div>
        </QueryProvider>
      </body>
    </html>
  )
}







