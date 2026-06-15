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
    int size = 20,
    String? search,
    bool? lowStock,
  }) async {
    try {
      final response = await _dio.get(
        ApiEndpoints.inventory,
        queryParameters: {
          'page': page,
          'size': size,
          if (search != null && search.isNotEmpty) 'search': search,
          if (lowStock == true) 'lowStock': true,
        },
      );
      return PaginatedInventory.fromJson(response.data);
    } on DioException catch (e) {
      throw parseApiError(e);
    }
  }
}
