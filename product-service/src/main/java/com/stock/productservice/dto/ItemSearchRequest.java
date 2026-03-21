package com.stock.productservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemSearchRequest {

    private String categoryId;
    private String name;
    private String sku;
    private String tags;
    private Boolean isSerialized;
    private Boolean isLotManaged;
    private Boolean hazardousMaterial;
    private Boolean isActive;
}