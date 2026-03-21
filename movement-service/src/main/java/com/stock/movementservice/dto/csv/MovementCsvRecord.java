package com.stock.movementservice.dto.csv;

import com.opencsv.bean.CsvBindByName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovementCsvRecord {
    @CsvBindByName(column = "id") private String id;
    @CsvBindByName(column = "referenceNumber") private String referenceNumber;
    @CsvBindByName(column = "type") private String type;
    @CsvBindByName(column = "status") private String status;
    @CsvBindByName(column = "priority") private String priority;
    @CsvBindByName(column = "movementDate") private String movementDate;
    @CsvBindByName(column = "warehouseId") private String warehouseId;
    @CsvBindByName(column = "sourceLocationId") private String sourceLocationId;
    @CsvBindByName(column = "destinationLocationId") private String destinationLocationId;
    @CsvBindByName(column = "notes") private String notes;
    @CsvBindByName(column = "reason") private String reason;
    @CsvBindByName(column = "createdBy") private String createdBy;
    @CsvBindByName(column = "completedBy") private String completedBy;
    @CsvBindByName(column = "completedAt") private String completedAt;
    @CsvBindByName(column = "createdAt") private String createdAt;
}
