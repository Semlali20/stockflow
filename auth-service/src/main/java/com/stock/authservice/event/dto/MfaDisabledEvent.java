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
public class MfaDisabledEvent {

    private String userId;
    private String username;
    private String email;
    private LocalDateTime disabledAt;
    private String disabledBy;
}
