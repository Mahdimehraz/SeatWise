import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}

