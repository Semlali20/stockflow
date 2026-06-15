import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/auth/screens/splash_screen.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/dashboard/screens/dashboard_screen.dart';
import '../../features/items/screens/items_list_screen.dart';
import '../../features/items/screens/item_detail_screen.dart';
import '../../features/inventory/screens/inventory_screen.dart';
import '../../features/movements/screens/movements_screen.dart';
import '../../features/movements/screens/create_movement_screen.dart';
import '../../features/profile/screens/profile_screen.dart';
import '../../features/purchases/screens/purchases_screen.dart';
import '../../features/purchases/screens/create_purchase_order_screen.dart';
import '../../features/sales/screens/sales_screen.dart';
import '../../features/sales/screens/create_quote_screen.dart';
import '../../shared/widgets/main_shell.dart';

// Route names
abstract class AppRoutes {
  static const splash = '/';
  static const login = '/login';
  static const dashboard = '/dashboard';
  static const items = '/items';
  static const itemDetail = '/items/:id';
  static const inventory = '/inventory';
  static const movements = '/movements';
  static const createMovement = '/movements/create';
  static const purchases = '/purchases';
  static const createPurchaseOrder = '/purchases/create-order';
  static const sales = '/sales';
  static const createQuote = '/sales/create-quote';
  static const profile = '/profile';
}

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: AppRoutes.splash,
    refreshListenable: _AuthStateListenable(ref),
    redirect: (context, state) {
      final status = ref.read(authProvider).status;
      final location = state.matchedLocation;

      if (status == AuthStatus.loading) {
        if (location == AppRoutes.splash || location == AppRoutes.login) return null;
        return AppRoutes.splash;
      }

      if (status == AuthStatus.unauthenticated) {
        return location == AppRoutes.login ? null : AppRoutes.login;
      }

      // Authenticated
      if (location == AppRoutes.login || location == AppRoutes.splash) {
        return AppRoutes.dashboard;
      }
      return null;
    },
    routes: [
      GoRoute(
        path: AppRoutes.splash,
        builder: (_, __) => const SplashScreen(),
      ),
      GoRoute(
        path: AppRoutes.login,
        builder: (_, __) => const LoginScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: AppRoutes.dashboard,
            builder: (_, __) => const DashboardScreen(),
          ),
          GoRoute(
            path: AppRoutes.items,
            builder: (_, __) => const ItemsListScreen(),
            routes: [
              GoRoute(
                path: ':id',
                builder: (_, state) => ItemDetailScreen(
                  itemId: state.pathParameters['id']!,
                ),
              ),
            ],
          ),
          GoRoute(
            path: AppRoutes.inventory,
            builder: (_, __) => const InventoryScreen(),
          ),
          GoRoute(
            path: AppRoutes.movements,
            builder: (_, __) => const MovementsScreen(),
          ),
          GoRoute(
            path: AppRoutes.createMovement,
            builder: (_, __) => const CreateMovementScreen(),
          ),
          GoRoute(
            path: AppRoutes.purchases,
            builder: (_, __) => const PurchasesScreen(),
          ),
          GoRoute(
            path: AppRoutes.sales,
            builder: (_, __) => const SalesScreen(),
          ),
          GoRoute(
            path: AppRoutes.profile,
            builder: (_, __) => const ProfileScreen(),
          ),
        ],
      ),
      GoRoute(
        path: AppRoutes.createPurchaseOrder,
        builder: (_, __) => const CreatePurchaseOrderScreen(),
      ),
      GoRoute(
        path: AppRoutes.createQuote,
        builder: (_, __) => const CreateQuoteScreen(),
      ),
    ],
  );
});

class _AuthStateListenable extends ChangeNotifier {
  _AuthStateListenable(Ref ref) {
    ref.listen(authProvider, (_, __) => notifyListeners());
  }
}
