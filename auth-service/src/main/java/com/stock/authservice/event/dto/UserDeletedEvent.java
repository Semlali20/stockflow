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
public class UserDeletedEvent {

    private String userId;
    private String username;
    private String email;
    private String deletedBy;
    private LocalDateTime deletedAt;
    private String deletionReason;
}
