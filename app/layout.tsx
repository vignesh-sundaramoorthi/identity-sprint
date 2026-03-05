import type { Metadata, Viewport } from 'next'
import './globals.css'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'

export const metadata: Metadata = {
  title: 'Identity Sprint — Become who you\'re meant to be',
  description: 'For mid-career professionals ready to change who they are, not just what they do. Applications open.',
  openGraph: {
    title: 'Identity Sprint — 7-Day 1:1 Coaching Program',
    description: 'For mid-career professionals ready to change who they are, not just what they do. Applications open.',
    url: 'https://identity-sprint.vercel.app',
    siteName: 'Identity Sprint',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Identity Sprint — 7-Day 1:1 Coaching Program',
    description: 'For mid-career professionals ready to change who they are, not just what they do. Applications open.',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Identity Sprint',
  },
}

export const viewport: Viewport = {
  themeColor: '#7c3aed',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
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
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Identity Sprint" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="bg-white font-sans antialiased">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  )
}
