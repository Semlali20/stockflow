package com.stock.inventoryservice.event.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovementCompletedEvent implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    // Movement Header
    private UUID movementId;
    private String movementType; // INBOUND, OUTBOUND, TRANSFER, ADJUSTMENT
    private UUID warehouseId;
    private UUID sourceLocationId;
    private UUID destinationLocationId;
    private String referenceNumber;
    private LocalDateTime completedAt;
    private UUID completedBy;
    
    // Movement Lines (Products)
    private List<MovementLineDTO> lines;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MovementLineDTO {
        private UUID lineId;
        private UUID itemId;
        private Double requestedQuantity;
        private Double actualQuantity;
        private String uom;
        private UUID lotId;
        private UUID serialId;
        private UUID fromLocationId;
        private UUID toLocationId;
    }
}