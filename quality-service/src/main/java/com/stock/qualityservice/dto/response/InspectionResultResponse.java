package com.stock.qualityservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InspectionResultResponse {

    private String id;
    private String qualityControlId;
    private String testParameter;
    private String expectedValue;
    private String actualValue;
    private String unitOfMeasure;
    private Double minValue;
    private Double maxValue;
    private Boolean isPassed;
    private String defectType;
    private String defectSeverity;
    private String remarks;
    private Integer sequenceOrder;
    private LocalDateTime createdAt;
}