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
public class CategoryCsvRecord {
    @CsvBindByName(column = "id") private String id;
    @CsvBindByName(column = "name", required = true) private String name;
    @CsvBindByName(column = "description") private String description;
    @CsvBindByName(column = "parentCategoryId") private String parentCategoryId;
    @CsvBindByName(column = "isActive") private String isActive;
    @CsvBindByName(column = "createdAt") private String createdAt;
}
