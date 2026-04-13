package com.stock.inventoryservice.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventorySummaryDTO {
    private String itemVariantId;
    private String itemName;
    private String variantName;
    private BigDecimal totalQuantityOnHand;
    private BigDecimal totalQuantityReserved;
    private BigDecimal totalQuantityAvailable;
    private BigDecimal totalQuantityInTransit;
    private Integer locationCount;
    private Integer warehouseCount;
}