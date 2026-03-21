package com.stock.alertservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertStatisticsResponse {

    private Long totalAlerts;
    private Long activeAlerts;
    private Long acknowledgedAlerts;
    private Long resolvedAlerts;
    private Long escalatedAlerts;

    private Map<String, Long> alertsByType;
    private Map<String, Long> alertsByLevel;
    private Map<String, Long> alertsByStatus;

    private Double averageAcknowledgmentTimeMinutes;
    private Double averageResolutionTimeMinutes;

    private Long alertsLast24Hours;
    private Long alertsLast7Days;
    private Long alertsLast30Days;

    private Map<String, Long> topAlertedEntities;
}
