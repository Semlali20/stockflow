package com.stock.inventoryservice.dto;

import com.stock.inventoryservice.entity.InventoryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Enhanced inventory response with item details from Product Service
 * Used when client needs both inventory and product information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryWithItemDTO {

    // === INVENTORY DATA ===
    private String id;
    private String itemId;
    private String warehouseId;
    private String locationId;
    private String lotId;
    private String serialId;

    private Double quantityOnHand;
    private Double quantityReserved;
    private Double quantityDamaged;
    private Double availableQuantity;
    private String uom;

    private InventoryStatus status;
    private BigDecimal unitCost;
    private LocalDate expiryDate;
    private LocalDate manufactureDate;
    private LocalDate lastCountDate;

    private Long version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // === ITEM DETAILS (from Product Service via cache) ===
    private ItemDetailsDTO itemDetails;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemDetailsDTO {
        private String sku;
        private String name;
        private String categoryId;
        private String categoryName;
        private Boolean isActive;
        private Boolean isSerialized;
        private Boolean isLotManaged;
        private Integer shelfLifeDays;
        private String imageUrl;
    }
}
