package com.stock.qualityservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Overall Quality Metrics Response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QualityMetricsResponse {

    private Long totalInspections;
    private Long passedInspections;
    private Long failedInspections;
    private Long pendingInspections;
    private Double passRate;
    private Double failRate;

    private Long totalQuarantines;
    private Long activeQuarantines;
    private Long releasedQuarantines;
    private Long rejectedQuarantines;

    private Double averageInspectionDuration; // in hours
    private Double averageDefectRate;
    private Double quarantineRate;

    private Long totalDefects;
    private Long criticalDefects;
    private Long majorDefects;
    private Long minorDefects;
}
