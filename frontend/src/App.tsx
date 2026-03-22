import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Lock } from 'lucide-react';
import { STORAGE_KEYS } from '@/config/constants';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS, type Permission } from '@/config/permissions';
import { useTranslation } from 'react-i18next';

// Landing Page
import LandingPage from '@/pages/landing/LandingPage';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { VerifyEmailPage } from '@/pages/auth/Verifyemailpage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';

// Dashboard
import { DashboardPage } from '@/pages/dashboard/DashboardPage';

// Products Pages
import { ItemsPage } from '@/pages/products/ItemsPage';
import { ItemVariantsPage } from '@/pages/products/ItemVariantsPage';
import { CategoriesPage } from '@/pages/products/CategoriesPage';

// Inventory Pages
import { LotsPage } from '@/pages/inventory/LotsPage';
import { SerialsPage } from '@/pages/inventory/SerialsPage';
import InventoryPageEnhanced from '@/pages/inventory/InventoryPageEnhanced';

// Locations Pages
import { SitesPage } from '@/pages/locations/SitesPage';
import { WarehousesPage } from '@/pages/locations/WarehousesPage';
import { LocationsPage } from '@/pages/locations/LocationsPage';

// Movements Pages
import MovementsPage from '@/pages/movements/MovementsPage';

// Purchase Pages
import SuppliersPage from '@/pages/purchase/SuppliersPage';
import PurchaseOrdersPage from '@/pages/purchase/PurchaseOrdersPage';

// Sales Pages
import CustomersPage from '@/pages/sales/CustomersPage';
import QuotesPage from '@/pages/sales/QuotesPage';
import DeliveryNotesPage from '@/pages/sales/DeliveryNotesPage';
import QuoteFormPage from '@/pages/sales/QuoteFormPage';
import DeliveryNoteFormPage from '@/pages/sales/DeliveryNoteFormPage';

// Purchase Form Page
import PurchaseOrderFormPage from '@/pages/purchase/PurchaseOrderFormPage';
// import { MovementLinesPage } from '@/pages/movements/MovementLinesPage';
// import { MovementTasksPage } from '@/pages/movements/MovementTasksPage';


// Alerts Pages
import { AlertsPage } from '@/pages/Alerts/AlertsPage';

// Profile Page
import { ProfilePage } from '@/pages/profile/ProfilePage';

// Settings Page
import { SettingsPage } from '@/pages/settings/SettingsPage';

// ─── Route Guards ─────────────────────────────────────────────────────────────

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AccessDenied = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-neutral-400">
      <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
        <Lock className="w-8 h-8" />
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-neutral-700 dark:text-neutral-300">{t('auth.accessDenied')}</p>
        <p className="text-sm text-neutral-500 mt-1">{t('auth.noPermission')}</p>
      </div>
      <a href="/dashboard" className="px-4 py-2 text-sm font-semibold rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors">
        {t('auth.backToDashboard')}
      </a>
    </div>
  );
};

// Route that requires both authentication and a specific permission
const PermissionRoute = ({ children, permission }: { children: React.ReactNode; permission: Permission }) => {
  const isAuthenticated = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const { hasPermission } = usePermissions();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!hasPermission(permission)) return <AccessDenied />;
  return <>{children}</>;
};

import { Layout } from '@/components/Layout/Layout';

// Main Layout Component with Header and Sidebar - uses the shared Layout component
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Layout>
      <div className="max-w-full lg:max-w-7xl mx-auto">
        {children}
      </div>
    </Layout>
  );
};

