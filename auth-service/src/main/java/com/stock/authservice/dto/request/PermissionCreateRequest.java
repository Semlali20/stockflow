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
public class PermissionCreateRequest {

    @NotBlank(message = "Permission name is required")
    private String name;

    private String description;
    private String category;
    private String resourceType;
    private Boolean isSystem;
}
