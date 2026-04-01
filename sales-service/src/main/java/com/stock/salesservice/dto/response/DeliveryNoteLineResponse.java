package com.stock.salesservice.dto.response;

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
public class DeliveryNoteLineResponse {

    private UUID id;
    private String itemId;
    private String itemName;
    private String itemSku;
    private Integer orderedQuantity;
    private Integer deliveredQuantity;
    private String lotId;
    private String serialId;
    private BigDecimal unitPrice;
    private BigDecimal discountPercent;
    private BigDecimal totalPrice;
    private String notes;
}
