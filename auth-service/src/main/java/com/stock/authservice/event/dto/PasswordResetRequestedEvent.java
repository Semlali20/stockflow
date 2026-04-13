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
public class PasswordResetRequestedEvent {

    private String userId;
    private String username;
    private String email;
    private String ipAddress;
    private String resetToken;
    private LocalDateTime requestedAt;
    private LocalDateTime expiresAt;
}
