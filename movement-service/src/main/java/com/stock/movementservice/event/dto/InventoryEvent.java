package com.stock.movementservice.event.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryEvent {
    private String inventoryId;
    private String itemId;
    private String locationId;
    private String warehouseId;
    private Double quantityOnHand;
    private Double availableQuantity;
    private Double reservedQuantity;
    private String status; // AVAILABLE, RESERVED, BLOCKED, QUARANTINED
    private String eventType; // CREATED, UPDATED, RESERVED, RELEASED
    private LocalDateTime timestamp;
}