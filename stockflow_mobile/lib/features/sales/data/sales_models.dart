class Customer {
  final String id;
  final String name;
  final String? email;
  final String? phone;
  final String? address;
  final String? contactPerson;
  final int paymentTermsDays;
  final String status;
  final String? notes;

  const Customer({
    required this.id,
    required this.name,
    this.email,
    this.phone,
    this.address,
    this.contactPerson,
    this.paymentTermsDays = 30,
    required this.status,
    this.notes,
  });

  factory Customer.fromJson(Map<String, dynamic> j) => Customer(
        id: j['id'] as String,
        name: j['name'] as String,
        email: j['email'] as String?,
        phone: j['phone'] as String?,
        address: j['address'] as String?,
        contactPerson: j['contactPerson'] as String?,
        paymentTermsDays: (j['paymentTermsDays'] as num?)?.toInt() ?? 30,
        status: j['status'] as String? ?? 'ACTIVE',
        notes: j['notes'] as String?,
      );

  String get initials {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    return name.substring(0, name.length >= 2 ? 2 : 1).toUpperCase();
  }
}

class CustomerRequest {
  final String name;
  final String? email;
  final String? phone;
  final String? address;
  final String? contactPerson;
  final int? paymentTermsDays;
  final String? notes;

  const CustomerRequest({
    required this.name,
    this.email,
    this.phone,
    this.address,
    this.contactPerson,
    this.paymentTermsDays,
    this.notes,
  });

  Map<String, dynamic> toJson() => {
        'name': name,
        if (email != null) 'email': email,
        if (phone != null) 'phone': phone,
        if (address != null) 'address': address,
        if (contactPerson != null) 'contactPerson': contactPerson,
        if (paymentTermsDays != null) 'paymentTermsDays': paymentTermsDays,
        if (notes != null) 'notes': notes,
      };
}

class QuoteLine {
  final String id;
  final String itemId;
  final String? itemName;
  final String? itemSku;
  final int quantity;
  final double unitPrice;
  final double discountPercent;
  final double totalPrice;
  final String? notes;

  const QuoteLine({
    required this.id,
    required this.itemId,
    this.itemName,
    this.itemSku,
    required this.quantity,
    required this.unitPrice,
    this.discountPercent = 0,
    required this.totalPrice,
    this.notes,
  });

  factory QuoteLine.fromJson(Map<String, dynamic> j) => QuoteLine(
        id: j['id'] as String,
        itemId: j['itemId'] as String,
        itemName: j['itemName'] as String?,
        itemSku: j['itemSku'] as String?,
        quantity: (j['quantity'] as num).toInt(),
        unitPrice: (j['unitPrice'] as num).toDouble(),
        discountPercent: (j['discountPercent'] as num?)?.toDouble() ?? 0,
        totalPrice: (j['totalPrice'] as num).toDouble(),
        notes: j['notes'] as String?,
      );
}

class Quote {
  final String id;
  final String reference;
  final String customerId;
  final String? customerName;
  final String status;
  final String? validUntil;
  final String? notes;
  final double discountPercent;
  final double subtotal;
  final double totalAmount;
  final String? createdBy;
  final String? createdAt;
  final List<QuoteLine> lines;

  const Quote({
    required this.id,
    required this.reference,
    required this.customerId,
    this.customerName,
    required this.status,
    this.validUntil,
    this.notes,
    this.discountPercent = 0,
    required this.subtotal,
    required this.totalAmount,
    this.createdBy,
    this.createdAt,
    this.lines = const [],
  });

  factory Quote.fromJson(Map<String, dynamic> j) => Quote(
        id: j['id'] as String,
        reference: j['reference'] as String,
        customerId: j['customerId'] as String,
        customerName: j['customerName'] as String?,
        status: j['status'] as String? ?? 'DRAFT',
        validUntil: j['validUntil'] as String?,
        notes: j['notes'] as String?,
        discountPercent: (j['discountPercent'] as num?)?.toDouble() ?? 0,
        subtotal: (j['subtotal'] as num?)?.toDouble() ?? 0,
        totalAmount: (j['totalAmount'] as num?)?.toDouble() ?? 0,
        createdBy: j['createdBy'] as String?,
        createdAt: j['createdAt'] as String?,
        lines: (j['lines'] as List<dynamic>?)
                ?.map((e) => QuoteLine.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [],
      );
}

class DeliveryNoteLine {
  final String id;
  final String itemId;
  final String? itemName;
  final String? itemSku;
  final int quantity;
  final double unitPrice;
  final double totalPrice;

  const DeliveryNoteLine({
    required this.id,
    required this.itemId,
    this.itemName,
    this.itemSku,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
  });

