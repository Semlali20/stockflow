package com.stock.qualityservice.service;

import com.stock.qualityservice.dto.response.QualityMetricsResponse;
import com.stock.qualityservice.dto.response.InspectionMetricsResponse;
import com.stock.qualityservice.dto.response.QuarantineMetricsResponse;

import java.time.LocalDateTime;

/**
 * Quality Metrics Service
 * Provides analytics and metrics for quality operations
 */
public interface QualityMetricsService {

    /**
     * Get overall quality metrics
     */
    QualityMetricsResponse getOverallMetrics();

    /**
     * Get quality metrics for a date range
     */
    QualityMetricsResponse getMetricsForDateRange(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Get inspection metrics
     */
    InspectionMetricsResponse getInspectionMetrics(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Get quarantine metrics
     */
    QuarantineMetricsResponse getQuarantineMetrics(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Get defect rate by item
     */
    Double getDefectRateByItem(String itemId, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Get pass rate by inspector
     */
    Double getPassRateByInspector(String inspectorId, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Get average inspection duration
     */
    Double getAverageInspectionDuration(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Get quarantine rate
     */
    Double getQuarantineRate(LocalDateTime startDate, LocalDateTime endDate);
}
