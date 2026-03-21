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
public class SessionTerminatedEvent {
    private String sessionId;
    private String userId;
    private String username;
    private LocalDateTime terminatedAt;
    private String reason;
}
