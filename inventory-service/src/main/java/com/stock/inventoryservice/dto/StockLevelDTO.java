package com.stock.inventoryservice.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockLevelDTO {
    private String id;
    private String itemVariantId;
    private String itemName;
    private String variantName;
    private String warehouseId;
    private String warehouseName;
    private BigDecimal minStockLevel;
    private BigDecimal maxStockLevel;
    private BigDecimal reorderPoint;
    private BigDecimal reorderQuantity;
    private BigDecimal currentStock;
    private String status; // NORMAL, LOW_STOCK, OUT_OF_STOCK, OVERSTOCK
    private Boolean alertEnabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}