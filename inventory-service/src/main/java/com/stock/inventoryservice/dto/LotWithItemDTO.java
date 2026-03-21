// inventory-service/src/main/java/com/stock/inventoryservice/dto/LotWithItemDTO.java
package com.stock.inventoryservice.dto;

import com.stock.inventoryservice.entity.LotStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LotWithItemDTO {

    private String id;
    private String code;
    private String itemId;
    private String lotNumber;
    private LocalDate expiryDate;
    private LocalDate manufactureDate;
    private String supplierId;
    private LotStatus status;
    private String attributes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Item details from cache
    private String itemSku;
    private String itemName;
    private Boolean itemIsActive;
}
