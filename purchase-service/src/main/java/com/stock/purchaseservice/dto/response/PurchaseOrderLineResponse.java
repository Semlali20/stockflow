package com.stock.purchaseservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderLineResponse {

    private UUID id;
    private String itemId;
    private String itemName;
    private String itemSku;
    private Integer orderedQuantity;
    private Integer receivedQuantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String notes;

    // Computed fields
    private Integer remainingQuantity;
    private Boolean fullyReceived;
}
