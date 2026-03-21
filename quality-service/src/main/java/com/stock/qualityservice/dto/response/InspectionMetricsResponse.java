package com.stock.qualityservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Inspection Metrics Response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InspectionMetricsResponse {

    private Long totalInspections;
    private Long passedInspections;
    private Long failedInspections;
    private Long pendingInspections;
    private Long inProgressInspections;

    private Double passRate;
    private Double failRate;
    private Double averageDuration; // in hours

    // Inspections by type
    private Map<String, Long> inspectionsByType;

    // Inspections by status
    private Map<String, Long> inspectionsByStatus;

    // Top defect types
    private Map<String, Long> topDefectTypes;

    // Inspections per inspector
    private Map<String, Long> inspectionsPerInspector;

    // Pass rate per inspector
    private Map<String, Double> passRatePerInspector;
}
