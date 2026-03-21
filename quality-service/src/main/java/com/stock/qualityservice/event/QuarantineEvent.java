package com.stock.qualityservice.event;

import com.stock.qualityservice.entity.Disposition;
import com.stock.qualityservice.entity.QuarantineStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuarantineEvent {

    private String eventId;
    private String eventType; // QUARANTINE_CREATED, QUARANTINE_RELEASED, QUARANTINE_REJECTED
    private LocalDateTime eventTime;

    private String quarantineId;
    private String itemId;
    private String lotId;
    private String serialNumber;
    private Double quantity;
    private String locationId;
    private QuarantineStatus status;
    private String reason;
    private Disposition disposition;
    private String inspectorId;
    private String severity;
    private LocalDateTime entryDate;
    private LocalDateTime releaseDate;
    private String releaseNotes;
}