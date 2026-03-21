package com.stock.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {

    private String id;
    private String username;
    private String email;
    private String phoneNumber;
    private String firstName;
    private String lastName;
    private Boolean isActive;
    private Boolean isEmailVerified;
    private Boolean isPhoneVerified;
    private Boolean mfaEnabled;
    private Integer failedLoginAttempts;
    private LocalDateTime lockedUntil;
    private LocalDateTime lastLogin;
    private LocalDateTime passwordChangedAt;
    private String preferences;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Set<String> roleNames;
    private Set<String> permissions;
}
