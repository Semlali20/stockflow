package com.stock.inventoryservice.controller;

import com.opencsv.CSVWriter;
import com.opencsv.CSVWriterBuilder;
import com.opencsv.bean.CsvToBean;
import com.opencsv.bean.CsvToBeanBuilder;
import com.stock.inventoryservice.dto.LotDTO;
import com.stock.inventoryservice.dto.csv.LotCsvRecord;
import com.stock.inventoryservice.dto.request.LotCreateRequest;
import com.stock.inventoryservice.entity.LotStatus;
import com.stock.inventoryservice.service.LotService;
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
import java.time.format.DateTimeParseException;
import java.util.*;

@RestController
@RequestMapping("/api/lots")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Lot CSV", description = "Lot CSV import/export endpoints")
public class LotCsvController {

    private final LotService lotService;

    @GetMapping("/export/csv")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_MANAGER','ROLE_WAREHOUSE_MANAGER','ROLE_AUDITOR','ROLE_PROCUREMENT')")
    @Operation(summary = "Export all lots to CSV")
    public ResponseEntity<StreamingResponseBody> exportLotsCsv() {
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
                        "id", "code", "lotNumber", "itemId", "status",
                        "manufactureDate", "expiryDate", "supplierId", "createdAt"
                });

                // Data
                List<LotDTO> lots = lotService.getAllLots();
                for (LotDTO lot : lots) {
                    csvWriter.writeNext(new String[]{
                            nullSafe(lot.getId()),
                            nullSafe(lot.getCode()),
                            nullSafe(lot.getLotNumber()),
                            nullSafe(lot.getItemId()),
                            lot.getStatus() != null ? lot.getStatus().name() : "",
                            lot.getManufactureDate() != null ? lot.getManufactureDate().toString() : "",
                            lot.getExpiryDate() != null ? lot.getExpiryDate().toString() : "",
                            nullSafe(lot.getSupplierId()),
                            lot.getCreatedAt() != null ? lot.getCreatedAt().toString() : ""
                    });
                }
                writer.flush();
            } catch (Exception e) {
                log.error("Error exporting lots to CSV", e);
                throw new RuntimeException("CSV export failed: " + e.getMessage(), e);
            }
        };

        String filename = "lots-" + LocalDate.now() + ".csv";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(body);
    }

    @PostMapping(value = "/import/csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_MANAGER','ROLE_WAREHOUSE_MANAGER','ROLE_PROCUREMENT')")
    @Operation(summary = "Import lots from CSV file")
    public ResponseEntity<Map<String, Object>> importLotsCsv(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "File is empty"));
        }

        List<Map<String, Object>> errors = new ArrayList<>();
        int importedCount = 0;
        int rowNumber = 1;

        try (InputStreamReader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            CsvToBean<LotCsvRecord> csvToBean = new CsvToBeanBuilder<LotCsvRecord>(reader)
                    .withType(LotCsvRecord.class)
                    .withIgnoreLeadingWhiteSpace(true)
                    .withIgnoreEmptyLine(true)
                    .withThrowExceptions(false)
                    .build();

            for (LotCsvRecord record : csvToBean) {
                rowNumber++;
                try {
                    if (isBlank(record.getCode()) || isBlank(record.getItemId())) {
                        errors.add(Map.of("row", rowNumber, "message",
                                "Required fields missing: code and itemId are mandatory"));
                        continue;
                    }

                    // lotNumber required by service
                    String lotNumber = isBlank(record.getLotNumber()) ? record.getCode() : record.getLotNumber();

                    // Parse status (default ACTIVE)
                    LotStatus status = LotStatus.ACTIVE;
                    if (!isBlank(record.getStatus())) {
                        try {
                            status = LotStatus.valueOf(record.getStatus().trim().toUpperCase());
                        } catch (IllegalArgumentException e) {
                            errors.add(Map.of("row", rowNumber, "message",
                                    "Invalid status value: " + record.getStatus() + ". Valid values: ACTIVE, QUARANTINED, EXPIRED, RECALLED"));
                            continue;
                        }
                    }

                    LotCreateRequest request = LotCreateRequest.builder()
                            .code(record.getCode().trim())
                            .itemId(record.getItemId().trim())
                            .lotNumber(lotNumber.trim())
                            .status(status)
                            .supplierId(isBlank(record.getSupplierId()) ? null : record.getSupplierId().trim())
                            .manufactureDate(parseDateOrNull(record.getManufactureDate()))
                            .expiryDate(parseDateOrNull(record.getExpiryDate()))
                            .build();

                    lotService.createLot(request);
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
    private LocalDate parseDateOrNull(String s) {
        if (isBlank(s)) return null;
        try { return LocalDate.parse(s.trim()); } catch (DateTimeParseException e) { return null; }
    }
}
