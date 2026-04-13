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
public class RoleAssignedEvent {

    private String userId;
    private String username;
    private String roleId;
    private String roleName;
    private String assignedBy;
    private LocalDateTime assignedAt;
}
