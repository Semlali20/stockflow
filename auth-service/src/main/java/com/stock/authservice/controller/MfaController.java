package com.stock.authservice.controller;

import com.stock.authservice.dto.request.MfaVerificationRequest;
import com.stock.authservice.dto.response.ApiResponse;
import com.stock.authservice.dto.response.MfaSetupResponse;
import com.stock.authservice.security.CustomUserDetails;
import com.stock.authservice.service.MfaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mfa")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "MFA Management", description = "Multi-Factor Authentication endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class MfaController {

    private final MfaService mfaService;

    // ==================== MFA SETUP ====================

    @PostMapping("/setup")
    @Operation(summary = "Setup MFA", description = "Generate MFA secret and QR code for user")
    public ResponseEntity<ApiResponse<MfaSetupResponse>> setupMfa(Authentication authentication) {
        log.info("POST /api/mfa/setup - MFA setup request");

        String userId = ((CustomUserDetails) authentication.getPrincipal()).getId();
        String username = ((CustomUserDetails) authentication.getPrincipal()).getUsername();

        String secret = mfaService.enableMfa(userId);
        String qrCodeUrl = mfaService.generateQRCodeUrl(username, secret, "Stock-Management");
        String[] backupCodes = mfaService.generateBackupCodes(8);

        MfaSetupResponse response = MfaSetupResponse.builder()
                .secret(secret)
                .qrCodeUrl(qrCodeUrl)
                .backupCodes(List.of(backupCodes))
                .build();

        return ResponseEntity.ok(ApiResponse.success("MFA setup initiated. Please scan QR code.", response));
    }

    @PostMapping("/verify-setup")
    @Operation(summary = "Verify MFA setup", description = "Verify MFA code to complete setup")
    public ResponseEntity<ApiResponse<Void>> verifySetup(
            @Valid @RequestBody MfaVerificationRequest request,
            Authentication authentication) {
        log.info("POST /api/mfa/verify-setup - Verify MFA setup");

        String userId = ((CustomUserDetails) authentication.getPrincipal()).getId();

        boolean isValid = mfaService.verifyMfaSetup(userId, request.getCode());

        if (isValid) {
            return ResponseEntity.ok(ApiResponse.success("MFA enabled successfully", null));
        } else {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid MFA code. Please try again."));
        }
    }

    // ==================== MFA STATUS ====================

    @GetMapping("/status")
    @Operation(summary = "Get MFA status", description = "Check if MFA is enabled for current user")
    public ResponseEntity<ApiResponse<Boolean>> getMfaStatus(Authentication authentication) {
        log.info("GET /api/mfa/status - Get MFA status");

        String userId = ((CustomUserDetails) authentication.getPrincipal()).getId();
        boolean isEnabled = mfaService.isMfaEnabled(userId);

        return ResponseEntity.ok(ApiResponse.success("MFA status retrieved", isEnabled));
    }

    // ==================== DISABLE MFA ====================

    @PostMapping("/disable")
    @Operation(summary = "Disable MFA", description = "Disable MFA for current user")
    public ResponseEntity<ApiResponse<Void>> disableMfa(
            @Valid @RequestBody MfaVerificationRequest request,
            Authentication authentication) {
        log.info("POST /api/mfa/disable - Disable MFA request");

        String userId = ((CustomUserDetails) authentication.getPrincipal()).getId();

        mfaService.disableMfa(userId, request.getCode());

        return ResponseEntity.ok(ApiResponse.success("MFA disabled successfully", null));
    }

    // ==================== REGENERATE BACKUP CODES ====================

    @PostMapping("/backup-codes/regenerate")
    @Operation(summary = "Regenerate backup codes", description = "Generate new backup codes")
    public ResponseEntity<ApiResponse<String[]>> regenerateBackupCodes(Authentication authentication) {
        log.info("POST /api/mfa/backup-codes/regenerate - Regenerate backup codes");

        String[] backupCodes = mfaService.generateBackupCodes(8);

        return ResponseEntity.ok(ApiResponse.success("Backup codes regenerated", backupCodes));
    }

    // ==================== GET QR CODE ====================

    @GetMapping("/qr-code")
    @Operation(summary = "Get QR code", description = "Get QR code URL for re-scanning")
    public ResponseEntity<ApiResponse<String>> getQrCode(Authentication authentication) {
        log.info("GET /api/mfa/qr-code - Get QR code URL");

        String userId = ((CustomUserDetails) authentication.getPrincipal()).getId();
        String qrCodeUrl = mfaService.generateQRCodeUrlForUser(userId, "Stock-Management");

        return ResponseEntity.ok(ApiResponse.success("QR code URL retrieved", qrCodeUrl));
    }
}
