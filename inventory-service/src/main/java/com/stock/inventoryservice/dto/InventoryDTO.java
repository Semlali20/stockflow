// inventory-service/src/main/java/com/stock/inventoryservice/dto/InventoryDTO.java
package com.stock.inventoryservice.dto;

import com.stock.inventoryservice.entity.InventoryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryDTO {

    private String id;
    private String itemId;
    private String warehouseId;
    private String locationId;
    private String lotId;
    private String serialId;

    // Quantities
    private Double quantityOnHand;
    private Double quantityReserved;
    private Double quantityDamaged;
    private Double availableQuantity; // Calculated: onHand - reserved
    private String uom;

    // Status & Metadata
    private InventoryStatus status;
    private BigDecimal unitCost;
    private LocalDate expiryDate;
    private LocalDate manufactureDate;
    private LocalDate lastCountDate;
    private String attributes; // JSON string

    // Audit
    private Long version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
