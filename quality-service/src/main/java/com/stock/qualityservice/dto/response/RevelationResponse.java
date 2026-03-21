package com.stock.qualityservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for Revelation (Quality Testing Standard)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevelationResponse {

    private String id;
    private String name;
    private String description;
    private String qualityProfileId;
    private String testType;
    private String testParameter;
    private Double acceptableMin;
    private Double acceptableMax;
    private String unit;
    private Boolean isMandatory;
    private String testInstructions;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}