function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route
          path="/"
          element={
            localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
              ? <Navigate to="/dashboard" replace />
              : <LandingPage />
          }
        />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PermissionRoute permission={PERMISSIONS.DASHBOARD_VIEW}>
              <MainLayout><DashboardPage /></MainLayout>
            </PermissionRoute>
          }
        />

        {/* Products Routes */}
        <Route
          path="/products/items"
          element={
            <PermissionRoute permission={PERMISSIONS.PRODUCTS_VIEW}>
              <MainLayout><ItemsPage /></MainLayout>
            </PermissionRoute>
          }
        />
        <Route
          path="/products/variants"
          element={
            <PermissionRoute permission={PERMISSIONS.PRODUCTS_VIEW}>
              <MainLayout><ItemVariantsPage /></MainLayout>
            </PermissionRoute>
          }
        />
        <Route
          path="/products/categories"
          element={
            <PermissionRoute permission={PERMISSIONS.CATEGORIES_VIEW}>
              <MainLayout><CategoriesPage /></MainLayout>
            </PermissionRoute>
          }
        />

        {/* Inventory Routes */}
        <Route
          path="/inventory/lots"
          element={
            <PermissionRoute permission={PERMISSIONS.LOTS_VIEW}>
              <MainLayout><LotsPage /></MainLayout>
            </PermissionRoute>
          }
        />
        <Route
          path="/inventory/serials"
          element={
            <PermissionRoute permission={PERMISSIONS.SERIALS_VIEW}>
              <MainLayout><SerialsPage /></MainLayout>
            </PermissionRoute>
          }
        />
        <Route
          path="/inventory/Inventories"
          element={
            <PermissionRoute permission={PERMISSIONS.INVENTORY_VIEW}>
              <MainLayout><InventoryPageEnhanced /></MainLayout>
            </PermissionRoute>
          }
        />

        {/* Locations Routes */}
        <Route
          path="/locations/sites"
          element={
            <PermissionRoute permission={PERMISSIONS.LOCATIONS_VIEW}>
              <MainLayout><SitesPage /></MainLayout>
            </PermissionRoute>
          }
        />
        <Route
          path="/locations/warehouses"
          element={
            <PermissionRoute permission={PERMISSIONS.LOCATIONS_VIEW}>
              <MainLayout><WarehousesPage /></MainLayout>
            </PermissionRoute>
          }
        />
        <Route
          path="/locations/locations"
          element={
            <PermissionRoute permission={PERMISSIONS.LOCATIONS_VIEW}>
              <MainLayout><LocationsPage /></MainLayout>
            </PermissionRoute>
          }
        />

        {/* Movements Routes */}
        <Route
          path="/movements"
          element={
            <PermissionRoute permission={PERMISSIONS.MOVEMENTS_VIEW}>
              <MainLayout><MovementsPage /></MainLayout>
            </PermissionRoute>
          }
        />
        {/* <Route
     path="/movements/lines"
     element={
       <ProtectedRoute>
         <MainLayout>
           <MovementLinesPage />
         </MainLayout>
       </ProtectedRoute>
     }
   />

   <Route
     path="/movements/tasks"
     element={
       <ProtectedRoute>
         <MainLayout>
           <MovementTasksPage />
         </MainLayout>
       </ProtectedRoute>
     }
   /> */}

        {/* Purchase Routes */}
        <Route
          path="/purchase/suppliers"
          element={
            <ProtectedRoute>
              <MainLayout><SuppliersPage /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase/orders"
          element={
            <ProtectedRoute>
              <MainLayout><PurchaseOrdersPage /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase/orders/new"
          element={
            <ProtectedRoute>
              <MainLayout><PurchaseOrderFormPage /></MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Sales Routes */}
        <Route
          path="/sales/customers"
          element={
            <ProtectedRoute>
              <MainLayout><CustomersPage /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/quotes"
          element={
            <ProtectedRoute>
              <MainLayout><QuotesPage /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/quotes/new"
          element={
            <ProtectedRoute>
              <MainLayout><QuoteFormPage /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/delivery-notes"
          element={
            <ProtectedRoute>
              <MainLayout><DeliveryNotesPage /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/delivery-notes/new"
          element={
            <ProtectedRoute>
              <MainLayout><DeliveryNoteFormPage /></MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Alerts Routes */}
        <Route
          path="/alerts"
          element={
            <PermissionRoute permission={PERMISSIONS.ALERTS_VIEW}>
              <MainLayout><AlertsPage /></MainLayout>
            </PermissionRoute>
          }
        />

        {/* Profile Routes — any authenticated user */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout><ProfilePage /></MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Settings Route */}
        <Route
          path="/settings"
          element={
            <PermissionRoute permission={PERMISSIONS.SETTINGS_VIEW}>
              <MainLayout><SettingsPage /></MainLayout>
            </PermissionRoute>
          }
        />

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;