package com.stock.productservice.controller;

import com.opencsv.CSVWriter;
import com.opencsv.CSVWriterBuilder;
import com.opencsv.bean.CsvToBean;
import com.opencsv.bean.CsvToBeanBuilder;
import com.stock.productservice.dto.CategoryCreateRequest;
import com.stock.productservice.dto.CategoryDTO;
import com.stock.productservice.dto.csv.CategoryCsvRecord;
import com.stock.productservice.service.CategoryService;
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
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Category CSV", description = "Category CSV import/export endpoints")
public class CategoryCsvController {

    private final CategoryService categoryService;

    @GetMapping("/export/csv")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_MANAGER','ROLE_WAREHOUSE_MANAGER','ROLE_AUDITOR','ROLE_PROCUREMENT')")
    @Operation(summary = "Export all categories to CSV")
    public ResponseEntity<StreamingResponseBody> exportCategoriesCsv() {
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
                        "id", "name", "description", "parentCategoryId", "isActive", "createdAt"
                });

                // Data
                List<CategoryDTO> categories = categoryService.getAllCategories();
                for (CategoryDTO cat : categories) {
                    csvWriter.writeNext(new String[]{
                            nullSafe(cat.getId()),
                            nullSafe(cat.getName()),
                            nullSafe(cat.getDescription()),
                            nullSafe(cat.getParentCategoryId()),
                            boolSafe(cat.getIsActive()),
                            cat.getCreatedAt() != null ? cat.getCreatedAt().toString() : ""
                    });
                }
                writer.flush();
            } catch (Exception e) {
                log.error("Error exporting categories to CSV", e);
                throw new RuntimeException("CSV export failed: " + e.getMessage(), e);
            }
        };

        String filename = "categories-" + LocalDate.now() + ".csv";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(body);
    }

    @PostMapping(value = "/import/csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_MANAGER')")
    @Operation(summary = "Import categories from CSV file")
    public ResponseEntity<Map<String, Object>> importCategoriesCsv(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "File is empty"));
        }

        List<Map<String, Object>> errors = new ArrayList<>();
        int importedCount = 0;
        int rowNumber = 1;

        try (InputStreamReader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            CsvToBean<CategoryCsvRecord> csvToBean = new CsvToBeanBuilder<CategoryCsvRecord>(reader)
                    .withType(CategoryCsvRecord.class)
                    .withIgnoreLeadingWhiteSpace(true)
                    .withIgnoreEmptyLine(true)
                    .withThrowExceptions(false)
                    .build();

            for (CategoryCsvRecord record : csvToBean) {
                rowNumber++;
                try {
                    if (isBlank(record.getName())) {
                        errors.add(Map.of("row", rowNumber, "message",
                                "Required field missing: name is mandatory"));
                        continue;
                    }

                    CategoryCreateRequest request = CategoryCreateRequest.builder()
                            .name(record.getName().trim())
                            .description(isBlank(record.getDescription()) ? null : record.getDescription().trim())
                            .parentCategoryId(isBlank(record.getParentCategoryId()) ? null : record.getParentCategoryId().trim())
                            .build();

                    categoryService.createCategory(request);
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
}
