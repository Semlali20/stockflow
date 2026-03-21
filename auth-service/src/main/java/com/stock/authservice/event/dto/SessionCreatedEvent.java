package com.stock.authservice.event.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionCreatedEvent {
    private String sessionId;
    private String userId;
    private String username;
    private String ipAddress;
    private String userAgent;
    private String deviceType;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}
