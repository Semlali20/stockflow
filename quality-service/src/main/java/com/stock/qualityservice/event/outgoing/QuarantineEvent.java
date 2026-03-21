package com.stock.qualityservice.event.outgoing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 🚫 Quarantine Event
 * Published when items are quarantined, released, or rejected
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuarantineEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    // Event metadata
    private UUID eventId;
    private String eventType; // QUARANTINE_CREATED, QUARANTINE_RELEASED, QUARANTINE_REJECTED
    private LocalDateTime eventTime;

    // Quarantine details
    private UUID quarantineId;
    private String quarantineNumber;
    private UUID itemId;
    private UUID lotId;
    private String serialNumber;
    private Double quantity;

    // Location and reason
    private UUID locationId; // Quarantine location
    private String reason;
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL
    private String status; // PENDING, QUARANTINED, RELEASED, REJECTED

    // Related data
    private UUID relatedInspectionId; // Link to failed inspection
    private String notes;
}
