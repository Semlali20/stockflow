package com.stock.productservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ItemUpdateRequest {

    @NotNull(message = "Category ID is required")
    private String categoryId;

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    private String attributes;

    private String tags;

    private String imageUrl;

    private Boolean isSerialized;

    private Boolean isLotManaged;

    private Integer shelfLifeDays;

    private Boolean hazardousMaterial;

    private String temperatureControl;
}