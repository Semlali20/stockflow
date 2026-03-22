import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Boxes, Layers, Tag, Box, Barcode,
  Move, MapPin, Map, Building2, CheckCircle, Menu, X,
  Bell, Settings, Shield, Package, ChevronDown, Users,
  ShoppingCart, TrendingUp, Truck, FileText, UserCheck,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import { useTranslation } from 'react-i18next';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  permission?: typeof PERMISSIONS[keyof typeof PERMISSIONS];
}

interface NavGroup {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

// ─── Navigation structure ─────────────────────────────────────────────────────

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'nav.overview',
    icon: LayoutDashboard,
    items: [
      { name: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_VIEW },
    ],
  },
  {
    label: 'nav.products',
    icon: Boxes,
    items: [
      { name: 'nav.items',      href: '/products/items',      icon: Boxes,  permission: PERMISSIONS.PRODUCTS_VIEW },
      { name: 'nav.variants',   href: '/products/variants',   icon: Layers, permission: PERMISSIONS.PRODUCTS_VIEW },
      { name: 'nav.categories', href: '/products/categories', icon: Tag,    permission: PERMISSIONS.CATEGORIES_VIEW },
    ],
  },
  {
    label: 'nav.inventory',
    icon: Package,
    items: [
      { name: 'nav.inventory', href: '/inventory/Inventories', icon: Boxes,   permission: PERMISSIONS.INVENTORY_VIEW },
      { name: 'nav.lots',      href: '/inventory/lots',        icon: Box,     permission: PERMISSIONS.LOTS_VIEW },
      { name: 'nav.serials',   href: '/inventory/serials',     icon: Barcode, permission: PERMISSIONS.SERIALS_VIEW },
    ],
  },
  {
    label: 'nav.locations',
    icon: MapPin,
    items: [
      { name: 'nav.sites',      href: '/locations/sites',      icon: Map,       permission: PERMISSIONS.LOCATIONS_VIEW },
      { name: 'nav.warehouses', href: '/locations/warehouses', icon: Building2, permission: PERMISSIONS.LOCATIONS_VIEW },
      { name: 'nav.locations',  href: '/locations/locations',  icon: MapPin,    permission: PERMISSIONS.LOCATIONS_VIEW },
    ],
  },
  {
    label: 'nav.movements',
    icon: Move,
    items: [
      { name: 'nav.movements', href: '/movements', icon: Move, permission: PERMISSIONS.MOVEMENTS_VIEW },
    ],
  },
  {
    label: 'nav.purchase',
    icon: ShoppingCart,
    items: [
      { name: 'nav.suppliers', href: '/purchase/suppliers', icon: Truck },
      { name: 'nav.purchaseOrders', href: '/purchase/orders', icon: ShoppingCart },
    ],
  },
  {
    label: 'nav.sales',
    icon: TrendingUp,
    items: [
      { name: 'nav.customers', href: '/sales/customers', icon: UserCheck },
      { name: 'nav.quotes', href: '/sales/quotes', icon: FileText },
      { name: 'nav.deliveryNotes', href: '/sales/delivery-notes', icon: TrendingUp },
    ],
  },
  {
    label: 'nav.alerts',
    icon: Bell,
    items: [
      { name: 'nav.alerts', href: '/alerts', icon: Bell, permission: PERMISSIONS.ALERTS_VIEW },
    ],
  },
  {
    label: 'nav.admin',
    icon: Users,
    items: [
      { name: 'layout.settings', href: '/settings', icon: Settings, permission: PERMISSIONS.SETTINGS_VIEW },
    ],
  },
];

// ─── Single link ──────────────────────────────────────────────────────────────

const NavItemLink = ({ item, onClose }: { item: NavItem; onClose?: () => void }) => {
  const Icon = item.icon;
  const { t } = useTranslation();
  return (
    <NavLink
      to={item.href}
      onClick={onClose}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-150 relative',
          isActive
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
            : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={cn('w-4 h-4 shrink-0', isActive && 'drop-shadow-sm')} />
          <span className="truncate text-[13px]">{t(item.name)}</span>
          {isActive && (
            <motion.div
              layoutId="sidebar-dot"
              className="absolute end-2.5 w-1.5 h-1.5 rounded-full bg-white/60"
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            />
          )}
        </>
      )}
    </NavLink>
  );
};

