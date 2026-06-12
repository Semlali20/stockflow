import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/router/app_router.dart';
import '../../../shared/widgets/loading_shimmer.dart';
import '../../../shared/widgets/empty_view.dart';
import '../../../shared/widgets/error_view.dart';
import '../../../shared/widgets/stock_badge.dart';
import '../data/movement_model.dart';
import '../providers/movements_provider.dart';

class MovementsScreen extends ConsumerWidget {
  const MovementsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final movementsAsync = ref.watch(movementsProvider);

    return Scaffold(
      backgroundColor: AppColors.darkBg,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Movements', style: AppTextStyles.displayMd),
                        const SizedBox(height: 4),
                        Text('Stock transfer history', style: AppTextStyles.bodySm),
                      ],
                    ),
                  ),
                  // New movement button
                  GestureDetector(
                    onTap: () => context.go(AppRoutes.createMovement),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                      decoration: BoxDecoration(
                        gradient: AppColors.gradientPrimary,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: AppColors.shadowMdDark,
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.add_rounded, color: Colors.white, size: 16),
                          const SizedBox(width: 4),
                          Text(
                            'New',
                            style: AppTextStyles.buttonSm.copyWith(color: Colors.white),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: RefreshIndicator(
                color: AppColors.primary,
                backgroundColor: AppColors.darkSurface,
                onRefresh: () async => ref.invalidate(movementsProvider),
                child: movementsAsync.when(
                  loading: () => ListView.builder(
                    itemCount: 6,
                    itemBuilder: (_, __) => const ListItemShimmer(),
                  ),
                  error: (e, _) => ErrorView(
                    message: e.toString(),
                    onRetry: () => ref.invalidate(movementsProvider),
                  ),
                  data: (paginated) => paginated.movements.isEmpty
                      ? EmptyView(
                          icon: Icons.swap_horiz_outlined,
                          title: 'No movements yet',
                          subtitle: 'Start by creating a new stock movement',
                          actionLabel: 'Create Movement',
                          onAction: () => context.go(AppRoutes.createMovement),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.only(bottom: 16),
                          itemCount: paginated.movements.length,
                          itemBuilder: (_, i) =>
                              _MovementCard(movement: paginated.movements[i]),
                        ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MovementCard extends StatelessWidget {
  final Movement movement;

  const _MovementCard({required this.movement});

  @override
  Widget build(BuildContext context) {
    final dateFormatter = DateFormat('MMM d, yyyy · HH:mm');

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 5),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.darkSurface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.darkBorder, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header row
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppColors.teal.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.swap_horiz_rounded,
                  color: AppColors.teal,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(movement.reference, style: AppTextStyles.labelMd),
                    const SizedBox(height: 2),
                    Text(
                      movement.type,
                      style: AppTextStyles.caption.copyWith(
                        color: AppColors.teal.withValues(alpha: 0.8),
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.5,
                        fontSize: 10,
                      ),
                    ),
                  ],
                ),
              ),
              StockBadge.fromString(movement.status),
            ],
          ),

          if (movement.fromWarehouse != null || movement.toWarehouse != null) ...[
            const SizedBox(height: 12),
            const Divider(height: 1, color: AppColors.darkBorder),
            const SizedBox(height: 12),
            // Route row
            Row(
              children: [
                if (movement.fromWarehouse != null) ...[
                  const Icon(Icons.warehouse_outlined, size: 14, color: AppColors.darkTextSubtle),
                  const SizedBox(width: 4),
                  Text(movement.fromWarehouse!, style: AppTextStyles.caption),
                ],
                if (movement.fromWarehouse != null && movement.toWarehouse != null) ...[
                  const SizedBox(width: 8),
                  const Icon(Icons.arrow_forward_rounded, size: 14, color: AppColors.darkTextSubtle),
                  const SizedBox(width: 8),
                ],
                if (movement.toWarehouse != null) ...[
                  const Icon(Icons.warehouse_rounded, size: 14, color: AppColors.primary),
                  const SizedBox(width: 4),
                  Text(
                    movement.toWarehouse!,
                    style: AppTextStyles.caption.copyWith(color: AppColors.primaryLight),
                  ),
                ],
              ],
            ),
          ],

          const SizedBox(height: 10),
          Text(
            dateFormatter.format(movement.createdAt),
            style: AppTextStyles.caption,
          ),
        ],
      ),
    );
  }
}
