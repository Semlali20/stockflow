package com.stock.qualityservice.controller;

import com.stock.qualityservice.dto.request.InspectionResultRequest;
import com.stock.qualityservice.dto.response.InspectionResultResponse;
import com.stock.qualityservice.service.InspectionResultService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 📝 Inspection Result Controller
 * Manages individual test results within quality inspections
 */
@RestController
@RequestMapping("/api/inspection-results")
@RequiredArgsConstructor
@Slf4j
public class InspectionResultController {

    private final InspectionResultService inspectionResultService;

    /**
     * Create new inspection result
     */
    @PostMapping
    public ResponseEntity<InspectionResultResponse> createInspectionResult(@Valid @RequestBody InspectionResultRequest request) {
        log.info("📝 Creating inspection result for QC ID: {}", request.getQualityControlId());
        InspectionResultResponse response = inspectionResultService.createInspectionResult(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Update existing inspection result
     */
    @PutMapping("/{id}")
    public ResponseEntity<InspectionResultResponse> updateInspectionResult(
            @PathVariable String id,
            @Valid @RequestBody InspectionResultRequest request) {
        log.info("🔄 Updating inspection result ID: {}", id);
        InspectionResultResponse response = inspectionResultService.updateInspectionResult(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Get inspection result by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<InspectionResultResponse> getInspectionResultById(@PathVariable String id) {
        log.info("🔍 Fetching inspection result by ID: {}", id);
        InspectionResultResponse response = inspectionResultService.getInspectionResultById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Get inspection results by quality control ID
     */
    @GetMapping("/by-quality-control/{qualityControlId}")
    public ResponseEntity<List<InspectionResultResponse>> getInspectionResultsByQualityControlId(
            @PathVariable String qualityControlId) {
        log.info("🔍 Fetching inspection results for QC ID: {}", qualityControlId);
        List<InspectionResultResponse> responses = inspectionResultService.getInspectionResultsByQualityControlId(qualityControlId);
        return ResponseEntity.ok(responses);
    }

    /**
     * Get failed inspection results by quality control ID
     */
    @GetMapping("/by-quality-control/{qualityControlId}/failed")
    public ResponseEntity<List<InspectionResultResponse>> getFailedInspectionResults(
            @PathVariable String qualityControlId) {
        log.info("🔍 Fetching failed inspection results for QC ID: {}", qualityControlId);
        List<InspectionResultResponse> responses = inspectionResultService.getFailedInspectionResults(qualityControlId);
        return ResponseEntity.ok(responses);
    }

    /**
     * Delete inspection result
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInspectionResult(@PathVariable String id) {
        log.info("🗑️ Deleting inspection result ID: {}", id);
        inspectionResultService.deleteInspectionResult(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Delete all inspection results by quality control ID
     */
    @DeleteMapping("/by-quality-control/{qualityControlId}")
    public ResponseEntity<Void> deleteInspectionResultsByQualityControlId(
            @PathVariable String qualityControlId) {
        log.info("🗑️ Deleting all inspection results for QC ID: {}", qualityControlId);
        inspectionResultService.deleteInspectionResultsByQualityControlId(qualityControlId);
        return ResponseEntity.noContent().build();
    }
}
