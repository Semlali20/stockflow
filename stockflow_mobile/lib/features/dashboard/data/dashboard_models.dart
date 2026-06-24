String _shortMovId(String? id) {
  if (id == null || id.isEmpty) return 'MOV-UNKNOWN';
  final clean = id.replaceAll('-', '');
  final short = clean.length >= 8 ? clean.substring(0, 8).toUpperCase() : clean.toUpperCase();
  return 'MOV-$short';
}

class DashboardStats {
  final int totalItems;
  final int lowStockCount;
  final int movementsToday;
  final int warehouseCount;

  const DashboardStats({
    required this.totalItems,
    required this.lowStockCount,
    required this.movementsToday,
    required this.warehouseCount,
  });
}

class RecentMovement {
  final String id;
  final String reference;
  final String type;
  final String status;
  final String? fromLocation;
  final String? toLocation;
  final DateTime createdAt;

  const RecentMovement({
    required this.id,
    required this.reference,
    required this.type,
    required this.status,
    this.fromLocation,
    this.toLocation,
    required this.createdAt,
  });

  factory RecentMovement.fromJson(Map<String, dynamic> json) {
    return RecentMovement(
      id: json['id']?.toString() ?? '',
      reference: json['referenceNumber'] as String? ??
          json['reference'] as String? ??
          json['movementReference'] as String? ??
          _shortMovId(json['id']?.toString()),
      type: json['type'] as String? ?? json['movementType'] as String? ?? 'TRANSFER',
      status: json['status'] as String? ?? 'PENDING',
      fromLocation: json['fromLocation'] as String? ??
          (json['fromWarehouse'] as Map?)?.entries.first.value?.toString(),
      toLocation: json['toLocation'] as String? ??
          (json['toWarehouse'] as Map?)?.entries.first.value?.toString(),
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }
}
