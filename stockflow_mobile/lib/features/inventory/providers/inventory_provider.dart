import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/inventory_model.dart';
import '../data/inventory_repository.dart';

// 'all' | 'low' | 'out'
final inventoryStatusFilterProvider = StateProvider<String>((ref) => 'all');
final inventorySearchProvider = StateProvider<String>((ref) => '');

final inventoryProvider = FutureProvider.autoDispose<PaginatedInventory>((ref) async {
  final filter = ref.watch(inventoryStatusFilterProvider);
  final search = ref.watch(inventorySearchProvider);

  final result = await ref.watch(inventoryRepositoryProvider).getInventory(
        lowStock: filter == 'low' ? true : null,
        search: search.isNotEmpty ? search : null,
        size: 50,
      );

  // Client-side filter for out-of-stock (backend doesn't have this param)
  if (filter == 'out') {
    return PaginatedInventory(
      entries: result.entries.where((e) => e.isOutOfStock).toList(),
      totalElements: result.entries.where((e) => e.isOutOfStock).length,
    );
  }

  return result;
});

// Separate provider for summary counts (always fetches all items)
final inventorySummaryProvider = FutureProvider.autoDispose<Map<String, int>>((ref) async {
  final result = await ref.watch(inventoryRepositoryProvider).getInventory(size: 200);
  final entries = result.entries;
  return {
    'total': result.totalElements,
    'low': entries.where((e) => e.isLowStock && !e.isOutOfStock).length,
    'out': entries.where((e) => e.isOutOfStock).length,
  };
});

// Keep old provider for backward compat (used elsewhere)
final inventoryFilterProvider = StateProvider<bool>((ref) => false);
