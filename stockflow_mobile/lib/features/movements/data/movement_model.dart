class Movement {
  final String id;
  final String reference;
  final String type;
  final String status;
  final String? fromWarehouse;
  final String? toWarehouse;
  final String? notes;
  final DateTime createdAt;
  final List<MovementLine> lines;

  const Movement({
    required this.id,
    required this.reference,
    required this.type,
    required this.status,
    this.fromWarehouse,
    this.toWarehouse,
    this.notes,
    required this.createdAt,
    this.lines = const [],
  });

  factory Movement.fromJson(Map<String, dynamic> json) {
    final linesList = json['lines'] as List? ??
        json['movementLines'] as List? ??
        [];
    return Movement(
      id: json['id']?.toString() ?? '',
      reference: json['reference'] as String? ??
          json['movementReference'] as String? ??
          '#${json['id']}',
      type: json['type'] as String? ?? json['movementType'] as String? ?? 'TRANSFER',
      status: json['status'] as String? ?? 'PENDING',
      fromWarehouse: json['fromWarehouseName'] as String? ??
          (json['fromWarehouse'] as Map?)?['name'] as String?,
      toWarehouse: json['toWarehouseName'] as String? ??
          (json['toWarehouse'] as Map?)?['name'] as String?,
      notes: json['notes'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      lines: linesList
          .map((e) => MovementLine.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

class MovementLine {
  final String id;
  final String itemName;
  final double quantity;
  final String? lotNumber;

  const MovementLine({
    required this.id,
    required this.itemName,
    required this.quantity,
    this.lotNumber,
  });

  factory MovementLine.fromJson(Map<String, dynamic> json) {
    return MovementLine(
      id: json['id']?.toString() ?? '',
      itemName: json['itemName'] as String? ??
          (json['item'] as Map?)?['name'] as String? ?? '',
      quantity: (json['quantity'] as num?)?.toDouble() ?? 0,
      lotNumber: json['lotNumber'] as String?,
    );
  }
}

class PaginatedMovements {
  final List<Movement> movements;
  final int totalElements;

  const PaginatedMovements({
    required this.movements,
    required this.totalElements,
  });

  factory PaginatedMovements.fromJson(dynamic data) {
    if (data is Map) {
      final content = data['content'] as List? ?? data['data'] as List? ?? [];
      return PaginatedMovements(
        movements: content
            .map((e) => Movement.fromJson(e as Map<String, dynamic>))
            .toList(),
        totalElements: data['totalElements'] as int? ?? content.length,
      );
    }
    if (data is List) {
      return PaginatedMovements(
        movements: data
            .map((e) => Movement.fromJson(e as Map<String, dynamic>))
            .toList(),
        totalElements: data.length,
      );
    }
    return const PaginatedMovements(movements: [], totalElements: 0);
  }
}

class CreateMovementRequest {
  final String type;
  final String? fromWarehouseId;
  final String? toWarehouseId;
  final String? notes;
  final List<CreateMovementLine> lines;

  const CreateMovementRequest({
    required this.type,
    this.fromWarehouseId,
    this.toWarehouseId,
    this.notes,
    required this.lines,
  });

  Map<String, dynamic> toJson() => {
        'type': type,
        if (fromWarehouseId != null) 'fromWarehouseId': fromWarehouseId,
        if (toWarehouseId != null) 'toWarehouseId': toWarehouseId,
        if (notes != null) 'notes': notes,
        'lines': lines.map((l) => l.toJson()).toList(),
      };
}

class CreateMovementLine {
  final String itemId;
  final double quantity;
  final String? lotNumber;

  const CreateMovementLine({
    required this.itemId,
    required this.quantity,
    this.lotNumber,
  });

  Map<String, dynamic> toJson() => {
        'itemId': itemId,
        'quantity': quantity,
        if (lotNumber != null) 'lotNumber': lotNumber,
      };
}
