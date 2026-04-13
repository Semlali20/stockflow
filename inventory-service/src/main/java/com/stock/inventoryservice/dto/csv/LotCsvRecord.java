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
public class LotCsvRecord {
    @CsvBindByName(column = "id") private String id;
    @CsvBindByName(column = "code", required = true) private String code;
    @CsvBindByName(column = "lotNumber") private String lotNumber;
    @CsvBindByName(column = "itemId", required = true) private String itemId;
    @CsvBindByName(column = "status") private String status;
    @CsvBindByName(column = "manufactureDate") private String manufactureDate;
    @CsvBindByName(column = "expiryDate") private String expiryDate;
    @CsvBindByName(column = "supplierId") private String supplierId;
    @CsvBindByName(column = "createdAt") private String createdAt;
}
