import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/dashboard_models.dart';
import '../data/dashboard_repository.dart';

final dashboardStatsProvider = FutureProvider<DashboardStats>((ref) async {
  return ref.watch(dashboardRepositoryProvider).getStats();
});

final recentMovementsProvider = FutureProvider<List<RecentMovement>>((ref) async {
  return ref.watch(dashboardRepositoryProvider).getRecentMovements();
});