// ─── Group section ────────────────────────────────────────────────────────────

const NavGroupSection = ({ group, onClose }: { group: NavGroup; onClose?: () => void }) => {
  const { hasAnyPermission } = usePermissions();
  const [collapsed, setCollapsed] = useState(false);
  const GroupIcon = group.icon;
  const { t } = useTranslation();

  const visibleItems = group.items.filter(
    item => !item.permission || hasAnyPermission(item.permission),
  );

  if (visibleItems.length === 0) return null;

  // Groups with a single item get no header chrome (Dashboard, Movements, Alerts, Admin)
  const isFlat = group.items.length === 1;

  if (isFlat) {
    return <NavItemLink item={visibleItems[0]} onClose={onClose} />;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between px-2 py-1 mb-1 group"
      >
        <div className="flex items-center gap-1.5">
          <GroupIcon className="w-3 h-3 text-neutral-400 dark:text-neutral-600" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-600 group-hover:text-neutral-600 dark:group-hover:text-neutral-400 transition-colors">
            {t(group.label)}
          </span>
        </div>
        <ChevronDown
          className={cn(
            'w-3 h-3 text-neutral-400 dark:text-neutral-600 transition-transform duration-200',
            collapsed && '-rotate-90',
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.16, ease: 'easeInOut' }}
            className="overflow-hidden space-y-0.5"
          >
            {visibleItems.map(item => (
              <NavItemLink key={item.href} item={item} onClose={onClose} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Sidebar body ─────────────────────────────────────────────────────────────

const SidebarBody = ({ onClose }: { onClose?: () => void }) => {
  const { roles, isAdmin } = usePermissions();
  const { t } = useTranslation();

  const roleLabel = isAdmin
    ? t('layout.administrator')
    : (roles[0] ?? 'USER').replace(/_/g, ' ');

  const roleGradient = isAdmin
    ? 'from-purple-600 to-indigo-600'
    : 'from-blue-600 to-indigo-600';

  return (
    <div className="flex flex-col h-full">

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700">
        {NAV_GROUPS.map(group => (
          <NavGroupSection key={group.label} group={group} onClose={onClose} />
        ))}
      </nav>

      {/* Role pill */}
      <div className="p-3 border-t border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
          <div className={cn('w-2 h-2 rounded-full bg-gradient-to-br shrink-0', roleGradient)} />
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-600">{t('layout.role')}</p>
            <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 truncate capitalize">{roleLabel}</p>
          </div>
          <Shield className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 shrink-0" />
        </div>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  return (
    <>
      {/* Mobile toggle */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={() => setIsOpen(o => !o)}
        className={cn(
          "lg:hidden fixed top-3.5 z-50 p-2 bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-neutral-200/60 dark:border-neutral-700/60",
          isRtl ? "right-4" : "left-4"
        )}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </motion.button>

      {/* Desktop */}
      <aside className="hidden lg:flex flex-col fixed top-16 start-0 h-[calc(100vh-4rem)] w-64 bg-white/98 dark:bg-neutral-900/98 backdrop-blur-xl border-e border-neutral-100 dark:border-neutral-800 z-40 transition-all duration-300">
        <SidebarBody />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.aside
              initial={{ x: isRtl ? 320 : -320 }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? 320 : -320 }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="lg:hidden fixed top-16 start-0 h-[calc(100vh-4rem)] w-64 bg-white/98 dark:bg-neutral-900/98 backdrop-blur-xl border-e border-neutral-100 dark:border-neutral-800 z-40 shadow-2xl flex flex-col transition-all duration-300"
            >
              <SidebarBody onClose={() => setIsOpen(false)} />
            </motion.aside>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/25 backdrop-blur-[2px] z-30"
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
};
