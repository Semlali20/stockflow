package com.stock.qualityservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SampleSizeCalculationResponse {

    private Integer lotSize;
    private Integer sampleSize;
    private Integer acceptNumber;
    private Integer rejectNumber;
    private String samplingType;
    private String inspectionLevel;
    private Double aqlPercentage;
    private String samplingPlanId;
    private String samplingPlanName;
}