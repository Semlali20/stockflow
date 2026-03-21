package com.stock.authservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordStrengthResponse {

    private Integer score; // 0-4
    private String strength; // WEAK, FAIR, GOOD, STRONG, VERY_STRONG
    private String feedback;
    private Boolean meetsRequirements;
}
