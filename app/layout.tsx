import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SereneNow - Mental Health Care Platform',
  description: 'SereneNow connects mental health professionals with clients seeking therapy through a secure and user-friendly platform.',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" />
      </head>
      <body className="min-h-screen bg-gray-50">
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  )
}
