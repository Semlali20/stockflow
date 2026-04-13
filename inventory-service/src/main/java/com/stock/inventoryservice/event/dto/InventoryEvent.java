package com.stock.inventoryservice.event.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InventoryEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    private String inventoryId;
    private String itemId;
    private String warehouseId;
    private String locationId;
    private String lotId;
    private String serialId;

    // Quantities
    private Double quantityOnHand;
    private Double quantityReserved;
    private Double quantityDamaged;
    private Double availableQuantity;
    private Double previousQuantity;  // ✅ ADD THIS

    // ✅ ADD THESE THRESHOLD FIELDS:
    private Double minThreshold;
    private Double maxThreshold;
    private Boolean thresholdViolated;
    private String violationType;
    private String status;  // ✅ ADD THIS

    // Event metadata
    private String eventType;
    private String reason;
    private String userId;
    private LocalDateTime timestamp;
}