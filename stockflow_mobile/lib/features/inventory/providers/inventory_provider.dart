import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/inventory_model.dart';
import '../data/inventory_repository.dart';

final inventoryFilterProvider = StateProvider<bool>((ref) => false); // false=all, true=lowStock only

final inventoryProvider = FutureProvider.autoDispose<PaginatedInventory>((ref) async {
  final lowStockOnly = ref.watch(inventoryFilterProvider);
  return ref.watch(inventoryRepositoryProvider).getInventory(
        lowStock: lowStockOnly ? true : null,
      );
});
