package com.stock.qualityservice.event.outgoing;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QualityAlertEvent {

    private String eventId;
    private String eventType = "QUALITY_ALERT";
    private LocalDateTime eventTime;

    private String alertType; // INSPECTION_FAILED, QUARANTINE_OVERDUE, HIGH_DEFECT_RATE
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL
    private String itemId;
    private String lotId;
    private String inspectionId;
    private String quarantineId;
    private String message;
    private String description;
    private String assignedTo;
    private Boolean requiresAction;
}