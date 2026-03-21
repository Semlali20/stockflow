package com.stock.qualityservice.controller;

import com.stock.qualityservice.dto.request.RevelationRequest;
import com.stock.qualityservice.dto.response.RevelationResponse;
import com.stock.qualityservice.service.RevelationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 📋 Revelation Controller
 * Manages quality testing standards and acceptance criteria
 */
@RestController
@RequestMapping("/api/revelations")
@RequiredArgsConstructor
@Slf4j
public class RevelationController {

    private final RevelationService revelationService;

    /**
     * Create new revelation (testing standard)
     */
    @PostMapping
    public ResponseEntity<RevelationResponse> createRevelation(@Valid @RequestBody RevelationRequest request) {
        log.info("📝 Creating revelation: {}", request.getName());
        RevelationResponse response = revelationService.createRevelation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Update existing revelation
     */
    @PutMapping("/{id}")
    public ResponseEntity<RevelationResponse> updateRevelation(
            @PathVariable String id,
            @Valid @RequestBody RevelationRequest request) {
        log.info("🔄 Updating revelation ID: {}", id);
        RevelationResponse response = revelationService.updateRevelation(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Get revelation by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<RevelationResponse> getRevelationById(@PathVariable String id) {
        log.info("🔍 Fetching revelation by ID: {}", id);
        RevelationResponse response = revelationService.getRevelationById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all revelations with pagination
     */
    @GetMapping
    public ResponseEntity<Page<RevelationResponse>> getAllRevelations(Pageable pageable) {
        log.info("📋 Fetching all revelations");
        Page<RevelationResponse> responses = revelationService.getAllRevelations(pageable);
        return ResponseEntity.ok(responses);
    }

    /**
     * Get revelations by quality profile ID
     */
    @GetMapping("/by-profile/{qualityProfileId}")
    public ResponseEntity<List<RevelationResponse>> getRevelationsByQualityProfileId(
            @PathVariable String qualityProfileId) {
        log.info("🔍 Fetching revelations for quality profile: {}", qualityProfileId);
        List<RevelationResponse> responses = revelationService.getRevelationsByQualityProfileId(qualityProfileId);
        return ResponseEntity.ok(responses);
    }

    /**
     * Get mandatory revelations by quality profile ID
     */
    @GetMapping("/by-profile/{qualityProfileId}/mandatory")
    public ResponseEntity<List<RevelationResponse>> getMandatoryRevelations(
            @PathVariable String qualityProfileId) {
        log.info("🔍 Fetching mandatory revelations for quality profile: {}", qualityProfileId);
        List<RevelationResponse> responses = revelationService.getMandatoryRevelationsByQualityProfileId(qualityProfileId);
        return ResponseEntity.ok(responses);
    }

    /**
     * Get revelations by test type
     */
    @GetMapping("/by-type/{testType}")
    public ResponseEntity<List<RevelationResponse>> getRevelationsByTestType(@PathVariable String testType) {
        log.info("🔍 Fetching revelations by test type: {}", testType);
        List<RevelationResponse> responses = revelationService.getRevelationsByTestType(testType);
        return ResponseEntity.ok(responses);
    }

    /**
     * Search revelations by name
     */
    @GetMapping("/search")
    public ResponseEntity<List<RevelationResponse>> searchRevelationsByName(@RequestParam String name) {
        log.info("🔍 Searching revelations by name: {}", name);
        List<RevelationResponse> responses = revelationService.searchRevelationsByName(name);
        return ResponseEntity.ok(responses);
    }

    /**
     * Delete revelation
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRevelation(@PathVariable String id) {
        log.info("🗑️ Deleting revelation ID: {}", id);
        revelationService.deleteRevelation(id);
        return ResponseEntity.noContent().build();
    }
}
