package com.stock.movementservice.event.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QualityInspectionEvent {
    private String inspectionId;
    private String itemId;
    private String lotId;
    private String locationId;
    private String result; // APPROVED, REJECTED, PENDING
    private String status; // CREATED, IN_PROGRESS, COMPLETED, FAILED
    private Double defectQuantity;
    private String defectType;
    private String eventType; // inspection.completed, quarantine.created, etc.
    private LocalDateTime timestamp;
}