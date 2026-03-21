package com.stock.qualityservice.dto.request;

import com.stock.qualityservice.entity.QualityProfileType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QualityProfileRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    private String itemId;

    private String categoryId;

    @NotNull(message = "Profile type is required")
    private QualityProfileType profileType;

    private String inspectionCriteria; // JSON string

    private Double passThreshold;

    private Double failThreshold;

    private String samplingPlanId;

    private Boolean isActive = true;

    private Integer version;
}