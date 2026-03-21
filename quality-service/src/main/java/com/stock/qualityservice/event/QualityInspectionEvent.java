package com.stock.qualityservice.event;

import com.stock.qualityservice.entity.Disposition;
import com.stock.qualityservice.entity.QCStatus;
import com.stock.qualityservice.entity.QCType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QualityInspectionEvent {

    private String eventId;
    private String eventType; // INSPECTION_CREATED, INSPECTION_STARTED, INSPECTION_COMPLETED
    private LocalDateTime eventTime;

    private String inspectionId;
    private String inspectionNumber;
    private String itemId;
    private String lotId;
    private String serialNumber;
    private Double quantityInspected;
    private QCType inspectionType;
    private QCStatus status;
    private Disposition disposition;
    private Double passedQuantity;
    private Double failedQuantity;
    private Integer defectCount;
    private Double defectRate;
    private String inspectorId;
    private String inspectionLocationId;
    private String qualityProfileId;
    private String quarantineId;
    private LocalDateTime completedAt;
}