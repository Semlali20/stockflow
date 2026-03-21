package com.stock.alertservice.dto.response;

import com.stock.alertservice.enums.AlertType;
import com.stock.alertservice.enums.NotificationChannelType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationTemplateResponse {

    private String id;
    private String name;
    private String subject;
    private String htmlBody;
    private String textBody;
    private NotificationChannelType channel;
    private AlertType templateType;
    private String language;
    private Boolean isActive;
    private String requiredVariables;

    private Long totalNotificationsSent;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
