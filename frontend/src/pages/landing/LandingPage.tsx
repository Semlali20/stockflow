import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Bell,
  BarChart3,
  Globe,
  Check,
  ArrowRight,
  Star,
  Users,
  Zap,
  Clock,
  Menu,
  X,
  Twitter,
  Linkedin,
  Github,
  ChevronRight,
} from 'lucide-react';

// ─── Animation Variants ────────────────────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// ─── Section Wrapper with scroll-triggered animation ──────────────────────────

const AnimatedSection = ({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={fadeInUp}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ─── Navbar ───────────────────────────────────────────────────────────────────

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1e1b4b]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">StockFlow</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="text-indigo-200 hover:text-white transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="text-indigo-200 hover:text-white transition-colors">Tarifs</a>
            <a href="#waitlist" className="text-indigo-200 hover:text-white transition-colors">Démo</a>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-indigo-200 hover:text-white text-sm font-medium transition-colors px-3 py-1.5"
            >
              Se connecter
            </Link>
            <Link
              to="/register"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-indigo-900/40"
            >
              Commencer gratuitement
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-[#1e1b4b] border-t border-white/10 px-4 py-4 flex flex-col gap-3"
        >
          <a href="#features" onClick={() => setMenuOpen(false)} className="text-indigo-200 text-sm py-2">Fonctionnalités</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)} className="text-indigo-200 text-sm py-2">Tarifs</a>
          <a href="#waitlist" onClick={() => setMenuOpen(false)} className="text-indigo-200 text-sm py-2">Démo</a>
          <hr className="border-white/10" />
          <Link to="/login" className="text-indigo-200 text-sm py-2">Se connecter</Link>
          <Link
            to="/register"
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg text-center"
          >
            Commencer gratuitement
          </Link>
        </motion.div>
      )}
    </nav>
  );
};

