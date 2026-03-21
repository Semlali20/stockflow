package com.stock.inventoryservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockLevelCreateRequest {
    @NotBlank(message = "Item variant ID is required")
    private String itemVariantId;

    @NotBlank(message = "Warehouse ID is required")
    private String warehouseId;

    @NotNull(message = "Minimum stock level is required")
    @PositiveOrZero(message = "Minimum stock level must be zero or positive")
    private BigDecimal minStockLevel;

    @NotNull(message = "Maximum stock level is required")
    @PositiveOrZero(message = "Maximum stock level must be zero or positive")
    private BigDecimal maxStockLevel;

    @NotNull(message = "Reorder point is required")
    @PositiveOrZero(message = "Reorder point must be zero or positive")
    private BigDecimal reorderPoint;

    @NotNull(message = "Reorder quantity is required")
    @PositiveOrZero(message = "Reorder quantity must be zero or positive")
    private BigDecimal reorderQuantity;

    private Boolean alertEnabled = true;
}
