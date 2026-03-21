package com.stock.productservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemVariantCreateRequest {

    @NotBlank(message = "Parent item ID is required")
    private String parentItemId;

    @NotBlank(message = "Variant SKU is required")
    @Size(max = 50, message = "SKU must not exceed 50 characters")
    private String sku;

    // JSON string for variant-specific attributes
    // Example: {"size": "L", "color": "Blue"}
    // These will override/extend the parent item's attributes
    private String variantAttributes;
}
