package com.stock.inventoryservice.dto.csv;

import com.opencsv.bean.CsvBindByName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryCsvRecord {
    @CsvBindByName(column = "id") private String id;
    @CsvBindByName(column = "itemId", required = true) private String itemId;
    @CsvBindByName(column = "warehouseId", required = true) private String warehouseId;
    @CsvBindByName(column = "locationId", required = true) private String locationId;
    @CsvBindByName(column = "lotId") private String lotId;
    @CsvBindByName(column = "serialId") private String serialId;
    @CsvBindByName(column = "quantityOnHand", required = true) private String quantityOnHand;
    @CsvBindByName(column = "quantityReserved") private String quantityReserved;
    @CsvBindByName(column = "quantityDamaged") private String quantityDamaged;
    @CsvBindByName(column = "availableQuantity") private String availableQuantity;
    @CsvBindByName(column = "uom") private String uom;
    @CsvBindByName(column = "status") private String status;
    @CsvBindByName(column = "unitCost") private String unitCost;
    @CsvBindByName(column = "expiryDate") private String expiryDate;
    @CsvBindByName(column = "createdAt") private String createdAt;
}
