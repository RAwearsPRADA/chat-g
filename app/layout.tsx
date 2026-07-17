// app/layout.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { PreloaderHider } from '@/shared/components/PreloaderHider';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import './globals.css';


export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();

  useEffect(() => {
    document.body.classList.add('hydrated');
  }, []);

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          #preloader {
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background-color: #000; /* Под цвет твоего фона */
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            transition: opacity 0.3s ease, visibility 0.3s ease;
          }
          .spinner {
            width: 50px; height: 50px;
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            border-top-color: #772ce8; /* Цвет крутилки */
            animation: spin 1s ease-in-out infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .preloader-hidden {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
          }
        `}} />
      </head>
      <body className={`antialiased`}>
        <div id="preloader">
          <div className="spinner"></div>
        </div>
        <PreloaderHider/>
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