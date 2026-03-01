// app/layout.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import './globals.css';


export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();

  useEffect(() => {
    // Добавляем класс после гидратации → показываем контент
    document.body.classList.add('hydrated');
  }, []);

  return (
    <html lang="en">
      <body className={`antialiased`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              minHeight: '100vh',
              background: '#000',
            }}>
                {children}
          </motion.div>
        </AnimatePresence>
      </body>
    </html>
  );
}