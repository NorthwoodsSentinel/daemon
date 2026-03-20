import { motion } from 'framer-motion';
import { TreePine, Zap, Globe, MapPin } from 'lucide-react';
import { heroData } from '../generated/daemon-data';

export function Hero() {
  const location = heroData.location;
  return (
    <section className="relative pt-28 pb-6 px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Title + Badge inline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-4 mb-3"
        >
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-wide">
            <span className="text-gradient">ROB CHUVALA</span>
          </h1>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 border border-brand/20">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse-slow" />
            <span className="font-sans text-xs text-brand font-medium">LIVE</span>
          </div>
        </motion.div>

        {/* Mission */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-heading text-xl text-text-secondary mb-3 italic"
        >
          I build the things that prove you are you.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="font-body text-lg text-text-secondary max-w-2xl mx-auto mb-5"
        >
          20 years in cybersecurity. Now building voice fidelity tools at the intersection of AI and human identity. Published from Wisconsin.
        </motion.p>

        {/* Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center mb-3"
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand/10 border border-brand/30">
            <MapPin className="w-3.5 h-3.5 text-brand" />
            <span className="font-sans text-xs text-brand font-medium">{location}</span>
          </div>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-secondary border border-border-subtle">
            <TreePine className="w-3.5 h-3.5 text-brand" />
            <span className="font-sans text-xs text-text-secondary">NorthWoods Sentinel</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-secondary border border-border-subtle">
            <Zap className="w-3.5 h-3.5 text-accent" />
            <span className="font-sans text-xs text-text-secondary">Voice Fidelity</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-secondary border border-border-subtle">
            <Globe className="w-3.5 h-3.5 text-brand" />
            <span className="font-sans text-xs text-text-secondary">Public</span>
          </div>
          <a
            href="/api/"
            className="px-4 py-1.5 rounded-lg font-sans font-medium text-xs bg-brand/10 hover:bg-brand/20 text-brand border border-brand/20 transition-all duration-300"
          >
            API Docs
          </a>
        </motion.div>
      </div>
    </section>
  );
}
