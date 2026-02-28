import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Identity Sprint — Become who you\'re meant to be',
  description: 'A 30-day done-with-you identity transformation sprint. Not willpower. Not discipline. A new you.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
