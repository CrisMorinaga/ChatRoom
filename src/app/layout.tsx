import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Chat Room',
    description: 'A chat room build using web sockets',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body 
            suppressHydrationWarning={true} 
            className={`${inter.className} content`}
            >
                {children} 
                <Toaster />
            </body>
        </html>
    )
}
