import type { Metadata } from 'next'
import './globals.css'
import ToasterProvider from '@/components/ToasterProvider'

export const metadata: Metadata = {
  title: 'Cinema Ticket Booking',
  description: 'Book your cinema tickets online',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        {children}
        <ToasterProvider />
      </body>
    </html>
  )
}

