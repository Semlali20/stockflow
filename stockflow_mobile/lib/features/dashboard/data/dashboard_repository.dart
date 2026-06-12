import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/api_endpoints.dart';
import 'dashboard_models.dart';

final dashboardRepositoryProvider = Provider<DashboardRepository>((ref) {
  return DashboardRepository(ref.watch(dioProvider));
});

class DashboardRepository {
  final Dio _dio;

  DashboardRepository(this._dio);

  Future<DashboardStats> getStats() async {
    try {
      final results = await Future.wait([
        _dio.get(ApiEndpoints.items, queryParameters: {'page': 0, 'size': 1}),
        _dio.get(ApiEndpoints.warehouses),
        _dio.get(ApiEndpoints.movements, queryParameters: {'page': 0, 'size': 1}),
      ]);

      final itemsData = results[0].data;
      final warehousesData = results[1].data;
      final movementsData = results[2].data;

      int totalItems = _extractTotal(itemsData);
      int warehouseCount = _extractTotal(warehousesData);
      int movementsToday = _extractTotal(movementsData);

      // Try to get low stock count from inventory
      int lowStockCount = 0;
      try {
        final invRes = await _dio.get(
          ApiEndpoints.inventory,
          queryParameters: {'lowStock': true, 'page': 0, 'size': 1},
        );
        lowStockCount = _extractTotal(invRes.data);
      } catch (_) {}

      return DashboardStats(
        totalItems: totalItems,
        lowStockCount: lowStockCount,
        movementsToday: movementsToday,
        warehouseCount: warehouseCount,
      );
    } on DioException catch (e) {
      throw parseApiError(e);
    }
  }

  Future<List<RecentMovement>> getRecentMovements({int limit = 5}) async {
    try {
      final response = await _dio.get(
        ApiEndpoints.movements,
        queryParameters: {'page': 0, 'size': limit, 'sort': 'createdAt,desc'},
      );
      final data = response.data;
      final List<dynamic> items = data is Map
          ? (data['content'] as List? ?? data['data'] as List? ?? [])
          : data is List
              ? data
              : [];
      return items
          .map((e) => RecentMovement.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw parseApiError(e);
    }
  }

  int _extractTotal(dynamic data) {
    if (data is Map) {
      return (data['totalElements'] as int?) ??
          (data['total'] as int?) ??
          (data['count'] as int?) ??
          (data['content'] as List?)?.length ??
          0;
    }
    if (data is List) return data.length;
    return 0;
  }
}
