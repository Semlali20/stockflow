package com.stock.authservice.dto.response;

import com.stock.authservice.entity.MfaSecret.MfaType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MfaSetupResponse {

    private String secret;
    private String qrCodeUrl;
    private MfaType mfaType;
    private List<String> backupCodes;
    private String message;

}

