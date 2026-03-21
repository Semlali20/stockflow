package com.stock.qualityservice.event.outgoing;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuarantineCreatedEvent {

    private String eventId;
    private String eventType = "QUARANTINE_CREATED";
    private LocalDateTime eventTime;

    private String quarantineId;
    private String itemId;
    private String lotId;
    private String serialNumber;
    private Double quantity;
    private String fromLocationId;
    private String toLocationId; // Quarantine location
    private String reason;
    private String severity;
    private LocalDateTime entryDate;
}