package com.stock.authservice.dto.request;

import com.stock.authservice.entity.MfaSecret.MfaType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MfaEnableRequest {

    @NotNull(message = "MFA type is required")
    private MfaType mfaType;

    private String phoneNumber; // For SMS MFA
    private String email;       // For Email MFA
}
