import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { HIGHLIGHT_CHIPS, fadeUp, staggerContainer } from './content';

export function FeatureHighlightStrip() {
  return (
    <div className="bg-slate-800 border-y border-white/10">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={staggerContainer(0.08)}
        className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-wrap justify-center gap-x-8 gap-y-3"
      >
        {HIGHLIGHT_CHIPS.map((texto) => (
          <motion.div
            key={texto}
            variants={fadeUp}
            className="flex items-center gap-2 text-sm font-medium text-slate-200"
          >
            <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
            {texto}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
