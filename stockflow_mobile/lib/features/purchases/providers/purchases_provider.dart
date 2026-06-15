import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/purchase_models.dart';
import '../data/purchases_repository.dart';

final suppliersProvider = FutureProvider.autoDispose<List<Supplier>>((ref) async {
  final result = await ref.watch(purchasesRepositoryProvider).getActiveSuppliers();
  return result;
});

final suppliersListProvider = FutureProvider.autoDispose.family<PagedSuppliers, String>((ref, search) async {
  return ref.watch(purchasesRepositoryProvider).getSuppliers(search: search);
});

final purchaseOrdersProvider = FutureProvider.autoDispose.family<PagedPurchaseOrders, String>((ref, status) async {
  return ref.watch(purchasesRepositoryProvider).getPurchaseOrders(status: status);
});
