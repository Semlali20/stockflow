package com.stock.productservice.dto.csv;

import com.opencsv.bean.CsvBindByName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemCsvRecord {
    @CsvBindByName(column = "id") private String id;
    @CsvBindByName(column = "sku", required = true) private String sku;
    @CsvBindByName(column = "name", required = true) private String name;
    @CsvBindByName(column = "categoryId", required = true) private String categoryId;
    @CsvBindByName(column = "description") private String description;
    @CsvBindByName(column = "tags") private String tags;
    @CsvBindByName(column = "isSerialized") private String isSerialized;
    @CsvBindByName(column = "isLotManaged") private String isLotManaged;
    @CsvBindByName(column = "shelfLifeDays") private String shelfLifeDays;
    @CsvBindByName(column = "hazardousMaterial") private String hazardousMaterial;
    @CsvBindByName(column = "isActive") private String isActive;
    @CsvBindByName(column = "createdAt") private String createdAt;
}
