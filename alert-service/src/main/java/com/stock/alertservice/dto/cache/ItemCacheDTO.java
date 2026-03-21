package com.stock.alertservice.dto.cache;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemCacheDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private String id;
    private String sku;
    private String name;
    private String categoryId;
    private String categoryName;
    private Boolean isActive;
    private Boolean isSerialized;
    private Boolean isLotManaged;
    private Integer shelfLifeDays;
    private String imageUrl;
    private String description;

    private LocalDateTime cachedAt;
    private String source;
}
