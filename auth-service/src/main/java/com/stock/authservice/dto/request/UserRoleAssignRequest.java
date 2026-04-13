package com.stock.authservice.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRoleAssignRequest {

    @NotEmpty(message = "Role IDs are required")
    private Set<String> roleIds;
}
