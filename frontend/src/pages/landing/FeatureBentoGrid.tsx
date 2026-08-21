import { motion } from 'motion/react';
import { FEATURE_CARDS, fadeUp, staggerContainer } from './content';

export function FeatureBentoGrid() {
  return (
    <section id="recursos" className="bg-slate-950 py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer(0.1)}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <motion.h2
            variants={fadeUp}
            className="font-display text-3xl sm:text-4xl font-bold text-white mb-4"
          >
            Tudo que sua oficina precisa, em um só sistema
          </motion.h2>
          <motion.p variants={fadeUp} className="text-slate-400 text-lg">
            Da entrada do veículo ao pagamento, cada etapa do fluxo de trabalho tem um lugar
            certo — sem planilhas soltas ou papel perdido.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer(0.08)}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5"
        >
          {FEATURE_CARDS.map(({ icon: Icon, titulo, descricao, imagem, destaque }) => (
            <motion.div
              key={titulo}
              variants={fadeUp}
              className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900 hover:border-amber-500/40 transition-colors ${
                destaque ? 'lg:col-span-4 lg:row-span-2' : 'lg:col-span-2'
              }`}
            >
              {imagem && (
                <>
                  <img
                    src={imagem}
                    alt={titulo}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-35 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-slate-900/40" />
                </>
              )}
              <div
                className={`relative flex flex-col h-full p-6 ${destaque ? 'sm:p-8 justify-end min-h-[280px] lg:min-h-full' : 'justify-start'}`}
              >
                <div className="inline-flex w-fit items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/30 p-2.5 mb-4">
                  <Icon className="w-5 h-5 text-amber-400" />
                </div>
                <h3
                  className={`font-display font-semibold text-white mb-2 ${destaque ? 'text-2xl' : 'text-lg'}`}
                >
                  {titulo}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">{descricao}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
