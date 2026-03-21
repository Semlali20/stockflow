package com.stock.qualityservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Quarantine Metrics Response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuarantineMetricsResponse {

    private Long totalQuarantines;
    private Long activeQuarantines;
    private Long releasedQuarantines;
    private Long rejectedQuarantines;
    private Long expiringSoonQuarantines;

    private Double releaseRate;
    private Double rejectionRate;
    private Double averageDuration; // in days

    // Quarantines by severity
    private Map<String, Long> quarantinesBySeverity;

    // Quarantines by reason
    private Map<String, Long> quarantinesByReason;

    // Quarantines by location
    private Map<String, Long> quarantinesByLocation;

    // Top quarantined items
    private Map<String, Long> topQuarantinedItems;
}
