import { Users, ClipboardList, Package, Wallet, BarChart3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Variants } from 'motion/react';

export const ETAPAS_KANBAN = [
  'Aguardando aprovação',
  'Aguardando peça',
  'Em execução',
  'Pronto pra retirada',
  'Finalizado',
];

export const CHECKLIST_HERO = [
  { icon: Users, texto: 'Clientes e veículos com histórico completo' },
  { icon: ClipboardList, texto: 'Ordens de serviço em quadro kanban' },
  { icon: Package, texto: 'Controle de estoque de peças com alerta de mínimo' },
  { icon: Wallet, texto: 'Financeiro com contas a receber automáticas' },
];

export const HIGHLIGHT_CHIPS = [
  '5 módulos integrados',
  'Kanban com 5 etapas',
  'Conta a receber automática',
  'Dados isolados por conta',
];

interface FeatureCard {
  icon: LucideIcon;
  titulo: string;
  descricao: string;
  imagem?: string;
  destaque?: boolean;
}

export const FEATURE_CARDS: FeatureCard[] = [
  {
    icon: ClipboardList,
    titulo: 'Ordens de Serviço',
    descricao:
      'Acompanhe cada reparo em um quadro kanban visual, da aprovação do orçamento até a retirada do veículo, sem perder o fio da meada.',
    imagem: imgUrl('photo-1632733711679-529326f6db12', 1200),
    destaque: true,
  },
  {
    icon: Users,
    titulo: 'Clientes & Veículos',
    descricao:
      'Cadastro de clientes e veículos com histórico completo de ordens de serviço, sempre à mão para consultar o que já foi feito em cada carro.',
  },
  {
    icon: Package,
    titulo: 'Estoque',
    descricao:
      'Controle de peças com alerta automático de estoque mínimo, para nunca começar um serviço sem a peça certa em mãos.',
    imagem: imgUrl('photo-1637640125496-31852f042a60', 1200),
  },
  {
    icon: Wallet,
    titulo: 'Financeiro',
    descricao:
      'Ao finalizar uma ordem de serviço, a conta a receber é gerada automaticamente — menos lançamento manual, menos esquecimento.',
    imagem: imgUrl('photo-1487754180451-c456f719a1fc', 1200),
  },
  {
    icon: BarChart3,
    titulo: 'Relatórios & Dashboard',
    descricao:
      'Painéis com indicadores de faturamento, ticket médio, estoque e ordens em andamento, com gráficos para acompanhar a saúde da oficina em segundos.',
  },
];

export function imgUrl(id: string, width: number) {
  return `https://images.unsplash.com/${id}?q=80&w=${width}&auto=format&fit=crop`;
}

export const IMAGENS = {
  hero: imgUrl('photo-1615906655593-ad0386982a0f', 2000),
  fluxoTextura: imgUrl('photo-1619642751034-765dfdf7c58e', 1600),
  ctaFundo: imgUrl('photo-1645445522156-9ac06bc7a767', 1800),
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function staggerContainer(stagger = 0.12): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: 0.1 },
    },
  };
}
