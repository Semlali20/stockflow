package com.stock.qualityservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating/updating Revelation (Quality Testing Standard)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevelationRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotBlank(message = "Quality Profile ID is required")
    private String qualityProfileId;

    @NotBlank(message = "Test type is required")
    private String testType; // VISUAL, DIMENSIONAL, FUNCTIONAL, PERFORMANCE, CHEMICAL, MICROBIOLOGICAL

    @NotBlank(message = "Test parameter is required")
    private String testParameter;

    private Double acceptableMin;

    private Double acceptableMax;

    private String unit;

    private Boolean isMandatory;

    private String testInstructions;

    private Boolean isActive;
}
