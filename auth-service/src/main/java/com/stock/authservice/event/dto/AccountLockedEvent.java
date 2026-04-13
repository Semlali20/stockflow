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
public class AccountLockedEvent {

    private String userId;
    private String username;
    private String email;
    private String ipAddress;
    private Integer failedAttempts;
    private LocalDateTime lockedAt;
    private LocalDateTime lockedUntil;
    private String lockReason;
}
