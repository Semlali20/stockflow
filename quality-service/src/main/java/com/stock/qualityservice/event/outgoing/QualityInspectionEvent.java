package com.stock.qualityservice.event.outgoing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 🔍 Quality Inspection Event
 * Published when inspections are created, completed, or failed
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QualityInspectionEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    // Event metadata
    private UUID eventId;
    private String eventType; // INSPECTION_CREATED, INSPECTION_COMPLETED, INSPECTION_FAILED
    private LocalDateTime eventTime;

    // Inspection details
    private UUID inspectionId;
    private String inspectionNumber;
    private UUID itemId;
    private UUID lotId;
    private String serialNumber;
    private Double quantityInspected;

    // Result details
    private String result; // APPROVED, REJECTED, CONDITIONAL_ACCEPT
    private String status; // PENDING, IN_PROGRESS, PASSED, FAILED, CANCELLED
    private UUID inspectorId;
    private String disposition; // ACCEPT, REJECT, CONDITIONAL_ACCEPT, REWORK, SCRAP

    // Defect information
    private Integer defectCount;
    private String defectType; // DIMENSIONAL, VISUAL, FUNCTIONAL, etc.
    private String notes;
}
