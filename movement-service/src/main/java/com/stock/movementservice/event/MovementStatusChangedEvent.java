package com.stock.movementservice.event;

import com.stock.movementservice.entity.enums.MovementStatus;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class MovementStatusChangedEvent extends BaseMovementEvent {
    private UUID movementId;
    private MovementStatus oldStatus;
    private MovementStatus newStatus;
    private UUID warehouseId;
    private String referenceNumber;
    private String reason;

    public MovementStatusChangedEvent(UUID movementId, MovementStatus oldStatus, MovementStatus newStatus,
                                      UUID warehouseId, String referenceNumber, String reason, UUID userId) {
        super("MOVEMENT_STATUS_CHANGED", userId);
        this.movementId = movementId;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
        this.warehouseId = warehouseId;
        this.referenceNumber = referenceNumber;
        this.reason = reason;
    }
}
