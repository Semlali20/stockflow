package com.stock.qualityservice.event.outgoing;

import com.stock.qualityservice.entity.Disposition;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuarantineReleasedEvent {

    private String eventId;
    private String eventType = "QUARANTINE_RELEASED";
    private LocalDateTime eventTime;

    private String quarantineId;
    private String itemId;
    private String lotId;
    private String serialNumber;
    private Double quantity;
    private String fromLocationId; // Quarantine location
    private String toLocationId; // Release destination
    private Disposition disposition;
    private String releaseNotes;
    private String releasedBy;
    private LocalDateTime releaseDate;
}