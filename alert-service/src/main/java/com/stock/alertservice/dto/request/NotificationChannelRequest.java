package com.stock.alertservice.dto.request;

import com.stock.alertservice.enums.NotificationChannelType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationChannelRequest {

    @NotBlank(message = "Channel name is required")
    private String name;

    @NotNull(message = "Channel type is required")
    private NotificationChannelType channelType;

    @NotNull(message = "Settings are required")
    private Map<String, Object> settings;

    private Boolean isActive;
    private Integer rateLimitPerHour;
    private Integer priority;
}
