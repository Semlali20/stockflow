package com.stock.salesservice.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryNoteLineRequest {

    @NotBlank(message = "Item ID is required")
    private String itemId;

    private String itemName;

    private String itemSku;

    @NotNull(message = "Ordered quantity is required")
    @Min(value = 1, message = "Ordered quantity must be at least 1")
    private Integer orderedQuantity;

    @Builder.Default
    private Integer deliveredQuantity = 0;

    private String lotId;

    private String serialId;

    private BigDecimal unitPrice;

    private BigDecimal discountPercent;

    private BigDecimal totalPrice;

    private String notes;
}
