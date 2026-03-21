package com.stock.productservice.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemDTO {

    private String id;
    private String categoryId;
    private String categoryName;  // For display (like warehouseName in LocationDTO)
    private String sku;
    private String name;
    private String description;
    private String attributes;  // JSON string of flexible attributes
    private String tags;
    private String imageUrl;
    private Boolean isSerialized;
    private Boolean isLotManaged;
    private Integer shelfLifeDays;
    private Boolean hazardousMaterial;
    private String temperatureControl;  // JSON string array
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Computed field
    private Boolean isExpirable;  // Derived from shelfLifeDays
}
