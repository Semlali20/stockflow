import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div
      className="min-h-screen transition-colors duration-300 relative"
      style={{ background: 'var(--theme-bg)', backgroundAttachment: 'fixed' }}
    >
      {/* Third atmospheric orb — center warmth */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          width: 500,
          height: 500,
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--orb-3, rgba(124,58,237,0.07)) 0%, transparent 70%)',
          filter: 'blur(100px)',
          animation: 'orbDrift 30s ease-in-out infinite',
          animationDelay: '-15s',
        }}
      />

      <Header />
      <div className="flex relative z-10">
        <Sidebar />
        <main className="flex-1 p-6 mt-16 transition-all duration-300 lg:ml-64 rtl:lg:ml-0 rtl:lg:mr-64">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};
