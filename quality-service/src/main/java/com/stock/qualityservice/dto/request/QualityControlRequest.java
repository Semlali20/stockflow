package com.stock.qualityservice.dto.request;

import com.stock.qualityservice.entity.QCType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QualityControlRequest {

    @NotBlank(message = "Item ID is required")
    private String itemId;

    private String lotId;

    private String serialNumber;

    @NotNull(message = "Quantity inspected is required")
    @Positive(message = "Quantity must be positive")
    private Double quantityInspected;

    @NotNull(message = "Inspection type is required")
    private QCType inspectionType;

    private String qualityProfileId;

    private String samplingPlanId;

    @NotBlank(message = "Inspector ID is required")
    private String inspectorId;

    private String inspectionLocationId;

    private LocalDateTime scheduledDate;

    private String quarantineId;

    private List<InspectionResultRequest> inspectionResults;
}