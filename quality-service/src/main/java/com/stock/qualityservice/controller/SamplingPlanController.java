package com.stock.qualityservice.controller;

import com.stock.qualityservice.dto.request.SamplingPlanRequest;
import com.stock.qualityservice.dto.response.SamplingPlanResponse;
import com.stock.qualityservice.dto.response.SampleSizeCalculationResponse;
import com.stock.qualityservice.entity.SamplingType;
import com.stock.qualityservice.service.SamplingPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 📊 Sampling Plan Controller
 * Manages sampling strategies for quality inspections
 */
@RestController
@RequestMapping("/api/sampling-plans")
@RequiredArgsConstructor
@Slf4j
public class SamplingPlanController {

    private final SamplingPlanService samplingPlanService;

    /**
     * Create new sampling plan
     */
    @PostMapping
    public ResponseEntity<SamplingPlanResponse> createSamplingPlan(@Valid @RequestBody SamplingPlanRequest request) {
        log.info("📝 Creating sampling plan: {}", request.getName());
        SamplingPlanResponse response = samplingPlanService.createSamplingPlan(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Update existing sampling plan
     */
    @PutMapping("/{id}")
    public ResponseEntity<SamplingPlanResponse> updateSamplingPlan(
            @PathVariable String id,
            @Valid @RequestBody SamplingPlanRequest request) {
        log.info("🔄 Updating sampling plan ID: {}", id);
        SamplingPlanResponse response = samplingPlanService.updateSamplingPlan(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Get sampling plan by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<SamplingPlanResponse> getSamplingPlanById(@PathVariable String id) {
        log.info("🔍 Fetching sampling plan by ID: {}", id);
        SamplingPlanResponse response = samplingPlanService.getSamplingPlanById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all sampling plans
     */
    @GetMapping
    public ResponseEntity<List<SamplingPlanResponse>> getAllSamplingPlans() {
        log.info("📋 Fetching all sampling plans");
        List<SamplingPlanResponse> responses = samplingPlanService.getAllSamplingPlans();
        return ResponseEntity.ok(responses);
    }

    /**
     * Get sampling plans by type
     */
    @GetMapping("/by-type/{type}")
    public ResponseEntity<List<SamplingPlanResponse>> getSamplingPlansByType(@PathVariable String type) {
        log.info("🔍 Fetching sampling plans by type: {}", type);
        SamplingType samplingType = SamplingType.valueOf(type.toUpperCase());
        List<SamplingPlanResponse> responses = samplingPlanService.getSamplingPlansByType(samplingType);
        return ResponseEntity.ok(responses);
    }

    /**
     * Get active sampling plans
     */
    @GetMapping("/active")
    public ResponseEntity<List<SamplingPlanResponse>> getActiveSamplingPlans() {
        log.info("🔍 Fetching active sampling plans");
        List<SamplingPlanResponse> responses = samplingPlanService.getActiveSamplingPlans();
        return ResponseEntity.ok(responses);
    }

    /**
     * Get default sampling plan
     */
    @GetMapping("/default")
    public ResponseEntity<SamplingPlanResponse> getDefaultSamplingPlan() {
        log.info("🔍 Fetching default sampling plan");
        SamplingPlanResponse response = samplingPlanService.getDefaultSamplingPlan();
        return ResponseEntity.ok(response);
    }

    /**
     * Get sampling plan for lot size
     */
    @GetMapping("/for-lot-size/{lotSize}")
    public ResponseEntity<SamplingPlanResponse> getSamplingPlanForLotSize(@PathVariable Integer lotSize) {
        log.info("🔍 Fetching sampling plan for lot size: {}", lotSize);
        SamplingPlanResponse response = samplingPlanService.getSamplingPlanForLotSize(lotSize);
        return ResponseEntity.ok(response);
    }

    /**
     * Search sampling plans
     */
    @GetMapping("/search")
    public ResponseEntity<List<SamplingPlanResponse>> searchSamplingPlans(@RequestParam String keyword) {
        log.info("🔍 Searching sampling plans with keyword: {}", keyword);
        List<SamplingPlanResponse> responses = samplingPlanService.searchSamplingPlans(keyword);
        return ResponseEntity.ok(responses);
    }

    /**
     * Calculate sample size
     */
    @GetMapping("/calculate-sample-size")
    public ResponseEntity<SampleSizeCalculationResponse> calculateSampleSize(
            @RequestParam Integer lotSize,
            @RequestParam String inspectionLevel) {
        log.info("🔢 Calculating sample size for lot size: {} with inspection level: {}", lotSize, inspectionLevel);
        SampleSizeCalculationResponse response = samplingPlanService.calculateSampleSize(lotSize, inspectionLevel);
        return ResponseEntity.ok(response);
    }

    /**
     * Set default sampling plan
     */
    @PutMapping("/{id}/set-default")
    public ResponseEntity<Void> setDefaultSamplingPlan(@PathVariable String id) {
        log.info("🔧 Setting default sampling plan: {}", id);
        samplingPlanService.setDefaultSamplingPlan(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Activate sampling plan
     */
    @PutMapping("/{id}/activate")
    public ResponseEntity<Void> activateSamplingPlan(@PathVariable String id) {
        log.info("✅ Activating sampling plan: {}", id);
        samplingPlanService.activateSamplingPlan(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Deactivate sampling plan
     */
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateSamplingPlan(@PathVariable String id) {
        log.info("❌ Deactivating sampling plan: {}", id);
        samplingPlanService.deactivateSamplingPlan(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Delete sampling plan
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSamplingPlan(@PathVariable String id) {
        log.info("🗑️ Deleting sampling plan ID: {}", id);
        samplingPlanService.deleteSamplingPlan(id);
        return ResponseEntity.noContent().build();
    }
}
