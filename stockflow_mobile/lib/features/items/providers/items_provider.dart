import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/item_model.dart';
import '../data/items_repository.dart';

final itemsSearchProvider = StateProvider<String>((ref) => '');

final itemsProvider = FutureProvider.autoDispose<PaginatedItems>((ref) async {
  final search = ref.watch(itemsSearchProvider);
  final repo = ref.watch(itemsRepositoryProvider);
  return repo.getItems(search: search.isEmpty ? null : search);
});

final itemDetailProvider =
    FutureProvider.autoDispose.family<Item, String>((ref, id) async {
  return ref.watch(itemsRepositoryProvider).getItemById(id);
});
