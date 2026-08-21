import { motion, useReducedMotion } from 'motion/react';
import { ETAPAS_KANBAN, IMAGENS, fadeUp, staggerContainer } from './content';

export function KanbanFlow() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="fluxo" className="relative bg-slate-900 py-20 sm:py-28 overflow-hidden">
      <img
        src={IMAGENS.fluxoTextura}
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover opacity-10"
      />
      <div className="absolute inset-0 bg-slate-900/80" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer(0.1)}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <motion.h2
            variants={fadeUp}
            className="font-display text-3xl sm:text-4xl font-bold text-white mb-4"
          >
            Da aprovação à entrega, sem perder o controle
          </motion.h2>
          <motion.p variants={fadeUp} className="text-slate-400 text-lg">
            Cada ordem de serviço passa por um fluxo visual de 5 etapas — atualize o status e
            acompanhe tudo em tempo real.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer(0.12)}
          className="relative grid grid-cols-1 sm:grid-cols-5 gap-4 sm:gap-2"
        >
          <div className="hidden sm:block absolute top-6 left-[10%] right-[10%] h-px bg-white/15" />
          {!prefersReducedMotion && (
            <motion.div
              className="hidden sm:block absolute top-[22px] w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_12px_2px_rgba(245,158,11,0.6)]"
              animate={{ left: ['10%', '90%'] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          {ETAPAS_KANBAN.map((etapa, i) => (
            <motion.div key={etapa} variants={fadeUp} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 w-12 h-12 rounded-full bg-slate-800 border-2 border-amber-500 flex items-center justify-center font-display font-bold text-amber-400 mb-3">
                {i + 1}
              </div>
              <p className="text-sm font-medium text-slate-200 max-w-[9rem]">{etapa}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