// ─── Hero Section ─────────────────────────────────────────────────────────────

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-[#2d2a6e] to-[#312e81] pt-16">
      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full border border-indigo-500/20"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
          className="absolute top-20 -right-12 w-64 h-64 rounded-full border border-blue-400/15"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full border border-purple-500/10"
        />
        <div className="absolute top-1/3 left-1/4 w-2 h-2 rounded-full bg-blue-400/60 animate-pulse" />
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 rounded-full bg-indigo-300/50 animate-pulse delay-700" />
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 rounded-full bg-purple-300/50 animate-pulse delay-1000" />
        {/* Glowing blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-purple-600/15 rounded-full blur-3xl" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* Animated badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-sm font-medium px-4 py-2 rounded-full mb-8 backdrop-blur-sm"
        >
          <span className="text-base">✨</span>
          <span>Nouveau : Service Achats &amp; Ventes disponible</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6"
        >
          Gérez votre stock{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            intelligemment
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg sm:text-xl text-indigo-200/80 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          La plateforme SaaS tout-en-un pour les PME qui veulent maîtriser leurs stocks, achats et ventes en temps réel.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/register"
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-7 py-3.5 rounded-xl shadow-xl shadow-indigo-900/50 transition-all hover:scale-105 hover:shadow-indigo-800/60 text-base"
          >
            Commencer gratuitement
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl backdrop-blur-sm transition-all hover:scale-105 text-base"
          >
            <Zap className="w-4 h-4 text-indigo-300" />
            Voir la démo
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-indigo-300/70 text-sm"
        >
          <div className="flex -space-x-2">
            {['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'].map((color, i) => (
              <div key={i} className={`w-8 h-8 rounded-full ${color} border-2 border-[#1e1b4b] flex items-center justify-center text-white text-xs font-bold`}>
                {['A', 'B', 'C', 'D'][i]}
              </div>
            ))}
          </div>
          <span>Rejoint par <strong className="text-indigo-200">500+ entreprises</strong> ce mois</span>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="ml-1">4.9/5</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 80L1440 80L1440 40C1200 80 960 0 720 20C480 40 240 80 0 40L0 80Z" fill="#f8fafc" />
        </svg>
      </div>
    </section>
  );
};

// ─── Stats Bar ────────────────────────────────────────────────────────────────

const stats = [
  { icon: Users, value: '500+', label: 'Entreprises' },
  { icon: Zap, value: '1M+', label: 'Mouvements/mois' },
  { icon: Clock, value: '99.9%', label: 'Uptime' },
  { icon: ArrowRight, value: '< 2min', label: 'Onboarding' },
];

const StatsBar = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <section className="bg-slate-50 py-12 border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              variants={cardVariant}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-3">
                <stat.icon className="w-5 h-5 text-[#2C3E90]" />
              </div>
              <span className="text-2xl font-extrabold text-slate-800">{stat.value}</span>
              <span className="text-sm text-slate-500 mt-0.5">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ─── Features Section ─────────────────────────────────────────────────────────

const features = [
  {
    icon: Package,
    emoji: '📦',
    title: 'Gestion des stocks',
    description: 'Suivi en temps réel multi-entrepôts. Niveaux min/max, historique complet et alertes automatiques.',
    color: 'bg-blue-50 text-blue-600',
    border: 'hover:border-blue-200',
  },
  {
    icon: ShoppingCart,
    emoji: '🛒',
    title: 'Service Achats',
    description: 'Gérez vos fournisseurs, créez des bons de commande et suivez les réceptions en quelques clics.',
    color: 'bg-indigo-50 text-indigo-600',
    border: 'hover:border-indigo-200',
  },
  {
    icon: TrendingUp,
    emoji: '💼',
    title: 'Service Ventes',
    description: 'Clients, devis, bons de livraison — tout le cycle de vente dans une interface unifiée.',
    color: 'bg-purple-50 text-purple-600',
    border: 'hover:border-purple-200',
  },
  {
    icon: Bell,
    emoji: '🔔',
    title: 'Alertes automatiques',
    description: 'Notifications intelligentes pour les stocks bas, les dates d\'expiration et les seuils critiques.',
    color: 'bg-orange-50 text-orange-500',
    border: 'hover:border-orange-200',
  },
  {
    icon: BarChart3,
    emoji: '📊',
    title: 'Tableaux de bord',
    description: 'KPIs visuels, graphiques interactifs et analyses en temps réel pour piloter votre activité.',
    color: 'bg-emerald-50 text-emerald-600',
    border: 'hover:border-emerald-200',
  },
  {
    icon: Globe,
    emoji: '🌍',
    title: 'Multi-langues',
    description: 'Interface disponible en Français, Anglais et Arabe. Adapté aux équipes internationales.',
    color: 'bg-sky-50 text-sky-600',
    border: 'hover:border-sky-200',
  },
];

const FeaturesSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <span className="text-sm font-semibold text-[#2C3E90] uppercase tracking-widest">Fonctionnalités</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-slate-500 text-lg mt-4 max-w-xl mx-auto">
            Une suite complète pour gérer chaque aspect de votre chaîne logistique.
          </p>
        </AnimatedSection>

        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feat, i) => (
            <motion.div
              key={i}
              variants={cardVariant}
              className={`group relative bg-white border border-slate-200 ${feat.border} rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-default`}
            >
              <div className={`w-12 h-12 rounded-xl ${feat.color} flex items-center justify-center mb-4 text-xl`}>
                {feat.emoji}
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">{feat.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{feat.description}</p>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-b-2xl scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ─── Pricing Section ──────────────────────────────────────────────────────────

const pricingPlans = [
  {
    name: 'Starter',
    price: '29',
    period: '/mois',
    description: 'Parfait pour démarrer',
    features: [
      '1 entrepôt',
      '3 utilisateurs',
      '500 produits',
      'Gestion des stocks',
      'Alertes automatiques',
      'Support email',
    ],
    cta: 'Commencer',
    ctaLink: '/register',
    popular: false,
    dark: false,
  },
  {
    name: 'Growth',
    price: '79',
    period: '/mois',
    description: 'Pour les équipes en croissance',
    features: [
      '3 entrepôts',
      '10 utilisateurs',
      'Produits illimités',
      'Module Achats inclus',
      'Module Ventes inclus',
      'Support prioritaire',
    ],
    cta: 'Commencer',
    ctaLink: '/register',
    popular: true,
    dark: true,
  },
  {
    name: 'Pro',
    price: '199',
    period: '/mois',
    description: 'Pour les grandes organisations',
    features: [
      'Entrepôts illimités',
      'Utilisateurs illimités',
      'Accès API complet',
      'Intégrations tierces',
      'Support dédié + SLA',
      'Multi-tenant',
    ],
    cta: 'Nous contacter',
    ctaLink: '/register',
    popular: false,
    dark: false,
  },
];

const PricingSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <section id="pricing" className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <span className="text-sm font-semibold text-[#2C3E90] uppercase tracking-widest">Tarifs</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
            Des tarifs simples et transparents
          </h2>
          <p className="text-slate-500 text-lg mt-4 max-w-lg mx-auto">
            Pas de frais cachés. Changez de plan à tout moment.
          </p>
        </AnimatedSection>

        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center"
        >
          {pricingPlans.map((plan, i) => (
            <motion.div
              key={i}
              variants={cardVariant}
              className={`relative rounded-2xl p-7 flex flex-col gap-5 transition-all duration-300
                ${plan.dark
                  ? 'bg-gradient-to-br from-[#1e1b4b] to-[#312e81] text-white shadow-2xl shadow-indigo-900/40 scale-[1.03] md:scale-[1.06] border border-indigo-500/30'
                  : 'bg-white border border-slate-200 text-slate-800 hover:shadow-lg hover:border-slate-300'
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                    <Star className="w-3 h-3 fill-white" />
                    Le plus populaire
                  </span>
                </div>
              )}

              <div>
                <span className={`text-xs font-semibold uppercase tracking-widest ${plan.dark ? 'text-indigo-300' : 'text-[#2C3E90]'}`}>
                  {plan.name}
                </span>
                <div className="mt-3 flex items-end gap-1">
                  <span className={`text-4xl font-extrabold ${plan.dark ? 'text-white' : 'text-slate-900'}`}>
                    {plan.price}€
                  </span>
                  <span className={`text-sm font-medium mb-1 ${plan.dark ? 'text-indigo-300' : 'text-slate-400'}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${plan.dark ? 'text-indigo-200/70' : 'text-slate-500'}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="flex flex-col gap-2.5">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-2.5 text-sm">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.dark ? 'bg-indigo-500/30' : 'bg-green-50'}`}>
                      <Check className={`w-3 h-3 ${plan.dark ? 'text-indigo-200' : 'text-green-600'}`} />
                    </span>
                    <span className={plan.dark ? 'text-indigo-100' : 'text-slate-600'}>{feat}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={plan.ctaLink}
                className={`mt-auto text-center font-semibold text-sm py-3 px-5 rounded-xl transition-all duration-200
                  ${plan.dark
                    ? 'bg-white text-[#1e1b4b] hover:bg-blue-50 shadow-lg'
                    : 'bg-[#2C3E90] text-white hover:bg-[#243280] shadow-md hover:shadow-lg'
                  }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <AnimatedSection className="text-center mt-12" delay={0.2}>
          <p className="text-slate-400 text-sm">
            Tous les plans incluent un essai gratuit de 14 jours. Aucune carte de crédit requise.
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
};

// ─── Waitlist Section ─────────────────────────────────────────────────────────

const WaitlistSection = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <section id="waitlist" className="py-24 bg-gradient-to-br from-[#1e1b4b] via-[#2d2a6e] to-[#312e81] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-indigo-600/20 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <AnimatedSection>
          <span className="text-sm font-semibold text-indigo-300 uppercase tracking-widest">Rejoignez-nous</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
            Rejoignez la liste d&apos;attente
          </h2>
          <p className="text-indigo-200/70 text-lg mt-4">
            Soyez parmi les premiers à accéder aux nouvelles fonctionnalités.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.15}>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                className="flex-1 bg-white/10 border border-white/20 text-white placeholder-indigo-300/50 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent backdrop-blur-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-70 text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition-all hover:scale-105 shadow-lg shadow-indigo-900/50 whitespace-nowrap"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Envoi...
                  </span>
                ) : 'Rejoindre'}
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm"
            >
              <p className="text-xl font-semibold text-white">✅ Merci ! Vous êtes sur la liste.</p>
              <p className="text-indigo-200/70 text-sm mt-2">Nous vous contacterons dès que les nouvelles fonctionnalités seront disponibles.</p>
            </motion.div>
          )}

          <p className="mt-4 text-indigo-300/60 text-sm">
            Déjà 247 personnes sur la liste • Pas de spam
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
};

// ─── Footer ───────────────────────────────────────────────────────────────────

const Footer = () => {
  const links = {
    Produit: ['Fonctionnalités', 'Tarifs', 'Intégrations', 'Roadmap'],
    Entreprise: ['À propos', 'Blog', 'Carrières', 'Presse'],
    Support: ['Documentation', 'Contact', 'Statut', 'Mentions légales'],
  };

  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">StockFlow</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs text-slate-400">
              La plateforme SaaS qui simplifie la gestion de stock pour les PME modernes.
            </p>
            {/* Socials */}
            <div className="mt-5 flex items-center gap-3">
              {[
                { Icon: Twitter, label: 'Twitter' },
                { Icon: Linkedin, label: 'LinkedIn' },
                { Icon: Github, label: 'GitHub' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-white text-sm font-semibold mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <span>© 2024 StockFlow. Tous droits réservés.</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a>
            <span className="text-slate-700">•</span>
            <a href="#" className="hover:text-white transition-colors">CGU</a>
            <span className="text-slate-700">•</span>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ─── Main Landing Page ────────────────────────────────────────────────────────

const LandingPage = () => {
  return (
    <div className="min-h-screen font-sans antialiased">
      <Navbar />
      <main>
        <HeroSection />
        <StatsBar />
        <FeaturesSection />
        <PricingSection />
        <WaitlistSection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
