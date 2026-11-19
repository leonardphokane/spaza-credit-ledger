import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Spaza Credit Ledger',
  description: 'Digital credit book for spaza shops',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
