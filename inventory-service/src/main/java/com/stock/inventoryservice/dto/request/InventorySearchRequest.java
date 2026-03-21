package com.stock.inventoryservice.dto.request;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventorySearchRequest {
    private String itemVariantId;
    private String locationId;
    private String warehouseId;
    private String lotNumber;
    private String serialNumber;
    private String status;
    private LocalDateTime expirationDateFrom;
    private LocalDateTime expirationDateTo;
    private Boolean lowStock;
}
