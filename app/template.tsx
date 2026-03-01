// app/template.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPathname = useRef<string | null>(null);

  // Логируем для отладки (можно удалить)
  useEffect(() => {
    prevPathname.current = pathname;
  }, [pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ x: 0, opacity: 0, zIndex: 2}}
        animate={{ x: 0, opacity: 1, zIndex: 2, overflow: "hidden" }}
        exit={{ x: 0, opacity: 0, zIndex: 1}}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          overflow: 'hidden',
          top: 0,
          left: 0,
          width: '100%',
          minHeight: '100vh',
          background: '#000',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}