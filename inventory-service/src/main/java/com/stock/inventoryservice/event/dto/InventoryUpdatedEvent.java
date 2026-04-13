
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
public class InventoryUpdatedEvent implements Serializable {

    private String inventoryId;
    private String itemId;
    private String locationId;
    private String warehouseId;
    private Double previousQuantity;
    private Double newQuantity;
    private Double quantityReserved;
    private Double availableQuantity;
    private String eventType; // CREATED, UPDATED, ADJUSTED, RESERVED, RELEASED
    private String userId;
    private LocalDateTime timestamp;
}
