import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/api_endpoints.dart';
import 'sales_models.dart';

final salesRepositoryProvider = Provider<SalesRepository>((ref) {
  return SalesRepository(ref.watch(dioProvider));
});

class SalesRepository {
  final Dio _dio;
  SalesRepository(this._dio);

  Future<PagedCustomers> getCustomers({String? search, int page = 0, int size = 20}) async {
    try {
      final response = await _dio.get(ApiEndpoints.customers, queryParameters: {
        if (search != null && search.isNotEmpty) 'search': search,
        'page': page,
        'size': size,
      });
      return PagedCustomers.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw parseApiError(e);
    }
  }

  Future<List<Customer>> getActiveCustomers() async {
    try {
      final response = await _dio.get('${ApiEndpoints.customers}/active');
      return (response.data as List<dynamic>)
          .map((e) => Customer.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw parseApiError(e);
    }
  }

  Future<Customer> createCustomer(CustomerRequest request) async {
    try {
      final response = await _dio.post(ApiEndpoints.customers, data: request.toJson());
      return Customer.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw parseApiError(e);
    }
  }

  Future<PagedQuotes> getQuotes({String? status, int page = 0, int size = 20}) async {
    try {
      final response = await _dio.get(ApiEndpoints.quotes, queryParameters: {
        if (status != null && status != 'ALL') 'status': status,
        'page': page,
        'size': size,
      });
      return PagedQuotes.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw parseApiError(e);
    }
  }

  Future<Quote> createQuote(QuoteRequest request) async {
    try {
      final response = await _dio.post(ApiEndpoints.quotes, data: request.toJson());
      return Quote.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw parseApiError(e);
    }
  }

  Future<Quote> sendQuote(String id) async {
    try {
      final response = await _dio.post('${ApiEndpoints.quotes}/$id/send');
      return Quote.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw parseApiError(e);
    }
  }

  Future<Quote> acceptQuote(String id) async {
    try {
      final response = await _dio.post('${ApiEndpoints.quotes}/$id/accept');
      return Quote.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw parseApiError(e);
    }
  }

  Future<Quote> rejectQuote(String id) async {
    try {
      final response = await _dio.post('${ApiEndpoints.quotes}/$id/reject');
      return Quote.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw parseApiError(e);
    }
  }

  Future<PagedDeliveryNotes> getDeliveryNotes({String? status, int page = 0, int size = 20}) async {
    try {
      final response = await _dio.get(ApiEndpoints.deliveryNotes, queryParameters: {
        if (status != null && status != 'ALL') 'status': status,
        'page': page,
        'size': size,
      });
      return PagedDeliveryNotes.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw parseApiError(e);
    }
  }

  Future<DeliveryNote> validateDelivery(String id) async {
    try {
      final response = await _dio.post('${ApiEndpoints.deliveryNotes}/$id/validate');
      return DeliveryNote.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw parseApiError(e);
    }
  }
}
