package com.stock.qualityservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuarantineRequest {

    @NotBlank(message = "Item ID is required")
    private String itemId;

    private String lotId;

    private String serialNumber;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Double quantity;

    private String locationId;

    @NotBlank(message = "Reason is required")
    private String reason;

    private String inspectorId;

    private String qualityProfileId;

    private LocalDateTime expectedReleaseDate;

    private String severity; // LOW, MEDIUM, HIGH, CRITICAL

    private String quarantineType; // MANUAL, AUTOMATIC, RULE_BASED

    private String notes;

    private String relatedInspectionId;
}