// app/(auth)/layout.tsx или page.tsx
import { validateToken } from "../api/me/route";
import { redirect } from 'next/navigation';
import { headers } from "next/headers";

export const runtime = 'nodejs';

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
      
    // Игнорируем ошибки (например, невалидный токен)

  // Обязательно возвращаем children, если не редиректим
