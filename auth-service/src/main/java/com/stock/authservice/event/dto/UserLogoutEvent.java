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
public class UserLogoutEvent {
    private String userId;
    private String username;
    private String sessionId;
    private LocalDateTime logoutTime;
    private String reason;
}
