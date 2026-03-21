package com.stock.qualityservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InspectionSummaryResponse {

    private Long totalInspections;
    private Long passedInspections;
    private Long failedInspections;
    private Long pendingInspections;
    private Long quarantinedItems;
    private Double overallPassRate;
    private Double averageDefectRate;
}