import type { Metadata } from "next";
import { validateToken } from "@/shared/lib/validate-token/validateToken";
import { redirect } from 'next/navigation';
import { headers } from "next/headers";

export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Chat G',
  description: 'A blazing-fast messenger that loads in under 1 second, even on slow connections. Chat without waiting.',
  keywords: ['messenger', 'chat', 'fast', 'secure', 'lightweight'],
  openGraph: {
    title: 'Messenger - Fast & Secure',
    description: 'Loads in 1 second. Chat without the wait.',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    follow: true,
  },
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const headerList = await headers()
    const pathname = headerList.get('x-current-path')

    if (pathname !== '/') {
      const token = await validateToken()
      if (token && token.nick) {
        redirect('/')
      }
        else return (
        <>{children}</>
      )
    }
    
    return (
    <>{children}</>)
    }
      
