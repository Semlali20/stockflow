package com.stock.qualityservice.dto.request;

import com.stock.qualityservice.entity.SamplingType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SamplingPlanRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotNull(message = "Sampling type is required")
    private SamplingType samplingType;

    private String inspectionLevel; // I, II, III

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

    private Boolean isActive = true;

    private Boolean isDefault = false;
}