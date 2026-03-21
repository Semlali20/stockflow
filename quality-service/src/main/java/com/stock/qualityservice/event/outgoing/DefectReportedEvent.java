package com.stock.qualityservice.event.outgoing;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DefectReportedEvent {

    private String eventId;
    private String eventType = "DEFECT_REPORTED";
    private LocalDateTime eventTime;

    private String inspectionId;
    private String itemId;
    private String lotId;
    private String defectType;
    private String defectSeverity; // CRITICAL, MAJOR, MINOR
    private Integer defectCount;
    private Double defectRate;
    private String description;
    private String reportedBy;
    private LocalDateTime reportedAt;
}