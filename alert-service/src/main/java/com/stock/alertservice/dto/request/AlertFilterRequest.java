package com.stock.alertservice.dto.request;

import com.stock.alertservice.enums.AlertLevel;
import com.stock.alertservice.enums.AlertStatus;
import com.stock.alertservice.enums.AlertType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertFilterRequest {
    private AlertType type;
    private AlertLevel level;
    private AlertStatus status;
    private String entityType;
    private String entityId;
    private Boolean acknowledged;
    private Boolean resolved;
    private LocalDateTime createdAfter;
    private LocalDateTime createdBefore;
    private Integer minEscalationLevel;
}
