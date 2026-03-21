package com.stock.qualityservice.dto.request;

import com.stock.qualityservice.entity.QCType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkInspectionRequest {

    @NotEmpty(message = "Item IDs cannot be empty")
    private List<String> itemIds;

    @NotNull(message = "Inspection type is required")
    private QCType inspectionType;

    private String qualityProfileId;

    private String samplingPlanId;

    private String inspectorId;

    private String inspectionLocationId;

    private LocalDateTime scheduledDate;
}