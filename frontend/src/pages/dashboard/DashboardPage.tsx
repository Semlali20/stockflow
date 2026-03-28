// frontend/src/pages/dashboard/DashboardPage.tsx
// Professional Enterprise Admin Dashboard

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Package, Warehouse, ArrowLeftRight, Bell,
  AlertTriangle, Users, MapPin, Layers,
  RefreshCw, Activity,
  CheckCircle, XCircle, Clock, AlertOctagon,
  Box, Archive, Truck, Settings, Eye, ChevronRight,
  Hash, ShoppingCart, BarChart2, Zap, Star,
  AlertCircle, ArrowUpRight, ArrowDownRight,
  Building2, UserCheck, FileText, Wallet,
} from 'lucide-react';
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import { Loading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import { cn } from '@/utils/cn';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────

const getRoles = (user: any): string[] => {
  if (!user) return [];
  if (Array.isArray(user.roles)) return user.roles;
  if (user.role) return [user.role];
  return [];
};

const hasRole = (roles: string[], ...check: string[]) =>
  check.some(r => roles.some(ur => ur.toUpperCase().includes(r.toUpperCase())));

const fmt = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
};


// ─────────────────────────────────────────────────────────
// KPI CARD  (redesigned, gradient accent bar)
// ─────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  gradient: string;      // e.g. 'from-blue-500 to-indigo-600'
  bgLight: string;       // e.g. 'bg-blue-50'
  textAccent: string;    // e.g. 'text-blue-600'
  trend?: { value: number; positive: boolean; label?: string };
  onClick?: () => void;
  delay?: number;
}

const KpiCard = ({ title, value, subtitle, icon: Icon, gradient, bgLight, textAccent, trend, onClick, delay = 0 }: KpiCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay, type: 'spring', stiffness: 90 }}
    whileHover={{ y: -4, boxShadow: '0 10px 30px -5px rgba(0,0,0,0.15)' }}
    onClick={onClick}
    className={cn(
      'relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-800',
      'border border-neutral-100 dark:border-neutral-700/60',
      'shadow-sm hover:shadow-lg transition-all duration-300',
      onClick && 'cursor-pointer',
    )}
  >
    {/* Gradient top bar */}
    <div className={cn('h-1 w-full bg-gradient-to-r', gradient)} />

    <div className="p-5">
      <div className="flex items-start justify-between">
        <div className={cn('p-2.5 rounded-xl', bgLight)}>
          <Icon className={cn('w-5 h-5', textAccent)} />
        </div>
        {trend && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg',
            trend.positive
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
          )}>
            {trend.positive
              ? <ArrowUpRight className="w-3 h-3" />
              : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">{value}</p>
        {subtitle && (
          <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">{subtitle}</p>
        )}
        {trend?.label && (
          <p className="mt-1 text-xs text-neutral-400">{trend.label}</p>
        )}
      </div>
    </div>
  </motion.div>
);

// ─────────────────────────────────────────────────────────
// CHART PANEL  (unified wrapper)
// ─────────────────────────────────────────────────────────

interface ChartPanelProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const ChartPanel = ({ title, subtitle, action, children, className, delay = 0 }: ChartPanelProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay }}
    className={cn(
      'rounded-2xl bg-white dark:bg-neutral-800',
      'border border-neutral-100 dark:border-neutral-700/60',
      'shadow-sm p-5',
      className,
    )}
  >
    <div className="flex items-start justify-between mb-5">
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
        {subtitle && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
    {children}
  </motion.div>
);

// ─────────────────────────────────────────────────────────
// ALERT / MOVEMENT LIST ROW
// ─────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────
// CUSTOM RECHARTS TOOLTIP
// ─────────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl p-3 text-sm">
      {label && <p className="font-semibold text-neutral-700 dark:text-neutral-300 mb-2">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color ?? p.fill }} />
          <span className="text-neutral-500 dark:text-neutral-400">{p.name ?? p.dataKey}:</span>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// ROLE / USER INFO
// ─────────────────────────────────────────────────────────

