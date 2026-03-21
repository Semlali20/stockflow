package com.stock.movementservice.event;

import com.stock.movementservice.entity.enums.MovementType;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class MovementCancelledEvent extends BaseMovementEvent {
    private UUID movementId;
    private MovementType movementType;
    private UUID warehouseId;
    private String referenceNumber;
    private String cancellationReason;

    public MovementCancelledEvent(UUID movementId, MovementType movementType, UUID warehouseId,
                                  String referenceNumber, String cancellationReason, UUID userId) {
        super("MOVEMENT_CANCELLED", userId);
        this.movementId = movementId;
        this.movementType = movementType;
        this.warehouseId = warehouseId;
        this.referenceNumber = referenceNumber;
        this.cancellationReason = cancellationReason;
    }
}
