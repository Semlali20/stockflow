package com.stock.qualityservice.dto.request;

import com.stock.qualityservice.entity.Disposition;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InspectionCompleteRequest {

    @NotNull(message = "Disposition is required")
    private Disposition disposition;

    private Double passedQuantity;

    private Double failedQuantity;

    private String inspectorNotes;

    private String correctiveAction;

    private List<InspectionResultRequest> inspectionResults;
}