const getRoleInfo = (roles: string[], t: any) => {
  if (hasRole(roles, 'ADMIN'))            return { label: t('dashboard.roles.administrator'),     color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300', icon: Star };
  if (hasRole(roles, 'WAREHOUSE_MANAGER'))return { label: t('dashboard.roles.warehouseManager'), color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',         icon: Warehouse };
  if (hasRole(roles, 'MANAGER'))          return { label: t('dashboard.roles.manager'),           color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',  icon: BarChart2 };
  if (hasRole(roles, 'SUPERVISOR'))       return { label: t('dashboard.roles.supervisor'),        color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',  icon: Eye };
  if (hasRole(roles, 'OPERATOR'))         return { label: t('dashboard.roles.operator'),          color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',  icon: Zap };
  if (hasRole(roles, 'PROCUREMENT'))      return { label: t('dashboard.roles.procurement'),       color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',          icon: ShoppingCart };
  if (hasRole(roles, 'AUDITOR'))          return { label: t('dashboard.roles.auditor'),           color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',         icon: Eye };
  return                                         { label: t('dashboard.roles.user'),              color: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',              icon: Activity };
};

// ─────────────────────────────────────────────────────────
// QUICK ACTIONS (bigger, with labels)
// ─────────────────────────────────────────────────────────

interface QuickActionDef {
  label: string;
  icon: React.ElementType;
  to: string;
  gradient: string;
}

const getQuickActions = (roles: string[], t: any): QuickActionDef[] => {
  const all: QuickActionDef[] = [
    { label: t('dashboard.services.inventory'),    icon: Box,          to: '/inventory/Inventories',  gradient: 'from-blue-500 to-indigo-600' },
    { label: t('dashboard.services.movements'),    icon: ArrowLeftRight, to: '/movements',            gradient: 'from-violet-500 to-purple-600' },
    { label: t('dashboard.panels.recentAlerts'),   icon: Bell,          to: '/alerts',                gradient: 'from-red-500 to-rose-600' },
    { label: t('dashboard.suppliers'),             icon: Building2,     to: '/purchase/suppliers',    gradient: 'from-purple-500 to-violet-600' },
    { label: t('dashboard.customers'),             icon: UserCheck,     to: '/sales/customers',       gradient: 'from-teal-500 to-cyan-600' },
  ];

  if (hasRole(roles, 'ADMIN', 'MANAGER', 'WAREHOUSE_MANAGER')) {
    all.push({ label: t('dashboard.services.products'),    icon: Package,   to: '/products/items',          gradient: 'from-emerald-500 to-teal-600' });
    all.push({ label: t('dashboard.roles.warehouseManager'),  icon: Warehouse, to: '/locations/warehouses',    gradient: 'from-amber-500 to-orange-600' });
  }
  if (hasRole(roles, 'ADMIN')) {
    all.push({ label: t('dashboard.panels.totalLots'),        icon: Archive,   to: '/inventory/lots',          gradient: 'from-cyan-500 to-sky-600' });
    all.push({ label: t('dashboard.services.locations'),       icon: MapPin,    to: '/locations/sites',         gradient: 'from-lime-500 to-green-600' });
  }

  return all.slice(0, 6);
};

const QuickActionCard = ({ label, icon: Icon, to, gradient }: QuickActionDef) => {
  const navigate = useNavigate();
  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(to)}
      className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/60 shadow-sm hover:shadow-md transition-all w-full"
    >
      <div className={cn('w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-sm', gradient)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{label}</span>
    </motion.button>
  );
};

// ─────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────

const EmptyFeed = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-10 gap-3">
    <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
      <AlertCircle className="w-5 h-5 text-neutral-400" />
    </div>
    <p className="text-sm text-neutral-400">{message}</p>
  </div>
);

// ─────────────────────────────────────────────────────────
// INVENTORY SNAPSHOT (mini progress bars)
// ─────────────────────────────────────────────────────────

const InventorySnapshot = ({ stats, t }: { stats: any; t: any }) => {
  const total = stats.totalInventory || 1;
  const bars = [
    { label: t('dashboard.snapshot.inStock'),    value: Math.max(0, total - stats.lowStockItems), color: 'bg-emerald-500', pct: Math.round((Math.max(0, total - stats.lowStockItems) / total) * 100) },
    { label: t('dashboard.snapshot.lowStock'),   value: stats.lowStockItems,      color: 'bg-amber-500',  pct: Math.round((stats.lowStockItems / total) * 100) },
  ];
  return (
    <div className="space-y-3">
      {bars.map(b => (
        <div key={b.label}>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">{b.label}</span>
            <span className="text-neutral-500 dark:text-neutral-400">{fmt(b.value)} <span className="text-neutral-400">({b.pct}%)</span></span>
          </div>
          <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-700 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(b.pct, 100)}%` }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className={cn('h-full rounded-full', b.color)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// LOW STOCK TABLE
// ─────────────────────────────────────────────────────────

const LowStockTable = ({ items, onViewAll, t }: { items: any[]; onViewAll: () => void; t: any }) => (
  <div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-100 dark:border-neutral-700">
            <th className="text-left py-2.5 pr-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{t('dashboard.tables.item')}</th>
            <th className="text-right py-2.5 px-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{t('dashboard.tables.onHand')}</th>
            <th className="text-right py-2.5 pl-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{t('dashboard.tables.available')}</th>
            <th className="text-right py-2.5 pl-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{t('dashboard.tables.risk')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-50 dark:divide-neutral-700/50">
          {items.map((item, i) => {
            const isCritical = item.quantityAvailable < 5;
            return (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors"
              >
                <td className="py-3 pr-3">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate block max-w-[160px]">
                    {item.itemName ?? `Item ${item.itemId?.slice(0, 8) ?? '—'}`}
                  </span>
                </td>
                <td className="py-3 px-3 text-right text-neutral-600 dark:text-neutral-400">{item.quantityOnHand}</td>
                <td className="py-3 pl-3 text-right">
                  <span className={cn('font-bold', isCritical ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400')}>
                    {item.quantityAvailable}
                  </span>
                </td>
                <td className="py-3 pl-3 text-right">
                  <span className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold',
                    isCritical
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
                  )}>
                    {isCritical ? t('dashboard.tables.critical') : t('dashboard.tables.warning')}
                  </span>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
    <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-700">
      <button
        onClick={onViewAll}
        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
      >
        {t('dashboard.panels.viewAll')} <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────
// SYSTEM OVERVIEW TILES (admin/manager)
// ─────────────────────────────────────────────────────────

const SystemTile = ({ label, value, icon: Icon, color, to }: {
  label: string; value: number; icon: React.ElementType; color: string; to: string;
}) => {
  const navigate = useNavigate();
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      onClick={() => navigate(to)}
      className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer transition-all"
    >
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', color)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{fmt(value)}</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{label}</p>
      </div>
    </motion.div>
  );
};


// ─────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────

export const DashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const roles = useMemo(() => getRoles(user), [user]);
  const { data, isLoading, lastUpdated, refresh } = useDashboard(roles);
  const { stats } = data;
  const navigate = useNavigate();

  const roleInfo = useMemo(() => getRoleInfo(roles, t), [roles, t]);
  const quickActions = useMemo(() => getQuickActions(roles, t), [roles, t]);
  const isAdminOrManager = hasRole(roles, 'ADMIN', 'MANAGER');
  const firstName = user?.firstName ?? user?.username ?? 'there';

  const trendData = useMemo(
    () => data.movementTrend.map(d => ({
      day: d.day,
      [t('dashboard.services.movements')]: d.movements,
      [t('dashboard.movementStatus.pending')]: d.pending,
    })),
    [data.movementTrend, t],
  );

  const movTypeData = useMemo(
    () => data.movementsByType.filter(m => m.count > 0).map(m => ({
      ...m,
      name: t(`dashboard.movementTypes.${m.name.toLowerCase()}`, m.name)
    })),
    [data.movementsByType, t],
  );

  const donutData = useMemo(() => {
    const inStock = Math.max(0, stats.totalInventory - stats.lowStockItems);
    const d = [
      { name: t('dashboard.snapshot.inStock'),  value: inStock,             fill: '#10B981' },
      { name: t('dashboard.snapshot.lowStock'), value: stats.lowStockItems, fill: '#F59E0B' },
    ].filter(x => x.value > 0);
    return d;
  }, [stats, t]);

  const alertLevelData = useMemo(() => {
    const levelColors: Record<string, string> = {
      EMERGENCY: '#EF4444',
      CRITICAL:  '#F97316',
      WARNING:   '#F59E0B',
      INFO:      '#3B82F6',
    };
    return Object.entries(stats.alertsByLevel)
      .filter(([, v]) => v > 0)
      .map(([level, count]) => ({
        name: level.charAt(0) + level.slice(1).toLowerCase(),
        count,
        fill: levelColors[level] ?? '#94A3B8',
      }))
      .sort((a, b) => b.count - a.count);
  }, [stats.alertsByLevel]);

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6 pb-8">

      {/* ══════════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            {t(`dashboard.header.greeting.${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}`)}, {firstName} 👋
          </h1>
          <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
            <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold', roleInfo.color)}>
              <roleInfo.icon className="w-3 h-3" />
              {roleInfo.label}
            </span>
            {lastUpdated && (
              <span className="text-xs text-neutral-400 dark:text-neutral-500">
                {t('dashboard.header.lastUpdated')} {format(lastUpdated, 'HH:mm')}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={refresh}>
            {t('common.refresh')}
          </Button>
          <Button variant="accent" size="sm" icon={<Settings className="w-4 h-4" />} onClick={() => navigate('/settings')}>
            {t('dashboard.header.settings')}
          </Button>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════
          CRITICAL BANNER (only when critical alerts)
      ══════════════════════════════════════════════════ */}
      {stats.criticalAlerts > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
        >
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
            <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">
              {stats.criticalAlerts} Critical Alert{stats.criticalAlerts !== 1 ? 's' : ''} — Immediate Action Required
            </p>
            {stats.unacknowledgedAlerts > 0 && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                {stats.unacknowledgedAlerts} unacknowledged alert{stats.unacknowledgedAlerts !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <Button variant="danger" size="sm" onClick={() => navigate('/alerts')}>View Alerts</Button>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════
          KPI CARDS ROW
      ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <KpiCard
          title={t('dashboard.kpi.totalProducts')}
          value={fmt(stats.totalItems)}
          subtitle={t('dashboard.kpi.categoriesCount', { total: fmt(stats.totalCategories) })}
          icon={Package}
          gradient="from-blue-500 to-indigo-600"
          bgLight="bg-blue-50 dark:bg-blue-900/30"
          textAccent="text-blue-600 dark:text-blue-400"
          onClick={() => navigate('/products/items')}
          delay={0.05}
        />
        <KpiCard
          title={t('dashboard.kpi.inventoryItems')}
          value={fmt(stats.totalInventory)}
          subtitle={t('dashboard.kpi.lotsSerialsCount', { lots: fmt(stats.totalLots), serials: fmt(stats.totalSerials) })}
          icon={Box}
          gradient="from-teal-500 to-emerald-600"
          bgLight="bg-teal-50 dark:bg-teal-900/30"
          textAccent="text-teal-600 dark:text-teal-400"
          onClick={() => navigate('/inventory/Inventories')}
          delay={0.1}
        />
        <KpiCard
          title={t('dashboard.kpi.totalMovements')}
          value={fmt(stats.totalMovements)}
          subtitle={t('dashboard.kpi.pendingCount', { total: fmt(stats.pendingMovements) })}
          icon={ArrowLeftRight}
          gradient="from-violet-500 to-purple-600"
          bgLight="bg-violet-50 dark:bg-violet-900/30"
          textAccent="text-violet-600 dark:text-violet-400"
          onClick={() => navigate('/movements')}
          delay={0.15}
        />
        <KpiCard
          title={t('dashboard.kpi.activeAlerts')}
          value={fmt(stats.activeAlerts)}
          subtitle={t('dashboard.kpi.unacknowledgedCount', { total: fmt(stats.unacknowledgedAlerts) })}
          icon={Bell}
          gradient={stats.criticalAlerts > 0 ? 'from-red-500 to-rose-600' : 'from-amber-500 to-orange-600'}
          bgLight={stats.criticalAlerts > 0 ? 'bg-red-50 dark:bg-red-900/30' : 'bg-amber-50 dark:bg-amber-900/30'}
          textAccent={stats.criticalAlerts > 0 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}
          trend={stats.criticalAlerts > 0 ? { value: stats.criticalAlerts, positive: false, label: t('dashboard.kpi.criticalCount', { total: stats.criticalAlerts }) } : undefined}
          onClick={() => navigate('/alerts')}
          delay={0.2}
        />
        <KpiCard
          title={t('dashboard.kpi.locations')}
          value={fmt(stats.totalLocations)}
          subtitle={t('dashboard.kpi.warehousesSitesCount', { warehouses: fmt(stats.totalWarehouses), sites: fmt(stats.totalSites) })}
          icon={Warehouse}
          gradient="from-cyan-500 to-sky-600"
          bgLight="bg-cyan-50 dark:bg-cyan-900/30"
          textAccent="text-cyan-600 dark:text-cyan-400"
          onClick={() => navigate('/locations/warehouses')}
          delay={0.3}
        />
      </div>

      {/* ══════════════════════════════════════════════════
          VUE COMMERCIALE — Purchase & Sales KPI cards
      ══════════════════════════════════════════════════ */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            {t('dashboard.commercial')}
          </span>
          <div className="flex-1 h-px bg-neutral-100 dark:bg-neutral-700" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Stock Valorisé */}
          <KpiCard
            title={t('dashboard.stockValue')}
            value={stats.totalStockValue > 0
              ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(stats.totalStockValue)
              : '—'}
            subtitle={t('dashboard.stockValueDesc')}
            icon={Wallet}
            gradient="from-emerald-500 to-green-600"
            bgLight="bg-emerald-50 dark:bg-emerald-900/30"
            textAccent="text-emerald-600 dark:text-emerald-400"
            delay={0.05}
          />
          {/* Fournisseurs */}
          <KpiCard
            title={t('dashboard.suppliers')}
            value={fmt(stats.suppliers)}
            icon={Building2}
            gradient="from-purple-500 to-violet-600"
            bgLight="bg-purple-50 dark:bg-purple-900/30"
            textAccent="text-purple-600 dark:text-purple-400"
            onClick={() => navigate('/purchase/suppliers')}
            delay={0.1}
          />
          {/* Bons de commande */}
          <KpiCard
            title={t('dashboard.purchaseOrders')}
            value={fmt(stats.purchaseOrders)}
            icon={ShoppingCart}
            gradient="from-orange-500 to-amber-600"
            bgLight="bg-orange-50 dark:bg-orange-900/30"
            textAccent="text-orange-600 dark:text-orange-400"
            onClick={() => navigate('/purchase/orders')}
            delay={0.15}
          />
          {/* Clients */}
          <KpiCard
            title={t('dashboard.customers')}
            value={fmt(stats.customers)}
            icon={UserCheck}
            gradient="from-teal-500 to-cyan-600"
            bgLight="bg-teal-50 dark:bg-teal-900/30"
            textAccent="text-teal-600 dark:text-teal-400"
            onClick={() => navigate('/sales/customers')}
            delay={0.2}
          />
          {/* Devis */}
          <KpiCard
            title={t('dashboard.quotes')}
            value={fmt(stats.quotes)}
            icon={FileText}
            gradient="from-blue-500 to-indigo-600"
            bgLight="bg-blue-50 dark:bg-blue-900/30"
            textAccent="text-blue-600 dark:text-blue-400"
            onClick={() => navigate('/sales/quotes')}
            delay={0.25}
          />
          {/* Bons de livraison */}
          <KpiCard
            title={t('dashboard.deliveryNotes')}
            value={fmt(stats.deliveryNotes)}
            icon={Truck}
            gradient="from-green-500 to-emerald-600"
            bgLight="bg-green-50 dark:bg-green-900/30"
            textAccent="text-green-600 dark:text-green-400"
            onClick={() => navigate('/sales/delivery-notes')}
            delay={0.3}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          ROW 2 — Movement Trend (area) + Inventory Donut
      ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Area chart — movement trend */}
        <ChartPanel
          title={t('dashboard.panels.movementTrends')}
          subtitle={t('dashboard.panels.movementTrendsDesc')}
          className="lg:col-span-2"
          delay={0.1}
        >
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradMovements" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradPending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" strokeOpacity={0.8} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                formatter={(value) => <span className="text-neutral-600 dark:text-neutral-400">{value}</span>}
              />
              <Area type="monotone" dataKey={t('dashboard.services.movements')} stroke="#6366F1" strokeWidth={2.5} fill="url(#gradMovements)" dot={false} activeDot={{ r: 5, fill: '#6366F1' }} />
              <Area type="monotone" dataKey={t('dashboard.movementStatus.pending')} stroke="#F59E0B" strokeWidth={2} strokeDasharray="4 3" fill="url(#gradPending)" dot={false} activeDot={{ r: 5, fill: '#F59E0B' }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>

        {/* Donut chart — inventory health */}
        <ChartPanel
          title={t('dashboard.panels.inventoryHealth')}
          subtitle={t('dashboard.panels.inventoryHealthDesc')}
          delay={0.15}
        >
          {donutData.length > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%" cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full space-y-1.5 mt-1">
                {donutData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                      <span className="text-neutral-600 dark:text-neutral-400">{d.name}</span>
                    </div>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{fmt(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyFeed message={t('dashboard.empty.noInventoryData')} />
          )}
        </ChartPanel>
      </div>

      {/* ══════════════════════════════════════════════════
          ROW 3 — Movements by Type bar + Alert Radial
      ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Bar chart — movements by type */}
        <ChartPanel
          title={t('dashboard.panels.movementsByType')}
          subtitle={t('dashboard.panels.movementsByTypeDesc')}
          className="lg:col-span-2"
          delay={0.2}
        >
          {movTypeData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={movTypeData} margin={{ top: 4, right: 5, left: -20, bottom: 0 }} barSize={38}>
                  <defs>
                    {movTypeData.map((entry, i) => (
                      <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={entry.color} stopOpacity={1} />
                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.65} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload, label }: any) => {
                      if (!active || !payload?.length) return null;
                      const entry = payload[0];
                      return (
                        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl p-3 text-sm">
                          <p className="font-semibold text-neutral-700 dark:text-neutral-300 mb-1">{label}</p>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.fill ?? entry.color }} />
                            <span className="text-neutral-500 dark:text-neutral-400">Mouvements:</span>
                            <span className="font-bold text-neutral-900 dark:text-neutral-100">
                              {new Intl.NumberFormat('fr-FR').format(entry.value)}
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="count" name="Mouvements" radius={[8, 8, 0, 0]}>
                    {movTypeData.map((_entry, i) => (
                      <Cell key={i} fill={`url(#barGrad${i})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {/* Legend with colored dots */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-700">
                {movTypeData.map((entry, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.color }} />
                    <span>{entry.name}</span>
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">({fmt(entry.count)})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyFeed message={t('dashboard.empty.noMovementData')} />
          )}
        </ChartPanel>

        {/* Radial bar — alert breakdown */}
        <ChartPanel
          title={t('dashboard.panels.alertOverview')}
          subtitle={t('dashboard.panels.alertOverviewDesc')}
          delay={0.25}
        >
          {alertLevelData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <BarChart data={alertLevelData} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }} barSize={18}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {alertLevelData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-1">
                {alertLevelData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                      <span className="text-neutral-600 dark:text-neutral-400">{d.name}</span>
                    </div>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{fmt(d.count)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
              <p className="text-sm font-medium text-neutral-500">{t('dashboard.empty.noAlerts')}</p>
            </div>
          )}
        </ChartPanel>
      </div>

      {/* ══════════════════════════════════════════════════
          ROW 4 — Purchase Orders + Sales Pipeline
      ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Purchase Orders by status */}
        <ChartPanel
          title="Purchase Orders"
          subtitle="Breakdown by status"
          action={
            <button
              onClick={() => navigate('/purchase/orders')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              {t('dashboard.panels.viewAll')} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          }
          delay={0.3}
        >
          {data.purchaseByStatus.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.purchaseByStatus} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }} barSize={18}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="status" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Orders" radius={[0, 6, 6, 0]}>
                    {data.purchaseByStatus.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-700">
                {data.purchaseByStatus.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                    <span>{d.status}</span>
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">({d.count})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyFeed message="No purchase orders yet" />
          )}
        </ChartPanel>

        {/* Top Sold Items — by delivered quantity */}
        <ChartPanel
          title="Top Sold Items"
          subtitle="Most delivered items by quantity"
          action={
            <button
              onClick={() => navigate('/sales/delivery-notes')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              {t('dashboard.panels.viewAll')} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          }
          delay={0.35}
        >
          {data.topSalesItems.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.topSalesItems} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }} barSize={16}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    axisLine={false}
                    tickLine={false}
                    width={110}
                    tickFormatter={(v: string) => v.length > 14 ? v.slice(0, 13) + '…' : v}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="quantity" name="Qty Delivered" radius={[0, 6, 6, 0]}>
                    {data.topSalesItems.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-700">
                {data.topSalesItems.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="truncate max-w-[100px]">{d.name}</span>
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">({fmt(d.quantity)})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyFeed message="No delivery data yet" />
          )}
        </ChartPanel>
      </div>

      {/* ══════════════════════════════════════════════════
          ROW 5 — Quick Actions
      ══════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/60 shadow-sm p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{t('dashboard.panels.quickActions')}</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{t('dashboard.panels.quickActionsDesc')}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.to}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.06 }}
            >
              <QuickActionCard {...action} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════
          ROW 6 — Low Stock Warning + Inventory Progress
          (visible to warehouse/admin/manager/procurement)
      ══════════════════════════════════════════════════ */}
      {data.lowStockItems.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <ChartPanel
            title={t('dashboard.panels.lowStockWarning')}
            subtitle={t('dashboard.panels.lowStockDesc', { total: data.lowStockItems.length, s: data.lowStockItems.length !== 1 ? 's' : '' })}
            className="lg:col-span-2"
            action={
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-xs font-semibold text-amber-700 dark:text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                {t('dashboard.panels.actionNeeded')}
              </span>
            }
            delay={0.45}
          >
            <LowStockTable items={data.lowStockItems.slice(0, 8)} onViewAll={() => navigate('/inventory/Inventories')} t={t} />
          </ChartPanel>

          <ChartPanel
            title={t('dashboard.panels.stockSnapshot')}
            subtitle={t('dashboard.panels.stockSnapshotDesc')}
            delay={0.5}
          >
            <InventorySnapshot stats={stats} t={t} />

            <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-700 grid grid-cols-2 gap-3">
              {[
                { label: t('dashboard.panels.totalLots'),   value: stats.totalLots,    icon: Archive, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
                { label: t('dashboard.panels.serials'),      value: stats.totalSerials,  icon: Hash,    color: 'text-teal-600 dark:text-teal-400',  bg: 'bg-teal-50 dark:bg-teal-900/30' },
              ].map(item => (
                <div key={item.label} className={cn('flex items-center gap-2.5 p-3 rounded-xl', item.bg)}>
                  <item.icon className={cn('w-4 h-4 shrink-0', item.color)} />
                  <div>
                    <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{fmt(item.value)}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </ChartPanel>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          ROW 7 — System Overview (admin / manager only)
      ══════════════════════════════════════════════════ */}
      {isAdminOrManager && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/60 shadow-sm p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{t('dashboard.systemOverview')}</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{t('dashboard.allServicesAtAGlance')}</p>
            </div>
            {hasRole(roles, 'ADMIN') && (
              <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                <Users className="w-3.5 h-3.5" />
                <span>{t('dashboard.usersCount', { total: fmt(stats.totalUsers) })} · {t('dashboard.usersActive', { active: fmt(stats.activeUsers) })}</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <SystemTile label={t('dashboard.services.products')}    value={stats.totalItems}          icon={Package}       color="bg-blue-500"    to="/products/items" />
            <SystemTile label={t('dashboard.services.categories')}  value={stats.totalCategories}     icon={Layers}        color="bg-indigo-500"  to="/products/categories" />
            <SystemTile label={t('dashboard.services.inventory')}   value={stats.totalInventory}      icon={Box}           color="bg-teal-500"    to="/inventory/Inventories" />
            <SystemTile label={t('dashboard.services.movements')}   value={stats.totalMovements}      icon={ArrowLeftRight} color="bg-violet-500" to="/movements" />
            <SystemTile label={t('dashboard.services.locations')}   value={stats.totalLocations}      icon={MapPin}        color="bg-cyan-500"    to="/locations/locations" />
          </div>

          {/* Movement status summary mini bar */}
          <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700">
            <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-3">{t('dashboard.movementStatusBreakdown')}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: t('dashboard.movementStatus.pending'),     value: stats.pendingMovements,    color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-900/20',   icon: Clock },
                { label: t('dashboard.movementStatus.inProgress'), value: stats.inProgressMovements, color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-900/20',     icon: Activity },
                { label: t('dashboard.movementStatus.completed'),   value: stats.completedMovements,  color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: CheckCircle },
                { label: t('dashboard.movementStatus.overdue'),     value: stats.overdueMovements,    color: 'text-red-600',     bg: 'bg-red-50 dark:bg-red-900/20',       icon: XCircle },
              ].map(s => (
                <div key={s.label} className={cn('flex items-center gap-3 px-4 py-3 rounded-xl', s.bg)}>
                  <s.icon className={cn('w-4 h-4 shrink-0', s.color)} />
                  <div>
                    <p className={cn('text-xl font-bold', s.color)}>{fmt(s.value)}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
};
