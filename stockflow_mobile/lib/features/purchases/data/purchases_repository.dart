import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/api_endpoints.dart';
import 'purchase_models.dart';

final purchasesRepositoryProvider = Provider<PurchasesRepository>((ref) {
  return PurchasesRepository(ref.watch(dioProvider));
});

class PurchasesRepository {
  final Dio _dio;
  PurchasesRepository(this._dio);

  Future<PagedSuppliers> getSuppliers({String? search, int page = 0, int size = 20}) async {
    try {
      final response = await _dio.get(ApiEndpoints.suppliers, queryParameters: {
        if (search != null && search.isNotEmpty) 'search': search,
        'page': page,
        'size': size,
      });
      return PagedSuppliers.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw parseApiError(e);
    }
  }

  Future<List<Supplier>> getActiveSuppliers() async {
    try {
      final response = await _dio.get('${ApiEndpoints.suppliers}/active');
      return (response.data as List<dynamic>)
          .map((e) => Supplier.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw parseApiError(e);
    }
  }

  Future<Supplier> createSupplier(SupplierRequest request) async {
    try {
      final response = await _dio.post(ApiEndpoints.suppliers, data: request.toJson());
      return Supplier.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw parseApiError(e);
    }
  }

  Future<PagedPurchaseOrders> getPurchaseOrders({String? status, int page = 0, int size = 20}) async {
    try {
      final response = await _dio.get(ApiEndpoints.purchaseOrders, queryParameters: {
        if (status != null && status != 'ALL') 'status': status,
        'page': page,
        'size': size,
      });
      return PagedPurchaseOrders.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw parseApiError(e);
    }
  }

  Future<PurchaseOrder> createPurchaseOrder(PurchaseOrderRequest request) async {
    try {
      final response = await _dio.post(ApiEndpoints.purchaseOrders, data: request.toJson());
      return PurchaseOrder.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw parseApiError(e);
    }
  }

  Future<PurchaseOrder> confirmOrder(String id) async {
    try {
      final response = await _dio.post('${ApiEndpoints.purchaseOrders}/$id/confirm');
      return PurchaseOrder.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw parseApiError(e);
    }
  }

  Future<PurchaseOrder> cancelOrder(String id) async {
    try {
      final response = await _dio.post('${ApiEndpoints.purchaseOrders}/$id/cancel');
      return PurchaseOrder.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw parseApiError(e);
    }
  }
}
