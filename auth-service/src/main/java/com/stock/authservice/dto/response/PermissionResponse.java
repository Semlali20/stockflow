package com.stock.authservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermissionResponse {

    private String id;
    private String name;
    private String description;
    private String category;
    private String resourceType;
    private Boolean isSystem;
    private LocalDateTime createdAt;
}
