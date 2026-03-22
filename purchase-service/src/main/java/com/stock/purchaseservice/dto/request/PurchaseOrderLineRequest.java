package com.stock.purchaseservice.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderLineRequest {

    @NotBlank(message = "Item ID is required")
    private String itemId;

    @NotBlank(message = "Item name is required")
    @Size(max = 255, message = "Item name must not exceed 255 characters")
    private String itemName;

    @Size(max = 100, message = "Item SKU must not exceed 100 characters")
    private String itemSku;

    @NotNull(message = "Ordered quantity is required")
    @Min(value = 1, message = "Ordered quantity must be at least 1")
    private Integer orderedQuantity;

    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Unit price must be greater than 0")
    @Digits(integer = 17, fraction = 2, message = "Unit price must have at most 17 integer digits and 2 decimal digits")
    private BigDecimal unitPrice;

    private String notes;
}
