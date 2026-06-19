import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/loading_shimmer.dart';
import '../../../shared/widgets/empty_view.dart';
import '../../../shared/widgets/error_view.dart';
import '../data/item_model.dart';
import '../providers/items_provider.dart';

class ItemsListScreen extends ConsumerStatefulWidget {
  const ItemsListScreen({super.key});

  @override
  ConsumerState<ItemsListScreen> createState() => _ItemsListScreenState();
}

class _ItemsListScreenState extends ConsumerState<ItemsListScreen> {
  final _searchCtrl = TextEditingController();

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final itemsAsync = ref.watch(itemsProvider);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Items', style: AppTextStyles.displayMd),
                  const SizedBox(height: 4),
                  Text('Browse your product catalog', style: AppTextStyles.bodySm.copyWith(color: context.colorTextMuted)),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _searchCtrl,
                    onChanged: (v) => ref.read(itemsSearchProvider.notifier).state = v,
                    style: AppTextStyles.bodyMd,
                    decoration: InputDecoration(
                      hintText: 'Search items...',
                      prefixIcon: const Icon(Icons.search_rounded, size: 20),
                      suffixIcon: _searchCtrl.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear_rounded, size: 18),
                              onPressed: () {
                                _searchCtrl.clear();
                                ref.read(itemsSearchProvider.notifier).state = '';
                              },
                            )
                          : null,
                    ),
                  ),
                ],
              ),
            ),

            Expanded(
              child: RefreshIndicator(
                color: AppColors.primary,
                backgroundColor: context.colorSurface,
                onRefresh: () async => ref.invalidate(itemsProvider),
                child: itemsAsync.when(
                  loading: () => ListView.builder(
                    itemCount: 8,
                    itemBuilder: (_, __) => const ListItemShimmer(),
                  ),
                  error: (e, _) => ErrorView(
                    message: e.toString(),
                    onRetry: () => ref.invalidate(itemsProvider),
                  ),
                  data: (paginated) => paginated.items.isEmpty
                      ? const EmptyView(
                          icon: Icons.inventory_2_outlined,
                          title: 'No items found',
                          subtitle: 'Try adjusting your search or add new items',
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.only(bottom: 16),
                          itemCount: paginated.items.length,
                          itemBuilder: (_, i) => _ItemTile(item: paginated.items[i]),
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

class _ItemTile extends StatelessWidget {
  final Item item;

  const _ItemTile({required this.item});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.go('/items/${item.id}'),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 5),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: context.colorSurface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: context.colorBorder, width: 1),
        ),
        child: Row(
          children: [
            Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.inventory_2_rounded, color: AppColors.primary, size: 22),
            ),

            const SizedBox(width: 14),

            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item.name, style: AppTextStyles.labelMd, maxLines: 1, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      if (item.sku != null) ...[
                        Text(item.sku!, style: AppTextStyles.caption.copyWith(color: context.colorTextMuted, fontFamily: 'monospace')),
                        if (item.categoryName != null)
                          Text(' · ', style: AppTextStyles.caption.copyWith(color: context.colorTextSubtle)),
                      ],
                      if (item.categoryName != null)
                        Text(item.categoryName!, style: AppTextStyles.caption.copyWith(color: context.colorTextSubtle)),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(width: 8),

            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: item.isActive ? AppColors.success : context.colorTextSubtle,
                shape: BoxShape.circle,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
