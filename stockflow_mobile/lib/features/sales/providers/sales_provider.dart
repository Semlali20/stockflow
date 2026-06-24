import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/sales_models.dart';
import '../data/sales_repository.dart';

final customersListProvider = FutureProvider.autoDispose.family<PagedCustomers, String>((ref, search) async {
  return ref.watch(salesRepositoryProvider).getCustomers(search: search);
});

final activeCustomersProvider = FutureProvider.autoDispose<List<Customer>>((ref) async {
  return ref.watch(salesRepositoryProvider).getActiveCustomers();
});

final quotesProvider = FutureProvider.autoDispose.family<PagedQuotes, String>((ref, status) async {
  return ref.watch(salesRepositoryProvider).getQuotes(status: status);
});

final deliveryNotesProvider = FutureProvider.autoDispose.family<PagedDeliveryNotes, String>((ref, status) async {
  return ref.watch(salesRepositoryProvider).getDeliveryNotes(status: status);
});
