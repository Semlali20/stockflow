package com.stock.inventoryservice.event.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ItemEvent implements Serializable {

    private String id;
    private String sku;
    private String name;
    private String categoryId;
    private String itemVariantId;
    private Boolean isActive;
    private Boolean isSerialized;
    private Boolean isLotManaged;
    private Integer shelfLifeDays;
    private Boolean hazardousMaterial;
    private String temperatureControl;
    private LocalDateTime timestamp;
    private String eventType;
}
