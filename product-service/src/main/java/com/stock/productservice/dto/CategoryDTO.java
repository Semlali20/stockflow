package com.stock.productservice.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryDTO {

    private String id;
    private String name;
    private String description;
    private String parentCategoryId;
    private String parentCategoryName;  // For display
    private Integer displayOrder;
    private String attributeSchemas;  // JSON string defining allowed attributes
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}