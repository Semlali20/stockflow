package com.stock.authservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerifyMfaRequest {

    @NotBlank(message = "Temporary token is required")
    private String tempToken;

    @NotBlank(message = "MFA code is required")
    private String mfaCode;

    private String deviceType;
}
