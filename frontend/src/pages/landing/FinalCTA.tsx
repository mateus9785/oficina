import { motion } from 'motion/react';
import { IMAGENS, fadeUp, staggerContainer } from './content';

interface FinalCTAProps {
  onCtaClick: () => void;
}

export function FinalCTA({ onCtaClick }: FinalCTAProps) {
  return (
    <section className="relative overflow-hidden bg-slate-900 py-24 sm:py-32">
      <img
        src={IMAGENS.ctaFundo}
        alt="Mecânico trabalhando em um pneu"
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/85 to-slate-900/70" />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={staggerContainer(0.12)}
        className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center"
      >
        <motion.h2
          variants={fadeUp}
          className="font-display text-3xl sm:text-4xl font-bold text-white mb-4"
        >
          Comece a organizar sua oficina hoje
        </motion.h2>
        <motion.p variants={fadeUp} className="text-lg text-slate-300 mb-8">
          Crie sua conta e comece a cadastrar clientes, veículos e ordens de serviço em poucos
          minutos.
        </motion.p>
        <motion.button
          variants={fadeUp}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onCtaClick}
          className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-8 py-3.5 text-base font-semibold text-slate-900 hover:bg-amber-400 transition-colors cursor-pointer"
        >
          Criar conta grátis
        </motion.button>
        <motion.p variants={fadeUp} className="mt-5 text-sm text-slate-400">
          Sem cartão de crédito. Seus dados ficam isolados dos demais usuários.
        </motion.p>
      </motion.div>
    </section>
  );
}
