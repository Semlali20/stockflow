import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/router/app_router.dart';
import '../../../features/auth/providers/auth_provider.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/loading_shimmer.dart';
import '../../../shared/widgets/error_view.dart';
import '../../../shared/widgets/stock_badge.dart';
import '../data/dashboard_models.dart';
import '../providers/dashboard_provider.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final statsAsync = ref.watch(dashboardStatsProvider);
    final movementsAsync = ref.watch(recentMovementsProvider);
    final scaffoldBg = Theme.of(context).scaffoldBackgroundColor;

    return Scaffold(
      body: Stack(
        children: [
          Container(
            height: 260,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  scaffoldBg.withOpacity(0.95),
                  AppColors.primary.withOpacity(0.08),
                  scaffoldBg,
                ],
              ),
            ),
          ),

          SafeArea(
            child: RefreshIndicator(
              color: AppColors.primary,
              backgroundColor: context.colorSurface,
              onRefresh: () async {
                ref.invalidate(dashboardStatsProvider);
                ref.invalidate(recentMovementsProvider);
              },
              child: CustomScrollView(
                slivers: [
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                      child: _buildHeader(context, user?.firstName ?? 'User'),
                    ),
                  ),

                  const SliverToBoxAdapter(child: SizedBox(height: 24)),

                  SliverToBoxAdapter(
                    child: statsAsync.when(
                      loading: () => _buildKpiShimmer(),
                      error: (e, _) => Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: ErrorView(message: e.toString(), onRetry: () {
                          ref.invalidate(dashboardStatsProvider);
                        }),
                      ),
                      data: (stats) => _buildKpiGrid(context, stats),
                    ),
                  ),

                  const SliverToBoxAdapter(child: SizedBox(height: 28)),

                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: _buildQuickActions(context),
                    ),
                  ),

                  const SliverToBoxAdapter(child: SizedBox(height: 28)),

                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: Row(
                        children: [
                          Text('Recent Movements', style: AppTextStyles.headingMd),
                          const Spacer(),
                          GestureDetector(
                            onTap: () => context.go(AppRoutes.movements),
                            child: Text(
                              'View all',
                              style: AppTextStyles.labelMd.copyWith(
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SliverToBoxAdapter(child: SizedBox(height: 12)),

                  movementsAsync.when(
                    loading: () => SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (_, __) => const ListItemShimmer(),
                        childCount: 3,
                      ),
                    ),
                    error: (_, __) => const SliverToBoxAdapter(child: SizedBox()),
                    data: (movements) => movements.isEmpty
                        ? SliverToBoxAdapter(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 20),
                              child: Text('No movements yet', style: AppTextStyles.bodySm),
                            ),
                          )
                        : SliverList(
                            delegate: SliverChildBuilderDelegate(
                              (_, i) => _MovementTile(movement: movements[i]),
                              childCount: movements.length,
                            ),
                          ),
                  ),

                  const SliverToBoxAdapter(child: SizedBox(height: 24)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context, String name) {
    final hour = DateTime.now().hour;
    final greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                greeting,
                style: AppTextStyles.bodySm.copyWith(color: context.colorTextMuted),
              ),
              const SizedBox(height: 2),
              Text(name, style: AppTextStyles.headingLg),
            ],
          ),
        ),
        Container(
          width: 42,
          height: 42,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppColors.primary, AppColors.teal],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(13),
          ),
          child: const Icon(Icons.notifications_outlined, color: Colors.white, size: 20),
        ),
      ],
    );
  }

  Widget _buildKpiGrid(BuildContext context, DashboardStats stats) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 1.35,
        children: [
          _KpiCard(label: 'Total Items', value: stats.totalItems.toString(), icon: Icons.inventory_2_rounded, color: AppColors.primary, trend: '+12%'),
          _KpiCard(label: 'Low Stock', value: stats.lowStockCount.toString(), icon: Icons.warning_amber_rounded, color: AppColors.amber, trend: stats.lowStockCount > 0 ? '⚠ Alert' : '✓ OK', trendPositive: stats.lowStockCount == 0),
          _KpiCard(label: 'Movements', value: stats.movementsToday.toString(), icon: Icons.swap_horiz_rounded, color: AppColors.teal, trend: 'Total'),
          _KpiCard(label: 'Warehouses', value: stats.warehouseCount.toString(), icon: Icons.warehouse_rounded, color: AppColors.violet, trend: 'Active'),
        ],
      ),
    );
  }

  Widget _buildKpiShimmer() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 1.35,
        children: List.generate(4, (_) => const KpiCardShimmer()),
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    final actions = [
      (icon: Icons.add_box_rounded, label: 'New Movement', color: AppColors.primary, route: AppRoutes.createMovement),
      (icon: Icons.search_rounded, label: 'Items', color: AppColors.teal, route: AppRoutes.items),
      (icon: Icons.layers_rounded, label: 'Inventory', color: AppColors.violet, route: AppRoutes.inventory),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Quick Actions', style: AppTextStyles.headingMd),
        const SizedBox(height: 12),
        Row(
          children: actions
              .map((a) => Expanded(
                    child: Padding(
                      padding: EdgeInsets.only(right: a == actions.last ? 0 : 10),
                      child: GestureDetector(
                        onTap: () => context.go(a.route),
                        child: GlassCard(
                          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
                          child: Column(
                            children: [
                              Icon(a.icon, color: a.color, size: 24),
                              const SizedBox(height: 6),
                              Text(a.label, style: AppTextStyles.caption.copyWith(fontSize: 10), textAlign: TextAlign.center),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ))
              .toList(),
        ),
      ],
    );
  }
}

class _KpiCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  final String trend;
  final bool trendPositive;

  const _KpiCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
    required this.trend,
    this.trendPositive = true,
  });

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: color, size: 18),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                decoration: BoxDecoration(
                  color: (trendPositive ? AppColors.success : AppColors.amber).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  trend,
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 9,
                    fontWeight: FontWeight.w700,
                    color: trendPositive ? AppColors.successLight : AppColors.amberLight,
                  ),
                ),
              ),
            ],
          ),
          const Spacer(),
          Text(
            value,
            style: GoogleFonts.jetBrainsMono(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: context.colorTextPrimary,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 2),
          Text(label, style: AppTextStyles.caption.copyWith(fontSize: 11)),
        ],
      ),
    );
  }
}

class _MovementTile extends StatelessWidget {
  final RecentMovement movement;

  const _MovementTile({required this.movement});

  @override
  Widget build(BuildContext context) {
    final formatter = DateFormat('MMM d, HH:mm');

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: context.colorSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.colorBorder, width: 1),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.teal.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.swap_horiz_rounded, color: AppColors.teal, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(movement.reference, style: AppTextStyles.labelMd),
                const SizedBox(height: 2),
                Text(formatter.format(movement.createdAt), style: AppTextStyles.caption),
              ],
            ),
          ),
          StockBadge.fromString(movement.status),
        ],
      ),
    );
  }
}
