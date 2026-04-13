package com.stock.productservice.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemCreateRequest {

    @NotBlank(message = "Category ID is required")
    private String categoryId;

    @NotBlank(message = "SKU is required")
    @Size(max = 50, message = "SKU must not exceed 50 characters")
    private String sku;

    @NotBlank(message = "Item name is required")
    @Size(max = 200, message = "Name must not exceed 200 characters")
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    // JSON string for flexible attributes
    // Example: {"color": "red", "material": "cotton", "size": "M"}
    private String attributes;

    @Size(max = 500, message = "Tags must not exceed 500 characters")
    private String tags;

    @Size( message = "Image URL must not exceed 500 characters")
    private String imageUrl;

    private Boolean isSerialized;

    private Boolean isLotManaged;

    @Min(value = 0, message = "Shelf life days must be non-negative")
    private Integer shelfLifeDays;

    private Boolean hazardousMaterial;

    // JSON string array for temperature control requirements
    // Example: ["2-8°C", "DRY", "REFRIGERATED"]
    private String temperatureControl;
}