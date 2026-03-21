package com.stock.qualityservice.event.outgoing;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QualityMetricsEvent {

    private String eventId;
    private String eventType = "QUALITY_METRICS";
    private LocalDateTime eventTime;

    private String periodType; // DAILY, WEEKLY, MONTHLY
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private Long totalInspections;
    private Long passedInspections;
    private Long failedInspections;
    private Double passRate;
    private Double averageDefectRate;
    private Long totalQuarantined;
    private String itemId; // Optional, for item-specific metrics
    private String categoryId; // Optional, for category-specific metrics
}