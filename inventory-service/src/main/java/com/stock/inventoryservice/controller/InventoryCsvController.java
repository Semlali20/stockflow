package com.stock.inventoryservice.controller;

import com.opencsv.CSVWriter;
import com.opencsv.CSVWriterBuilder;
import com.opencsv.bean.CsvToBean;
import com.opencsv.bean.CsvToBeanBuilder;
import com.stock.inventoryservice.dto.InventoryDTO;
import com.stock.inventoryservice.dto.csv.InventoryCsvRecord;
import com.stock.inventoryservice.dto.request.InventoryCreateRequest;
import com.stock.inventoryservice.entity.InventoryStatus;
import com.stock.inventoryservice.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Inventory CSV", description = "Inventory CSV import/export endpoints")
public class InventoryCsvController {

    private final InventoryService inventoryService;

    @GetMapping("/export/csv")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_MANAGER','ROLE_WAREHOUSE_MANAGER','ROLE_AUDITOR','ROLE_PROCUREMENT')")
    @Operation(summary = "Export all inventory records to CSV")
    public ResponseEntity<StreamingResponseBody> exportInventoryCsv() {
        StreamingResponseBody body = outputStream -> {
            try (Writer writer = new OutputStreamWriter(outputStream, StandardCharsets.UTF_8);
                 CSVWriter csvWriter = (CSVWriter) new CSVWriterBuilder(writer)
                         .withSeparator(CSVWriter.DEFAULT_SEPARATOR)
                         .withQuoteChar(CSVWriter.DEFAULT_QUOTE_CHARACTER)
                         .withEscapeChar(CSVWriter.DEFAULT_ESCAPE_CHARACTER)
                         .withLineEnd(CSVWriter.DEFAULT_LINE_END)
                         .build()) {

                // Write BOM for Excel compatibility
                writer.write('\uFEFF');

                // Header
                csvWriter.writeNext(new String[]{
                        "id", "itemId", "warehouseId", "locationId", "lotId", "serialId",
                        "quantityOnHand", "quantityReserved", "quantityDamaged", "availableQuantity",
                        "uom", "status", "unitCost", "expiryDate", "createdAt"
                });

                // Data
                List<InventoryDTO> inventories = inventoryService.getAllInventories();
                for (InventoryDTO inv : inventories) {
                    csvWriter.writeNext(new String[]{
                            nullSafe(inv.getId()),
                            nullSafe(inv.getItemId()),
                            nullSafe(inv.getWarehouseId()),
                            nullSafe(inv.getLocationId()),
                            nullSafe(inv.getLotId()),
                            nullSafe(inv.getSerialId()),
                            inv.getQuantityOnHand() != null ? inv.getQuantityOnHand().toString() : "0",
                            inv.getQuantityReserved() != null ? inv.getQuantityReserved().toString() : "0",
                            inv.getQuantityDamaged() != null ? inv.getQuantityDamaged().toString() : "0",
                            inv.getAvailableQuantity() != null ? inv.getAvailableQuantity().toString() : "0",
                            nullSafe(inv.getUom()),
                            inv.getStatus() != null ? inv.getStatus().name() : "",
                            inv.getUnitCost() != null ? inv.getUnitCost().toString() : "",
                            inv.getExpiryDate() != null ? inv.getExpiryDate().toString() : "",
                            inv.getCreatedAt() != null ? inv.getCreatedAt().toString() : ""
                    });
                }
                writer.flush();
            } catch (Exception e) {
                log.error("Error exporting inventory to CSV", e);
                throw new RuntimeException("CSV export failed: " + e.getMessage(), e);
            }
        };

        String filename = "inventory-" + LocalDate.now() + ".csv";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(body);
    }

