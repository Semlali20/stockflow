package com.stock.inventoryservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryUpdatedEvent {
    private String inventoryId;
    private String itemId;
    private String locationId;
    private BigDecimal oldQuantity;
    private BigDecimal newQuantity;
    private BigDecimal quantityChange;
    private String movementType;
    private String reason;
    private LocalDateTime timestamp;
}