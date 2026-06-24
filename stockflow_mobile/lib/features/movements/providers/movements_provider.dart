import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/movement_model.dart';
import '../data/movements_repository.dart';

final movementsProvider =
    FutureProvider.autoDispose<PaginatedMovements>((ref) async {
  return ref.watch(movementsRepositoryProvider).getMovements();
});
