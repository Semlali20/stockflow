package com.stock.productservice.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemVariantDTO {

    private String id;
    private String parentItemId;
    private String parentItemName;  // For display
    private String parentItemSku;   // For display
    private String sku;
    private String variantAttributes;  // JSON string of variant-specific attributes
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String itemVariantId;
    // Computed field - combines parent item attributes with variant attributes
    private String effectiveAttributes;  // JSON string
}
