package com.stock.alertservice.event.incoming;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    private String lotId;
    private String serialId;
    
    // THIS IS THE CRITICAL FIX - Map quantityOnHand to quantity
    @JsonProperty("quantityOnHand")
    private Double quantity;
    
    @JsonProperty("quantityOnHand")
    private Double quantityOnHand;
    
    private Double quantityReserved;
    private Double quantityDamaged;
    private Double availableQuantity;
    private Double previousQuantity;
    
    private Double minThreshold;
    private Double maxThreshold;
    
    private String status;
    private String eventType;
    private String reason;
    private String userId;
    private LocalDateTime timestamp;
    private Boolean thresholdViolated;
    private String violationType;
}