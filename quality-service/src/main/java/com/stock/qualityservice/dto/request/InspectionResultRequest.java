package com.stock.qualityservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InspectionResultRequest {

    @NotBlank(message = "Quality control ID is required")
    private String qualityControlId;

    @NotBlank(message = "Test parameter is required")
    private String testParameter;

    private String expectedValue;

    private String actualValue;

    private String unitOfMeasure;

    private Double minValue;

    private Double maxValue;

    @NotNull(message = "Pass/fail status is required")
    private Boolean isPassed;

    private String defectType;

    private String defectSeverity; // CRITICAL, MAJOR, MINOR

    private String remarks;

    private Integer sequenceOrder;
}