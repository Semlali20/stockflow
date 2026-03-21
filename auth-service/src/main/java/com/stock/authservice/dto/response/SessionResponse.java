package com.stock.authservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionResponse {

    private String id;
    private String sessionToken;
    private String ipAddress;
    private String userAgent;
    private String deviceType;
    private Boolean isActive;
    private LocalDateTime lastActivity;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}
