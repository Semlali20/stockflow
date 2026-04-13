package com.stock.alertservice.event.outgoing;

import com.stock.alertservice.enums.NotificationChannelType;
import com.stock.alertservice.enums.NotificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent {
    private String notificationId;
    private String alertId;
    private NotificationChannelType channelType;
    private String recipient;
    private NotificationStatus status;
    private LocalDateTime timestamp;
    private String eventType;
}
