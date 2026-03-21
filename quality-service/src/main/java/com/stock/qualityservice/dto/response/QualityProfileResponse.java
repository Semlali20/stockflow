package com.stock.qualityservice.dto.response;

import com.stock.qualityservice.entity.QualityProfileType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QualityProfileResponse {

    private String id;
    private String name;
    private String description;
    private String itemId;
    private String categoryId;
    private QualityProfileType profileType;
    private String inspectionCriteria;
    private Double passThreshold;
    private Double failThreshold;
    private String samplingPlanId;
    private Boolean isActive;
    private Integer version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}