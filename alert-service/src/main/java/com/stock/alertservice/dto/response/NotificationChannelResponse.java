package com.stock.alertservice.dto.response;

import com.stock.alertservice.enums.NotificationChannelType;
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
public class NotificationChannelResponse {

    private String id;
    private String name;
    private NotificationChannelType channelType;
    private Map<String, Object> settings;
    private Boolean isActive;
    private Integer rateLimitPerHour;
    private Integer priority;

    private Long totalNotificationsSent;
    private Long successfulNotifications;
    private Long failedNotifications;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
