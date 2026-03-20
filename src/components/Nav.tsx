import { motion, useScroll, useTransform } from 'framer-motion';
import { TreePine, FileText, Target } from 'lucide-react';

export function Nav() {
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 100], [0, 0.95]);
  const borderOpacity = useTransform(scrollY, [0, 100], [0, 1]);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Solid background - always visible to prevent content showing through */}
      <div className="absolute inset-0 bg-bg-primary" />
      {/* Blur effect on scroll */}
      <motion.div
        className="absolute inset-0 backdrop-blur-xl"
        style={{ opacity: bgOpacity }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-border-default"
        style={{ opacity: borderOpacity }}
      />

      <div className="relative max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo / Brand */}
        <a href="/" className="flex items-center gap-3 group">
          <TreePine className="w-6 h-6 text-brand" />
          <span className="font-display font-bold text-xl text-text-primary group-hover:text-brand transition-colors tracking-wide">
            NORTHWOODS
          </span>
        </a>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <a
            href="/api"
            className="flex items-center gap-2 text-text-secondary hover:text-brand transition-colors font-sans text-sm"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">API Docs</span>
          </a>
          <a
            href="/telos"
            className="flex items-center gap-2 text-text-secondary hover:text-brand transition-colors font-sans text-sm"
          >
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">TELOS</span>
          </a>
          <a
            href="https://northwoodssentinel.com"
            className="px-4 py-2 rounded-lg font-sans font-medium text-sm bg-brand/10 hover:bg-brand/20 text-brand border border-brand/20 transition-all duration-300"
          >
            Blog
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
