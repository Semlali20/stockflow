package com.stock.qualityservice.event;

import com.stock.qualityservice.entity.SamplingType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SamplingPlanEvent {

    private String eventId;
    private String eventType; // SAMPLING_PLAN_CREATED, SAMPLING_PLAN_UPDATED, SAMPLING_PLAN_DELETED
    private LocalDateTime eventTime;

    private String samplingPlanId;
    private String name;
    private SamplingType samplingType;
    private String inspectionLevel;
    private Double aqlPercentage;
    private Integer sampleSize;
    private Boolean isActive;
    private Boolean isDefault;
}