// inventory-service/src/main/java/com/stock/inventoryservice/dto/SerialWithItemDTO.java
package com.stock.inventoryservice.dto;

import com.stock.inventoryservice.entity.SerialStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SerialWithItemDTO {

    private String id;
    private String code;
    private String itemId;
    private String serialNumber;
    private SerialStatus status;
    private String locationId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Item details from cache
    private String itemSku;
    private String itemName;
    private Boolean itemIsActive;
}
