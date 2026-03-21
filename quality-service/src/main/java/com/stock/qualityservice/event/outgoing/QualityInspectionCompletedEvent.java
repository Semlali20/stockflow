package com.stock.qualityservice.event.outgoing;

import com.stock.qualityservice.entity.Disposition;
import com.stock.qualityservice.entity.QCType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QualityInspectionCompletedEvent {

    private String eventId;
    private String eventType = "QUALITY_INSPECTION_COMPLETED";
    private LocalDateTime eventTime;

    private String inspectionId;
    private String inspectionNumber;
    private String itemId;
    private String lotId;
    private String serialNumber;
    private Double quantityInspected;
    private QCType inspectionType;
    private Disposition disposition;
    private Double passedQuantity;
    private Double failedQuantity;
    private Boolean requiresQuarantine;
    private String inspectorId;
    private LocalDateTime completedAt;
}