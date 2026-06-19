import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/api_endpoints.dart';
import 'inventory_model.dart';

final inventoryRepositoryProvider = Provider<InventoryRepository>((ref) {
  return InventoryRepository(ref.watch(dioProvider));
});

class InventoryRepository {
  final Dio _dio;

  InventoryRepository(this._dio);

  Future<PaginatedInventory> getInventory({
    int page = 0,
    int size = 50,
    String? search,
    bool? lowStock,
  }) async {
    try {
      // Fetch inventory list and items catalogue in parallel
      final results = await Future.wait([
        _dio.get(ApiEndpoints.inventory),
        _dio.get(ApiEndpoints.items, queryParameters: {'size': 500, 'page': 0}),
      ]);

      // Build items lookup map: id → item JSON
      final itemsRaw = results[1].data;
      final itemsList = itemsRaw is Map
          ? (itemsRaw['content'] as List? ??
              itemsRaw['data'] as List? ?? [])
          : itemsRaw is List ? itemsRaw : <dynamic>[];
      final itemsMap = <String, Map<String, dynamic>>{};
      for (final item in itemsList) {
        final id = item['id']?.toString();
        if (id != null) itemsMap[id] = item as Map<String, dynamic>;
      }

      // Parse raw inventory list
      final invRaw = results[0].data;
      final rawList = invRaw is List
          ? invRaw
          : invRaw is Map
              ? (invRaw['content'] as List? ?? invRaw['data'] as List? ?? [])
              : <dynamic>[];

      // Join inventory records with item details
      var entries = rawList.map<InventoryEntry>((json) {
        final itemId = (json as Map<String, dynamic>)['itemId']?.toString();
        final item = itemId != null ? itemsMap[itemId] : null;
        return InventoryEntry.fromJson(json, item: item);
      }).toList();

      // Client-side search filter
      if (search != null && search.isNotEmpty) {
        final q = search.toLowerCase();
        entries = entries
            .where((e) =>
                e.itemName.toLowerCase().contains(q) ||
                (e.sku?.toLowerCase().contains(q) ?? false))
            .toList();
      }

      // Client-side low-stock filter
      if (lowStock == true) {
        entries = entries.where((e) => e.isLowStock).toList();
      }

      final total = entries.length;
      // Client-side pagination
      final paged = entries.skip(page * size).take(size).toList();

      return PaginatedInventory(entries: paged, totalElements: total);
    } on DioException catch (e) {
      throw parseApiError(e);
    }
  }
}
