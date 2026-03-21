package com.stock.qualityservice.event.incoming;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovementReceivedEvent {

    private String eventId;
    private String eventType; // RECEIPT_COMPLETED
    private LocalDateTime eventTime;

    private String movementId;
    private String itemId;
    private String lotId;
    private String serialNumber;
    private Double quantity;
    private String locationId;
    private String warehouseId;
    private String supplierId;
    private String purchaseOrderNumber;
    private LocalDateTime receivedDate;
}