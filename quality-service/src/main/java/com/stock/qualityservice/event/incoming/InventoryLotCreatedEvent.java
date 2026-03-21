package com.stock.qualityservice.event.incoming;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryLotCreatedEvent {

    private String eventId;
    private String eventType; // LOT_CREATED
    private LocalDateTime eventTime;

    private String lotId;
    private String lotNumber;
    private String itemId;
    private Double quantity;
    private LocalDate manufactureDate;
    private LocalDate expiryDate;
    private String status; // ACTIVE, QUARANTINED, EXPIRED
    private String locationId;
}