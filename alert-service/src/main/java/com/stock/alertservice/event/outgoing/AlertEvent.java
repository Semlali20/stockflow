package com.stock.alertservice.event.outgoing;

import com.stock.alertservice.enums.AlertLevel;
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
public class AlertEvent {
    private String alertId;
    private AlertType type;
    private AlertLevel level;
    private String entityType;
    private String entityId;
    private String message;
    private Map<String, Object> data;
    private LocalDateTime timestamp;
    private String eventType;
}
