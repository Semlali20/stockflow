import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/api_endpoints.dart';
import 'item_model.dart';

final itemsRepositoryProvider = Provider<ItemsRepository>((ref) {
  return ItemsRepository(ref.watch(dioProvider));
});

class ItemsRepository {
  final Dio _dio;

  ItemsRepository(this._dio);

  Future<PaginatedItems> getItems({
    int page = 0,
    int size = 20,
    String? search,
    String? categoryId,
  }) async {
    try {
      final response = await _dio.get(
        ApiEndpoints.items,
        queryParameters: {
          'page': page,
          'size': size,
          if (search != null && search.isNotEmpty) 'search': search,
          if (categoryId != null) 'categoryId': categoryId,
        },
      );
      return PaginatedItems.fromJson(response.data);
    } on DioException catch (e) {
      throw parseApiError(e);
    }
  }

  Future<Item> getItemById(String id) async {
    try {
      final response = await _dio.get(ApiEndpoints.itemById(id));
      return Item.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw parseApiError(e);
    }
  }
}
