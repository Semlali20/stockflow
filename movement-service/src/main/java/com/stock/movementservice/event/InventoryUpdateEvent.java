package com.stock.movementservice.event;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class InventoryUpdateEvent extends BaseMovementEvent {
    private UUID movementId;
    private UUID warehouseId;
    private String referenceNumber;
    private List<InventoryUpdateLine> lines;

    public InventoryUpdateEvent(UUID movementId, UUID warehouseId, String referenceNumber,
                                List<InventoryUpdateLine> lines, UUID userId) {
        super("INVENTORY_UPDATE", userId);
        this.movementId = movementId;
        this.warehouseId = warehouseId;
        this.referenceNumber = referenceNumber;
        this.lines = lines;
    }

    @Data
    @NoArgsConstructor
    public static class InventoryUpdateLine {
        private UUID itemId;
        private UUID fromLocationId;
        private UUID toLocationId;
        private Double quantity;
        private UUID lotId;
        private UUID serialId;
        private String operation; // ADD, SUBTRACT, TRANSFER

        public InventoryUpdateLine(UUID itemId, UUID fromLocationId, UUID toLocationId,
                                   Double quantity, UUID lotId, UUID serialId, String operation) {
            this.itemId = itemId;
            this.fromLocationId = fromLocationId;
            this.toLocationId = toLocationId;
            this.quantity = quantity;
            this.lotId = lotId;
            this.serialId = serialId;
            this.operation = operation;
        }
    }
}
