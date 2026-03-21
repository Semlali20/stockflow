package com.stock.qualityservice.dto.request;

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
public class QualityControlFilterRequest {

    private String itemId;
    private String lotId;
    private QCType inspectionType;
    private QCStatus status;
    private Disposition disposition;
    private String inspectorId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String inspectionLocationId;
}