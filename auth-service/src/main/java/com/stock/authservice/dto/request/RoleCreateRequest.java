package com.stock.authservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleCreateRequest {

    @NotBlank(message = "Role name is required")
    private String name;

    private String description;
    private Boolean isSystem;
    private Set<String> permissionIds;
}
