package com.stock.qualityservice.dto.response;

import com.stock.qualityservice.entity.SamplingType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SamplingPlanResponse {

    private String id;
    private String name;
    private String description;
    private SamplingType samplingType;
    private String inspectionLevel;
    private Double aqlPercentage;
    private Integer lotSizeMin;
    private Integer lotSizeMax;
    private Integer sampleSize;
    private Double samplePercentage;
    private Integer acceptNumber;
    private Integer rejectNumber;
    private Integer secondSampleSize;
    private Integer secondAcceptNumber;
    private Integer secondRejectNumber;
    private Boolean isActive;
    private Boolean isDefault;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}