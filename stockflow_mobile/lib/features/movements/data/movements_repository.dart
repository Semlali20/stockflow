import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/api_endpoints.dart';
import 'movement_model.dart';

final movementsRepositoryProvider = Provider<MovementsRepository>((ref) {
  return MovementsRepository(ref.watch(dioProvider));
});

class MovementsRepository {
  final Dio _dio;

  MovementsRepository(this._dio);

  Future<PaginatedMovements> getMovements({int page = 0, int size = 20}) async {
    try {
      final response = await _dio.get(
        ApiEndpoints.movements,
        queryParameters: {
          'page': page,
          'size': size,
          'sort': 'createdAt,desc',
        },
      );
      return PaginatedMovements.fromJson(response.data);
    } on DioException catch (e) {
      throw parseApiError(e);
    }
  }

  Future<Movement> createMovement(CreateMovementRequest request) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.movements,
        data: request.toJson(),
      );
      return Movement.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw parseApiError(e);
    }
  }
}
