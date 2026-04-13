package com.stock.productservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CategoryUpdateRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    private String parentCategoryId;

    private Integer displayOrder;

    private String attributeSchemas;
}