package com.stock.authservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatisticsResponse {

    private Long totalUsers;
    private Long activeUsers;
    private Long lockedAccounts;
    private Long mfaEnabledUsers;
    private Long totalRoles;
    private Long totalPermissions;
    private Long activeSessionsCount;
    private Map<String, Long> eventTypeCounts;
    private Map<String, Long> failedLoginsByUser;
}
