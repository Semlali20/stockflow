class InventoryEntry {
  final String id;
  final String itemId;
  final String itemName;
  final String? sku;
  final double quantity;
  final double? minQuantity;
  final String? locationName;
  final String? warehouseName;
  final String? lotNumber;
  final String? serialNumber;

  const InventoryEntry({
    required this.id,
    required this.itemId,
    required this.itemName,
    this.sku,
    required this.quantity,
    this.minQuantity,
    this.locationName,
    this.warehouseName,
    this.lotNumber,
    this.serialNumber,
  });

  // When backend provides no minimum, treat ≤10 units as low stock
  bool get isLowStock => quantity > 0 &&
      (minQuantity != null ? quantity <= minQuantity! : quantity <= 10);

  bool get isOutOfStock => quantity <= 0;

  String get stockStatus {
    if (isOutOfStock) return 'out_of_stock';
    if (isLowStock) return 'low_stock';
    return 'in_stock';
  }

  /// [item] is the joined item record from /api/items (optional).
  factory InventoryEntry.fromJson(Map<String, dynamic> json, {Map<String, dynamic>? item}) {
    return InventoryEntry(
      id: json['id']?.toString() ?? '',
      itemId: json['itemId']?.toString() ??
          (json['item'] as Map?)?['id']?.toString() ?? '',
      // Name comes from the joined item; fall back to inline fields for other endpoints
      itemName: item?['name'] as String? ??
          json['itemName'] as String? ??
          (json['item'] as Map?)?['name'] as String? ?? '',
      sku: item?['sku'] as String? ??
          json['sku'] as String? ??
          (json['item'] as Map?)?['sku'] as String?,
      // Backend uses quantityOnHand; other endpoints may use quantity / currentStock
      quantity: (json['quantityOnHand'] as num?)?.toDouble() ??
          (json['quantity'] as num?)?.toDouble() ??
          (json['currentStock'] as num?)?.toDouble() ?? 0,
      minQuantity: (json['minQuantity'] as num?)?.toDouble() ??
          (json['minimumStock'] as num?)?.toDouble(),
      locationName: json['locationName'] as String? ??
          (json['location'] as Map?)?['name'] as String?,
      warehouseName: json['warehouseName'] as String? ??
          (json['warehouse'] as Map?)?['name'] as String?,
      lotNumber: json['lotNumber'] as String? ?? json['lot'] as String?,
      serialNumber: json['serialNumber'] as String?,
    );
  }
}

class PaginatedInventory {
  final List<InventoryEntry> entries;
  final int totalElements;

  const PaginatedInventory({
    required this.entries,
    required this.totalElements,
  });

  factory PaginatedInventory.fromJson(dynamic data) {
    if (data is Map) {
      final content = data['content'] as List? ?? data['data'] as List? ?? [];
      return PaginatedInventory(
        entries: content
            .map((e) => InventoryEntry.fromJson(e as Map<String, dynamic>))
            .toList(),
        totalElements: data['totalElements'] as int? ?? content.length,
      );
    }
    if (data is List) {
      return PaginatedInventory(
        entries: data
            .map((e) => InventoryEntry.fromJson(e as Map<String, dynamic>))
            .toList(),
        totalElements: data.length,
      );
    }
    return const PaginatedInventory(entries: [], totalElements: 0);
  }
}
