package com.stock.authservice.event.dto;

import com.stock.authservice.entity.MfaSecret.MfaType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MfaEnabledEvent {

    private String userId;
    private String username;
    private String email;
    private MfaType mfaType;
    private LocalDateTime enabledAt;
}
