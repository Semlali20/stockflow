package com.stock.movementservice.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class MovementCompletedEvent extends BaseMovementEvent {
    
    private UUID movementId;
    private String movementType; // INBOUND, OUTBOUND, TRANSFER, ADJUSTMENT
    private UUID warehouseId;
    private UUID sourceLocationId;
    private UUID destinationLocationId;
    private String referenceNumber;
    private LocalDateTime completedAt;
    private Integer totalLines;
    private Integer completedLines;
    
    // 🔥 ADD THIS - Movement lines with product details
    private List<MovementLineData> lines;

    public MovementCompletedEvent(UUID movementId, String movementType, UUID warehouseId,
                                 UUID sourceLocationId, UUID destinationLocationId,
                                 String referenceNumber, LocalDateTime completedAt,
                                 Integer totalLines, Integer completedLines, 
                                 List<MovementLineData> lines, UUID userId) {
        super("MOVEMENT_COMPLETED", userId);
        this.movementId = movementId;
        this.movementType = movementType;
        this.warehouseId = warehouseId;
        this.sourceLocationId = sourceLocationId;
        this.destinationLocationId = destinationLocationId;
        this.referenceNumber = referenceNumber;
        this.completedAt = completedAt;
        this.totalLines = totalLines;
        this.completedLines = completedLines;
        this.lines = lines;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MovementLineData {
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