package com.stock.movementservice.event;

import com.stock.movementservice.entity.enums.MovementType;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class MovementCreatedEvent extends BaseMovementEvent {
    private UUID movementId;
    private MovementType movementType;
    private UUID warehouseId;
    private UUID sourceLocationId;
    private UUID destinationLocationId;
    private String referenceNumber;
    private Integer totalLines;

    public MovementCreatedEvent(UUID movementId, MovementType movementType, UUID warehouseId,
                                UUID sourceLocationId, UUID destinationLocationId,
                                String referenceNumber, Integer totalLines, UUID userId) {
        super("MOVEMENT_CREATED", userId);
        this.movementId = movementId;
        this.movementType = movementType;
        this.warehouseId = warehouseId;
        this.sourceLocationId = sourceLocationId;
        this.destinationLocationId = destinationLocationId;
        this.referenceNumber = referenceNumber;
        this.totalLines = totalLines;
    }
}