  factory DeliveryNoteLine.fromJson(Map<String, dynamic> j) => DeliveryNoteLine(
        id: j['id'] as String,
        itemId: j['itemId'] as String,
        itemName: j['itemName'] as String?,
        itemSku: j['itemSku'] as String?,
        quantity: (j['quantity'] as num).toInt(),
        unitPrice: (j['unitPrice'] as num?)?.toDouble() ?? 0,
        totalPrice: (j['totalPrice'] as num?)?.toDouble() ?? 0,
      );
}

class DeliveryNote {
  final String id;
  final String reference;
  final String? quoteId;
  final String customerId;
  final String? customerName;
  final String status;
  final String? deliveryDate;
  final String? deliveryAddress;
  final String? notes;
  final double totalAmount;
  final String? createdAt;
  final List<DeliveryNoteLine> lines;

  const DeliveryNote({
    required this.id,
    required this.reference,
    this.quoteId,
    required this.customerId,
    this.customerName,
    required this.status,
    this.deliveryDate,
    this.deliveryAddress,
    this.notes,
    required this.totalAmount,
    this.createdAt,
    this.lines = const [],
  });

  factory DeliveryNote.fromJson(Map<String, dynamic> j) => DeliveryNote(
        id: j['id'] as String,
        reference: j['reference'] as String,
        quoteId: j['quoteId'] as String?,
        customerId: j['customerId'] as String,
        customerName: j['customerName'] as String?,
        status: j['status'] as String? ?? 'PENDING',
        deliveryDate: j['deliveryDate'] as String?,
        deliveryAddress: j['deliveryAddress'] as String?,
        notes: j['notes'] as String?,
        totalAmount: (j['totalAmount'] as num?)?.toDouble() ?? 0,
        createdAt: j['createdAt'] as String?,
        lines: (j['lines'] as List<dynamic>?)
                ?.map((e) => DeliveryNoteLine.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [],
      );
}

class QuoteLineRequest {
  final String itemId;
  final int quantity;
  final double unitPrice;
  final double? discountPercent;
  final String? notes;

  const QuoteLineRequest({
    required this.itemId,
    required this.quantity,
    required this.unitPrice,
    this.discountPercent,
    this.notes,
  });

  Map<String, dynamic> toJson() => {
        'itemId': itemId,
        'quantity': quantity,
        'unitPrice': unitPrice,
        if (discountPercent != null) 'discountPercent': discountPercent,
        if (notes != null) 'notes': notes,
      };
}

class QuoteRequest {
  final String customerId;
  final String? validUntil;
  final String? notes;
  final double? discountPercent;
  final List<QuoteLineRequest> lines;

  const QuoteRequest({
    required this.customerId,
    this.validUntil,
    this.notes,
    this.discountPercent,
    required this.lines,
  });

  Map<String, dynamic> toJson() => {
        'customerId': customerId,
        if (validUntil != null) 'validUntil': validUntil,
        if (notes != null) 'notes': notes,
        if (discountPercent != null) 'discountPercent': discountPercent,
        'lines': lines.map((l) => l.toJson()).toList(),
      };
}

class PagedCustomers {
  final List<Customer> content;
  final int totalElements;

  const PagedCustomers({required this.content, required this.totalElements});

  factory PagedCustomers.fromJson(Map<String, dynamic> j) => PagedCustomers(
        content: (j['content'] as List<dynamic>)
            .map((e) => Customer.fromJson(e as Map<String, dynamic>))
            .toList(),
        totalElements: (j['totalElements'] as num?)?.toInt() ?? 0,
      );
}

class PagedQuotes {
  final List<Quote> content;
  final int totalElements;

  const PagedQuotes({required this.content, required this.totalElements});

  factory PagedQuotes.fromJson(Map<String, dynamic> j) => PagedQuotes(
        content: (j['content'] as List<dynamic>)
            .map((e) => Quote.fromJson(e as Map<String, dynamic>))
            .toList(),
        totalElements: (j['totalElements'] as num?)?.toInt() ?? 0,
      );
}

class PagedDeliveryNotes {
  final List<DeliveryNote> content;
  final int totalElements;

  const PagedDeliveryNotes({required this.content, required this.totalElements});

  factory PagedDeliveryNotes.fromJson(Map<String, dynamic> j) => PagedDeliveryNotes(
        content: (j['content'] as List<dynamic>)
            .map((e) => DeliveryNote.fromJson(e as Map<String, dynamic>))
            .toList(),
        totalElements: (j['totalElements'] as num?)?.toInt() ?? 0,
      );
}
