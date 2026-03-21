package com.stock.alertservice.dto.response;

import com.stock.alertservice.enums.NotificationChannelType;
import com.stock.alertservice.enums.NotificationStatus;
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
public class NotificationResponse {

    private String id;
    private NotificationChannelType channelType;
    private String recipient;
    private String subject;
    private String body;
    private NotificationStatus status;
    private LocalDateTime sentAt;
    private LocalDateTime deliveredAt;
    private Integer retryCount;
    private String errorMessage;
    private Map<String, Object> metadata;

    private String alertId;
    private String templateId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
