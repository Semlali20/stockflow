package com.stock.alertservice.dto.response;

import com.stock.alertservice.enums.AlertLevel;
import com.stock.alertservice.enums.AlertStatus;
import com.stock.alertservice.enums.AlertType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertResponse {

    private String id;
    private AlertType type;
    private AlertLevel level;
    private String entityType;
    private String entityId;
    private String message;
    private AlertStatus status;
    private Map<String, Object> data;

    private String acknowledgedBy;
    private UserSummaryDTO acknowledgedByUser;
    private String resolvedBy;
    private UserSummaryDTO resolvedByUser;
    private Boolean acknowledged;
    private Boolean resolved;
    private LocalDateTime respondedAt;
    private LocalDateTime resolvedAt;

    private Integer escalationLevel;
    private Integer recurringDailyCount;
    private LocalDateTime lastRecurrenceAt;

    private RuleSummaryDTO rule;
    private Integer notificationsSent;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
