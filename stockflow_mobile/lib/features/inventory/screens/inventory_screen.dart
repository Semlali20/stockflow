import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/loading_shimmer.dart';
import '../../../shared/widgets/empty_view.dart';
import '../../../shared/widgets/error_view.dart';
import '../../../shared/widgets/stock_badge.dart';
import '../data/inventory_model.dart';
import '../providers/inventory_provider.dart';

class InventoryScreen extends ConsumerWidget {
  const InventoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final invAsync = ref.watch(inventoryProvider);
    final lowStockOnly = ref.watch(inventoryFilterProvider);

    return Scaffold(
      backgroundColor: AppColors.darkBg,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Inventory', style: AppTextStyles.displayMd),
                  const SizedBox(height: 4),
                  Text('Stock levels across all locations', style: AppTextStyles.bodySm),
                  const SizedBox(height: 16),
                  // Filter chips
                  Row(
                    children: [
                      _FilterChip(
                        label: 'All Stock',
                        selected: !lowStockOnly,
                        onTap: () => ref.read(inventoryFilterProvider.notifier).state = false,
                      ),
                      const SizedBox(width: 8),
                      _FilterChip(
                        label: '⚠ Low Stock',
                        selected: lowStockOnly,
                        onTap: () => ref.read(inventoryFilterProvider.notifier).state = true,
                        selectedColor: AppColors.amber,
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Expanded(
              child: RefreshIndicator(
                color: AppColors.primary,
                backgroundColor: AppColors.darkSurface,
                onRefresh: () async => ref.invalidate(inventoryProvider),
                child: invAsync.when(
                  loading: () => ListView.builder(
                    itemCount: 8,
                    itemBuilder: (_, __) => const ListItemShimmer(),
                  ),
                  error: (e, _) => ErrorView(
                    message: e.toString(),
                    onRetry: () => ref.invalidate(inventoryProvider),
                  ),
                  data: (inv) => inv.entries.isEmpty
                      ? EmptyView(
                          icon: Icons.layers_outlined,
                          title: lowStockOnly ? 'No low stock items' : 'No inventory records',
                          subtitle: lowStockOnly
                              ? 'All items are well stocked'
                              : 'No inventory data available yet',
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.only(bottom: 16),
                          itemCount: inv.entries.length,
                          itemBuilder: (_, i) => _InventoryTile(entry: inv.entries[i]),
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

class _FilterChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  final Color selectedColor;

  const _FilterChip({
    required this.label,
    required this.selected,
    required this.onTap,
    this.selectedColor = AppColors.primary,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: selected
              ? selectedColor.withValues(alpha: 0.15)
              : AppColors.darkSurface,
          borderRadius: BorderRadius.circular(99),
          border: Border.all(
            color: selected ? selectedColor.withValues(alpha: 0.5) : AppColors.darkBorder,
          ),
        ),
        child: Text(
          label,
          style: GoogleFonts.plusJakartaSans(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: selected ? selectedColor : AppColors.darkTextMuted,
          ),
        ),
      ),
    );
  }
}

class _InventoryTile extends StatelessWidget {
  final InventoryEntry entry;

  const _InventoryTile({required this.entry});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 5),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.darkSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: entry.isLowStock
              ? AppColors.amber.withValues(alpha: 0.25)
              : AppColors.darkBorder,
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: entry.isOutOfStock
                  ? AppColors.danger.withValues(alpha: 0.1)
                  : entry.isLowStock
                      ? AppColors.amber.withValues(alpha: 0.1)
                      : AppColors.success.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              Icons.layers_rounded,
              color: entry.isOutOfStock
                  ? AppColors.danger
                  : entry.isLowStock
                      ? AppColors.amber
                      : AppColors.success,
              size: 22,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  entry.itemName,
                  style: AppTextStyles.labelMd,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 3),
                Row(
                  children: [
                    if (entry.warehouseName != null)
                      Text(
                        entry.warehouseName!,
                        style: AppTextStyles.caption,
                      ),
                    if (entry.lotNumber != null) ...[
                      Text(' · ', style: AppTextStyles.caption),
                      Text(
                        'Lot: ${entry.lotNumber}',
                        style: AppTextStyles.caption.copyWith(
                          color: AppColors.teal.withValues(alpha: 0.8),
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                entry.quantity.toStringAsFixed(0),
                style: GoogleFonts.jetBrainsMono(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.darkTextPrimary,
                ),
              ),
              if (entry.minQuantity != null)
                Text(
                  'min ${entry.minQuantity!.toStringAsFixed(0)}',
                  style: AppTextStyles.caption,
                ),
            ],
          ),
          const SizedBox(width: 10),
          StockBadge.fromString(entry.stockStatus),
        ],
      ),
    );
  }
}
