package com.stock.productservice.controller;

import com.opencsv.CSVWriter;
import com.opencsv.CSVWriterBuilder;
import com.opencsv.bean.CsvToBean;
import com.opencsv.bean.CsvToBeanBuilder;
import com.stock.productservice.dto.ItemCreateRequest;
import com.stock.productservice.dto.ItemDTO;
import com.stock.productservice.dto.csv.ItemCsvRecord;
import com.stock.productservice.service.ItemService;
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
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Item CSV", description = "Item CSV import/export endpoints")
public class ItemCsvController {

    private final ItemService itemService;

    @GetMapping("/export/csv")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_MANAGER','ROLE_WAREHOUSE_MANAGER','ROLE_AUDITOR','ROLE_PROCUREMENT')")
    @Operation(summary = "Export all items to CSV")
    public ResponseEntity<StreamingResponseBody> exportItemsCsv() {
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
                        "id", "sku", "name", "categoryId", "description", "tags",
                        "isSerialized", "isLotManaged", "shelfLifeDays",
                        "hazardousMaterial", "isActive", "createdAt"
                });

                // Data
                List<ItemDTO> items = itemService.getAllItems();
                for (ItemDTO item : items) {
                    csvWriter.writeNext(new String[]{
                            nullSafe(item.getId()),
                            nullSafe(item.getSku()),
                            nullSafe(item.getName()),
                            nullSafe(item.getCategoryId()),
                            nullSafe(item.getDescription()),
                            nullSafe(item.getTags()),
                            boolSafe(item.getIsSerialized()),
                            boolSafe(item.getIsLotManaged()),
                            item.getShelfLifeDays() != null ? item.getShelfLifeDays().toString() : "",
                            boolSafe(item.getHazardousMaterial()),
                            boolSafe(item.getIsActive()),
                            item.getCreatedAt() != null ? item.getCreatedAt().toString() : ""
                    });
                }
                writer.flush();
            } catch (Exception e) {
                log.error("Error exporting items to CSV", e);
                throw new RuntimeException("CSV export failed: " + e.getMessage(), e);
            }
        };

        String filename = "items-" + LocalDate.now() + ".csv";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(body);
    }

    @PostMapping(value = "/import/csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_MANAGER','ROLE_PROCUREMENT')")
    @Operation(summary = "Import items from CSV file")
    public ResponseEntity<Map<String, Object>> importItemsCsv(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "File is empty"));
        }

        List<Map<String, Object>> errors = new ArrayList<>();
        int importedCount = 0;
        int rowNumber = 1; // header is row 0

        try (InputStreamReader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            CsvToBean<ItemCsvRecord> csvToBean = new CsvToBeanBuilder<ItemCsvRecord>(reader)
                    .withType(ItemCsvRecord.class)
                    .withIgnoreLeadingWhiteSpace(true)
                    .withIgnoreEmptyLine(true)
                    .withThrowExceptions(false)
                    .build();

            for (ItemCsvRecord record : csvToBean) {
                rowNumber++;
                try {
                    // Validate required fields
                    if (isBlank(record.getSku()) || isBlank(record.getName()) || isBlank(record.getCategoryId())) {
                        errors.add(Map.of("row", rowNumber, "message",
                                "Required fields missing: sku, name, categoryId are mandatory"));
                        continue;
                    }

                    ItemCreateRequest request = ItemCreateRequest.builder()
                            .sku(record.getSku().trim())
                            .name(record.getName().trim())
                            .categoryId(record.getCategoryId().trim())
                            .description(isBlank(record.getDescription()) ? null : record.getDescription().trim())
                            .tags(isBlank(record.getTags()) ? null : record.getTags().trim())
                            .isSerialized(parseBool(record.getIsSerialized()))
                            .isLotManaged(parseBool(record.getIsLotManaged()))
                            .shelfLifeDays(parseIntOrNull(record.getShelfLifeDays()))
                            .hazardousMaterial(parseBool(record.getHazardousMaterial()))
                            .build();

                    itemService.createItem(request);
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
    private String boolSafe(Boolean value) { return value != null ? value.toString() : "false"; }
    private boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }
    private Boolean parseBool(String s) {
        if (isBlank(s)) return null;
        return Boolean.parseBoolean(s.trim());
    }
    private Integer parseIntOrNull(String s) {
        if (isBlank(s)) return null;
        try { return Integer.parseInt(s.trim()); } catch (NumberFormatException e) { return null; }
    }
}
