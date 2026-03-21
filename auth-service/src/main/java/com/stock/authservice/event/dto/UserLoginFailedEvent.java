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
public class UserLoginFailedEvent {

    private String username;
    private String ipAddress;
    private String userAgent;
    private String failureReason;
    private Integer attemptCount;
    private LocalDateTime attemptTime;
    private Boolean accountLocked;
}
