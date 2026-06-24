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
    private String categoryName; 
    private String sku;
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
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

   
    private Boolean isExpirable;  
}
