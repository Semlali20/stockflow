class Item {
  final String id;
  final String name;
  final String? sku;
  final String? categoryName;
  final String? description;
  final String? unit;
  final double? price;
  final String? imageUrl;
  final bool isActive;

  const Item({
    required this.id,
    required this.name,
    this.sku,
    this.categoryName,
    this.description,
    this.unit,
    this.price,
    this.imageUrl,
    this.isActive = true,
  });

  factory Item.fromJson(Map<String, dynamic> json) {
    return Item(
      id: json['id']?.toString() ?? '',
      name: json['name'] as String? ?? json['itemName'] as String? ?? '',
      sku: json['sku'] as String? ?? json['reference'] as String?,
      categoryName: json['categoryName'] as String? ??
          (json['category'] as Map?)?['name'] as String?,
      description: json['description'] as String?,
      unit: json['unit'] as String? ?? json['unitOfMeasure'] as String?,
      price: (json['price'] as num?)?.toDouble() ??
          (json['unitPrice'] as num?)?.toDouble(),
      imageUrl: json['imageUrl'] as String? ?? json['image'] as String?,
      isActive: json['active'] as bool? ?? json['isActive'] as bool? ?? true,
    );
  }
}

class PaginatedItems {
  final List<Item> items;
  final int totalElements;
  final int page;
  final int totalPages;

  const PaginatedItems({
    required this.items,
    required this.totalElements,
    required this.page,
    required this.totalPages,
  });

  factory PaginatedItems.fromJson(dynamic data) {
    if (data is Map) {
      final content = data['content'] as List? ?? data['data'] as List? ?? [];
      return PaginatedItems(
        items: content
            .map((e) => Item.fromJson(e as Map<String, dynamic>))
            .toList(),
        totalElements: data['totalElements'] as int? ?? content.length,
        page: data['number'] as int? ?? data['page'] as int? ?? 0,
        totalPages: data['totalPages'] as int? ?? 1,
      );
    }
    if (data is List) {
      return PaginatedItems(
        items: data.map((e) => Item.fromJson(e as Map<String, dynamic>)).toList(),
        totalElements: data.length,
        page: 0,
        totalPages: 1,
      );
    }
    return const PaginatedItems(
      items: [], totalElements: 0, page: 0, totalPages: 0,
    );
  }
}
