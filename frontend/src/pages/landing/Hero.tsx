import { useRef, type MouseEvent, type ReactNode } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react';
import { Wrench } from 'lucide-react';
import { CHECKLIST_HERO, IMAGENS, fadeUp, staggerContainer } from './content';

interface HeroProps {
  children: ReactNode;
}

export function Hero({ children }: HeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const glowX = useMotionValue(50);
  const glowY = useMotionValue(30);
  const springX = useSpring(glowX, { stiffness: 60, damping: 20 });
  const springY = useSpring(glowY, { stiffness: 60, damping: 20 });
  const glowBackground = useMotionTemplate`radial-gradient(600px circle at ${springX}% ${springY}%, rgba(245,158,11,0.15), transparent 70%)`;

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (prefersReducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    glowX.set(((e.clientX - rect.left) / rect.width) * 100);
    glowY.set(((e.clientY - rect.top) / rect.height) * 100);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden bg-slate-900 pt-28 pb-20 sm:pt-36 sm:pb-28"
    >
      <img
        src={IMAGENS.hero}
        alt="Mecânico trabalhando no motor de um veículo"
        fetchPriority="high"
        loading="eager"
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/40" />

      {!prefersReducedMotion && (
        <motion.div
          className="pointer-events-none absolute inset-0 hidden [@media(pointer:fine)]:block"
          style={{ background: glowBackground }}
        />
      )}

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={prefersReducedMotion ? undefined : 'hidden'}
          animate="visible"
          variants={staggerContainer(0.14)}
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-medium text-amber-300 mb-6"
          >
            <Wrench className="w-3.5 h-3.5" />
            Gestão completa para oficinas mecânicas
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white mb-5"
          >
            Sua oficina organizada do orçamento à entrega.
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg text-slate-300 mb-8 max-w-xl">
            Clientes, veículos, ordens de serviço, estoque e financeiro em um só lugar — com um
            quadro kanban visual para acompanhar cada reparo até a retirada do veículo.
          </motion.p>

          <motion.ul variants={fadeUp} className="space-y-3">
            {CHECKLIST_HERO.map(({ icon: Icon, texto }) => (
              <li key={texto} className="flex items-start gap-2.5 text-sm text-slate-200">
                <Icon className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                {texto}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
