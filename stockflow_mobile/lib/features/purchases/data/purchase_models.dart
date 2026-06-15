class Supplier {
  final String id;
  final String name;
  final String? email;
  final String? phone;
  final String? address;
  final String? contactPerson;
  final int paymentTermsDays;
  final int leadTimeDays;
  final String status;
  final String? notes;

  const Supplier({
    required this.id,
    required this.name,
    this.email,
    this.phone,
    this.address,
    this.contactPerson,
    this.paymentTermsDays = 30,
    this.leadTimeDays = 7,
    required this.status,
    this.notes,
  });

  factory Supplier.fromJson(Map<String, dynamic> j) => Supplier(
        id: j['id'] as String,
        name: j['name'] as String,
        email: j['email'] as String?,
        phone: j['phone'] as String?,
        address: j['address'] as String?,
        contactPerson: j['contactPerson'] as String?,
        paymentTermsDays: (j['paymentTermsDays'] as num?)?.toInt() ?? 30,
        leadTimeDays: (j['leadTimeDays'] as num?)?.toInt() ?? 7,
        status: j['status'] as String? ?? 'ACTIVE',
        notes: j['notes'] as String?,
      );

  String get initials {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    return name.substring(0, name.length >= 2 ? 2 : 1).toUpperCase();
  }
}

class SupplierRequest {
  final String name;
  final String? email;
  final String? phone;
  final String? address;
  final String? contactPerson;
  final int? paymentTermsDays;
  final int? leadTimeDays;
  final String? notes;

  const SupplierRequest({
    required this.name,
    this.email,
    this.phone,
    this.address,
    this.contactPerson,
    this.paymentTermsDays,
    this.leadTimeDays,
    this.notes,
  });

  Map<String, dynamic> toJson() => {
        'name': name,
        if (email != null) 'email': email,
        if (phone != null) 'phone': phone,
        if (address != null) 'address': address,
        if (contactPerson != null) 'contactPerson': contactPerson,
        if (paymentTermsDays != null) 'paymentTermsDays': paymentTermsDays,
        if (leadTimeDays != null) 'leadTimeDays': leadTimeDays,
        if (notes != null) 'notes': notes,
      };
}

class PurchaseOrderLine {
  final String id;
  final String itemId;
  final String? itemName;
  final String? itemSku;
  final int orderedQuantity;
  final int receivedQuantity;
  final double unitPrice;
  final double totalPrice;
  final String? notes;

  const PurchaseOrderLine({
    required this.id,
    required this.itemId,
    this.itemName,
    this.itemSku,
    required this.orderedQuantity,
    this.receivedQuantity = 0,
    required this.unitPrice,
    required this.totalPrice,
    this.notes,
  });

  factory PurchaseOrderLine.fromJson(Map<String, dynamic> j) => PurchaseOrderLine(
        id: j['id'] as String,
        itemId: j['itemId'] as String,
        itemName: j['itemName'] as String?,
        itemSku: j['itemSku'] as String?,
        orderedQuantity: (j['orderedQuantity'] as num).toInt(),
        receivedQuantity: (j['receivedQuantity'] as num?)?.toInt() ?? 0,
        unitPrice: (j['unitPrice'] as num).toDouble(),
        totalPrice: (j['totalPrice'] as num).toDouble(),
        notes: j['notes'] as String?,
      );
}

class PurchaseOrder {
  final String id;
  final String reference;
  final String supplierId;
  final String? supplierName;
  final String status;
  final String? expectedDeliveryDate;
  final String? notes;
  final double totalAmount;
  final String? createdBy;
  final String? createdAt;
  final List<PurchaseOrderLine> lines;

  const PurchaseOrder({
    required this.id,
    required this.reference,
    required this.supplierId,
    this.supplierName,
    required this.status,
    this.expectedDeliveryDate,
    this.notes,
    required this.totalAmount,
    this.createdBy,
    this.createdAt,
    this.lines = const [],
  });

  factory PurchaseOrder.fromJson(Map<String, dynamic> j) => PurchaseOrder(
        id: j['id'] as String,
        reference: j['reference'] as String,
        supplierId: j['supplierId'] as String,
        supplierName: j['supplierName'] as String?,
        status: j['status'] as String? ?? 'DRAFT',
        expectedDeliveryDate: j['expectedDeliveryDate'] as String?,
        notes: j['notes'] as String?,
        totalAmount: (j['totalAmount'] as num?)?.toDouble() ?? 0,
        createdBy: j['createdBy'] as String?,
        createdAt: j['createdAt'] as String?,
        lines: (j['lines'] as List<dynamic>?)
                ?.map((e) => PurchaseOrderLine.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [],
      );
}

class PurchaseOrderLineRequest {
  final String itemId;
  final int quantity;
  final double unitPrice;
  final String? notes;

  const PurchaseOrderLineRequest({
    required this.itemId,
    required this.quantity,
    required this.unitPrice,
    this.notes,
  });

  Map<String, dynamic> toJson() => {
        'itemId': itemId,
        'orderedQuantity': quantity,
        'unitPrice': unitPrice,
        if (notes != null) 'notes': notes,
      };
}

class PurchaseOrderRequest {
  final String supplierId;
  final String? expectedDeliveryDate;
  final String? notes;
  final List<PurchaseOrderLineRequest> lines;

  const PurchaseOrderRequest({
    required this.supplierId,
    this.expectedDeliveryDate,
    this.notes,
    required this.lines,
  });

  Map<String, dynamic> toJson() => {
        'supplierId': supplierId,
        if (expectedDeliveryDate != null) 'expectedDeliveryDate': expectedDeliveryDate,
        if (notes != null) 'notes': notes,
        'lines': lines.map((l) => l.toJson()).toList(),
      };
}

class PagedSuppliers {
  final List<Supplier> content;
  final int totalElements;
  final int totalPages;

  const PagedSuppliers({
    required this.content,
    required this.totalElements,
    required this.totalPages,
  });

  factory PagedSuppliers.fromJson(Map<String, dynamic> j) => PagedSuppliers(
        content: (j['content'] as List<dynamic>)
            .map((e) => Supplier.fromJson(e as Map<String, dynamic>))
            .toList(),
        totalElements: (j['totalElements'] as num?)?.toInt() ?? 0,
        totalPages: (j['totalPages'] as num?)?.toInt() ?? 1,
      );
}

class PagedPurchaseOrders {
  final List<PurchaseOrder> content;
  final int totalElements;
  final int totalPages;

  const PagedPurchaseOrders({
    required this.content,
    required this.totalElements,
    required this.totalPages,
  });

  factory PagedPurchaseOrders.fromJson(Map<String, dynamic> j) => PagedPurchaseOrders(
        content: (j['content'] as List<dynamic>)
            .map((e) => PurchaseOrder.fromJson(e as Map<String, dynamic>))
            .toList(),
        totalElements: (j['totalElements'] as num?)?.toInt() ?? 0,
        totalPages: (j['totalPages'] as num?)?.toInt() ?? 1,
      );
}
