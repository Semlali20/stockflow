package com.stock.alertservice.dto.request;

import com.stock.alertservice.enums.AlertType;
import com.stock.alertservice.enums.NotificationChannelType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationTemplateRequest {

    @NotBlank(message = "Template name is required")
    private String name;

    private String subject;

    @NotBlank(message = "HTML body is required")
    private String htmlBody;

    private String textBody;

    @NotNull(message = "Channel is required")
    private NotificationChannelType channel;

    private AlertType templateType;
    private String language;
    private Boolean isActive;
    private String requiredVariables;
}
