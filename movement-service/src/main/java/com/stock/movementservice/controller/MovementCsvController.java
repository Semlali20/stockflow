package com.stock.movementservice.controller;

import com.opencsv.CSVWriter;
import com.opencsv.CSVWriterBuilder;
import com.stock.movementservice.dto.response.MovementSummaryDto;
import com.stock.movementservice.entity.enums.MovementStatus;
import com.stock.movementservice.entity.enums.MovementType;
import com.stock.movementservice.service.MovementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.OutputStreamWriter;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/movements")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Movement CSV", description = "Movement CSV export endpoint")
public class MovementCsvController {

    private final MovementService movementService;

    private static final int PAGE_SIZE = 500;

    @GetMapping("/export/csv")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_MANAGER','ROLE_WAREHOUSE_MANAGER','ROLE_AUDITOR')")
    @Operation(summary = "Export movements to CSV with optional filters")
    public ResponseEntity<StreamingResponseBody> exportMovementsCsv(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        // Parse optional filters
        final MovementStatus movementStatus = parseStatusOrNull(status);
        final MovementType movementType = parseTypeOrNull(type);
        final LocalDateTime startDateTime = parseDateTimeOrNull(startDate);
        final LocalDateTime endDateTime = parseDateTimeOrNull(endDate);

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
                        "id", "referenceNumber", "type", "status", "priority",
                        "movementDate", "warehouseId", "sourceLocationId", "destinationLocationId",
                        "totalLines", "completedLines", "createdBy", "createdAt"
                });

                // Paginate through all movements
                int pageNum = 0;
                boolean hasMore = true;

                while (hasMore) {
                    PageRequest pageable = PageRequest.of(pageNum, PAGE_SIZE, Sort.by("createdAt").descending());
                    Page<MovementSummaryDto> page;

                    // Use advanced search if filters are provided, otherwise get all
                    if (movementStatus != null || movementType != null || startDateTime != null || endDateTime != null) {
                        page = movementService.advancedSearch(
                                null, movementType, movementStatus, startDateTime, endDateTime, pageable);
                    } else {
                        page = movementService.getAllMovements(pageable);
                    }

                    List<MovementSummaryDto> movements = page.getContent();
                    for (MovementSummaryDto mov : movements) {
                        csvWriter.writeNext(new String[]{
                                nullSafe(mov.getId()),
                                nullSafe(mov.getReferenceNumber()),
                                mov.getType() != null ? mov.getType().name() : "",
                                mov.getStatus() != null ? mov.getStatus().name() : "",
                                mov.getPriority() != null ? mov.getPriority().name() : "",
                                mov.getMovementDate() != null ? mov.getMovementDate().toString() : "",
                                nullSafe(mov.getWarehouseId()),
                                nullSafe(mov.getSourceLocationId()),
                                nullSafe(mov.getDestinationLocationId()),
                                mov.getTotalLines() != null ? mov.getTotalLines().toString() : "0",
                                mov.getCompletedLines() != null ? mov.getCompletedLines().toString() : "0",
                                nullSafe(mov.getCreatedBy()),
                                mov.getCreatedAt() != null ? mov.getCreatedAt().toString() : ""
                        });
                    }

                    hasMore = !page.isLast();
                    pageNum++;
                }

                writer.flush();
            } catch (Exception e) {
                log.error("Error exporting movements to CSV", e);
                throw new RuntimeException("CSV export failed: " + e.getMessage(), e);
            }
        };

        String filename = "movements-" + LocalDate.now() + ".csv";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(body);
    }

    private String nullSafe(Object value) { return value != null ? value.toString() : ""; }

    private MovementStatus parseStatusOrNull(String s) {
        if (s == null || s.isBlank()) return null;
        try { return MovementStatus.valueOf(s.trim().toUpperCase()); }
        catch (IllegalArgumentException e) { return null; }
    }

    private MovementType parseTypeOrNull(String s) {
        if (s == null || s.isBlank()) return null;
        try { return MovementType.valueOf(s.trim().toUpperCase()); }
        catch (IllegalArgumentException e) { return null; }
    }

    private LocalDateTime parseDateTimeOrNull(String s) {
        if (s == null || s.isBlank()) return null;
        try {
            // Try as date first (add start of day)
            if (s.length() == 10) {
                return LocalDate.parse(s).atStartOfDay();
            }
            return LocalDateTime.parse(s);
        } catch (DateTimeParseException e) {
            return null;
        }
    }
}