    @PostMapping(value = "/import/csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_MANAGER','ROLE_WAREHOUSE_MANAGER')")
    @Operation(summary = "Import inventory records from CSV file")
    public ResponseEntity<Map<String, Object>> importInventoryCsv(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "File is empty"));
        }

        List<Map<String, Object>> errors = new ArrayList<>();
        int importedCount = 0;
        int rowNumber = 1;

        try (InputStreamReader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            CsvToBean<InventoryCsvRecord> csvToBean = new CsvToBeanBuilder<InventoryCsvRecord>(reader)
                    .withType(InventoryCsvRecord.class)
                    .withIgnoreLeadingWhiteSpace(true)
                    .withIgnoreEmptyLine(true)
                    .withThrowExceptions(false)
                    .build();

            for (InventoryCsvRecord record : csvToBean) {
                rowNumber++;
                try {
                    // Validate required fields
                    if (isBlank(record.getItemId()) || isBlank(record.getWarehouseId())
                            || isBlank(record.getLocationId()) || isBlank(record.getQuantityOnHand())) {
                        errors.add(Map.of("row", rowNumber, "message",
                                "Required fields missing: itemId, warehouseId, locationId, quantityOnHand are mandatory"));
                        continue;
                    }

                    // Parse status
                    InventoryStatus status = InventoryStatus.AVAILABLE;
                    if (!isBlank(record.getStatus())) {
                        try {
                            status = InventoryStatus.valueOf(record.getStatus().trim().toUpperCase());
                        } catch (IllegalArgumentException e) {
                            errors.add(Map.of("row", rowNumber, "message",
                                    "Invalid status value: " + record.getStatus() + ". Valid values: AVAILABLE, RESERVED, ALLOCATED, DAMAGED, QUARANTINED, EXPIRED"));
                            continue;
                        }
                    }

                    InventoryCreateRequest request = InventoryCreateRequest.builder()
                            .itemId(record.getItemId().trim())
                            .warehouseId(record.getWarehouseId().trim())
                            .locationId(record.getLocationId().trim())
                            .lotId(isBlank(record.getLotId()) ? null : record.getLotId().trim())
                            .serialId(isBlank(record.getSerialId()) ? null : record.getSerialId().trim())
                            .quantityOnHand(parseDoubleOrDefault(record.getQuantityOnHand(), 0.0))
                            .quantityReserved(parseDoubleOrDefault(record.getQuantityReserved(), 0.0))
                            .quantityDamaged(parseDoubleOrDefault(record.getQuantityDamaged(), 0.0))
                            .uom(isBlank(record.getUom()) ? "EA" : record.getUom().trim())
                            .status(status)
                            .unitCost(isBlank(record.getUnitCost()) ? null : new BigDecimal(record.getUnitCost().trim()))
                            .expiryDate(parseDateOrNull(record.getExpiryDate()))
                            .build();

                    inventoryService.createInventory(request);
                    importedCount++;
                } catch (Exception e) {
                    errors.add(Map.of("row", rowNumber, "message",
                            e.getMessage() != null ? e.getMessage() : "Unknown error"));
                }
            }

            // Collect OpenCSV parse errors
            for (var ex : csvToBean.getCapturedExceptions()) {
                errors.add(Map.of("row", (int) ex.getLineNumber(), "message", ex.getMessage()));
            }

        } catch (Exception e) {
            log.error("CSV import failed", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to parse CSV: " + e.getMessage()));
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("imported", importedCount);
        result.put("failed", errors.size());
        result.put("errors", errors);

        int status = errors.isEmpty() ? 200 : 207;
        return ResponseEntity.status(status).body(result);
    }

    private String nullSafe(String value) { return value != null ? value : ""; }
    private boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }
    private Double parseDoubleOrDefault(String s, Double defaultVal) {
        if (isBlank(s)) return defaultVal;
        try { return Double.parseDouble(s.trim()); } catch (NumberFormatException e) { return defaultVal; }
    }
    private LocalDate parseDateOrNull(String s) {
        if (isBlank(s)) return null;
        try { return LocalDate.parse(s.trim()); } catch (DateTimeParseException e) { return null; }
    }
}
