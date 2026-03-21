package com.stock.qualityservice.service.impl;

import com.stock.qualityservice.dto.request.SamplingPlanRequest;
import com.stock.qualityservice.dto.response.SamplingPlanResponse;
import com.stock.qualityservice.dto.response.SampleSizeCalculationResponse;
import com.stock.qualityservice.entity.SamplingPlan;
import com.stock.qualityservice.entity.SamplingType;
import com.stock.qualityservice.exception.SamplingPlanNotFoundException;

import com.stock.qualityservice.exception.BusinessRuleViolationException;
import com.stock.qualityservice.repository.SamplingPlanRepository;
import com.stock.qualityservice.service.SamplingPlanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.errors.DuplicateResourceException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SamplingPlanServiceImpl implements SamplingPlanService {

    private final SamplingPlanRepository samplingPlanRepository;

    @Override
    public SamplingPlanResponse createSamplingPlan(SamplingPlanRequest request) {
        log.info("Creating sampling plan: {}", request.getName());

        if (samplingPlanRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Sampling plan with name '" + request.getName() + "' already exists");
        }

        // Validate business rules
        validateSamplingPlanRules(request);

        SamplingPlan plan = mapToEntity(request);

        // If this is set as default, remove default from others
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            removeDefaultFromOtherPlans();
        }

        SamplingPlan savedPlan = samplingPlanRepository.save(plan);

        log.info("Sampling plan created successfully with ID: {}", savedPlan.getId());
        return mapToResponse(savedPlan);
    }

    @Override
    public SamplingPlanResponse updateSamplingPlan(String id, SamplingPlanRequest request) {
        log.info("Updating sampling plan ID: {}", id);

        SamplingPlan plan = samplingPlanRepository.findById(id)
                .orElseThrow(() -> new SamplingPlanNotFoundException(id));

        // Check for duplicate name (excluding current plan)
        if (!plan.getName().equals(request.getName()) &&
                samplingPlanRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Sampling plan with name '" + request.getName() + "' already exists");
        }

        // Validate business rules
        validateSamplingPlanRules(request);

        updateEntityFromRequest(plan, request);

        // If this is set as default, remove default from others
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            removeDefaultFromOtherPlans();
        }

        SamplingPlan updatedPlan = samplingPlanRepository.save(plan);

        log.info("Sampling plan updated successfully: {}", id);
        return mapToResponse(updatedPlan);
    }

    @Override
    @Transactional(readOnly = true)
    public SamplingPlanResponse getSamplingPlanById(String id) {
        log.info("Fetching sampling plan by ID: {}", id);

        SamplingPlan plan = samplingPlanRepository.findById(id)
                .orElseThrow(() -> new SamplingPlanNotFoundException(id));

        return mapToResponse(plan);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SamplingPlanResponse> getAllSamplingPlans() {
        log.info("Fetching all sampling plans");

        return samplingPlanRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SamplingPlanResponse> getSamplingPlansByType(SamplingType type) {
        log.info("Fetching sampling plans by type: {}", type);

        return samplingPlanRepository.findBySamplingType(type).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SamplingPlanResponse> getActiveSamplingPlans() {
        log.info("Fetching active sampling plans");

        return samplingPlanRepository.findAllActiveSamplingPlans().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SamplingPlanResponse getDefaultSamplingPlan() {
        log.info("Fetching default sampling plan");

        SamplingPlan plan = samplingPlanRepository.findDefaultSamplingPlan()
                .orElseThrow(() -> new SamplingPlanNotFoundException("No default sampling plan found"));

        return mapToResponse(plan);
    }

    @Override
    @Transactional(readOnly = true)
    public SamplingPlanResponse getSamplingPlanForLotSize(Integer lotSize) {
        log.info("Fetching sampling plan for lot size: {}", lotSize);

        List<SamplingPlan> plans = samplingPlanRepository.findByLotSize(lotSize);

        if (plans.isEmpty()) {
            throw new SamplingPlanNotFoundException("No sampling plan found for lot size: " + lotSize);
        }

        // Return the first matching plan (could be enhanced with priority logic)
        return mapToResponse(plans.get(0));
    }

    @Override
    @Transactional(readOnly = true)
    public SampleSizeCalculationResponse calculateSampleSize(Integer lotSize, String inspectionLevel) {
        log.info("Calculating sample size for lot size: {} and inspection level: {}", lotSize, inspectionLevel);

        SamplingPlan plan = samplingPlanRepository.findByLotSizeAndInspectionLevel(lotSize, inspectionLevel)
                .orElse(samplingPlanRepository.findDefaultSamplingPlan()
                        .orElseThrow(() -> new SamplingPlanNotFoundException("No suitable sampling plan found")));

        SampleSizeCalculationResponse response = new SampleSizeCalculationResponse();
        response.setLotSize(lotSize);
        response.setSamplingPlanId(plan.getId());
        response.setSamplingPlanName(plan.getName());
        response.setSamplingType(plan.getSamplingType().name());
        response.setInspectionLevel(plan.getInspectionLevel());
        response.setAqlPercentage(plan.getAqlPercentage());

        // Calculate sample size
        Integer sampleSize = calculateActualSampleSize(plan, lotSize);
        response.setSampleSize(sampleSize);
        response.setAcceptNumber(plan.getAcceptNumber());
        response.setRejectNumber(plan.getRejectNumber());

        return response;
    }

    @Override
    public void deleteSamplingPlan(String id) {
        log.info("Deleting sampling plan ID: {}", id);

        SamplingPlan plan = samplingPlanRepository.findById(id)
                .orElseThrow(() -> new SamplingPlanNotFoundException(id));

        if (Boolean.TRUE.equals(plan.getIsDefault())) {
            throw new BusinessRuleViolationException(
                    "Cannot delete default sampling plan",
                    "Please set another plan as default before deleting this one"
            );
        }

        samplingPlanRepository.deleteById(id);
        log.info("Sampling plan deleted successfully: {}", id);
    }

    @Override
    public void setDefaultSamplingPlan(String id) {
        log.info("Setting sampling plan as default: {}", id);

        SamplingPlan plan = samplingPlanRepository.findById(id)
                .orElseThrow(() -> new SamplingPlanNotFoundException(id));

        // Remove default from all other plans
        removeDefaultFromOtherPlans();

        // Set this plan as default
        plan.setIsDefault(true);
        plan.setIsActive(true); // Ensure default plan is active
        samplingPlanRepository.save(plan);

        log.info("Sampling plan set as default successfully: {}", id);
    }

    @Override
    public void activateSamplingPlan(String id) {
        log.info("Activating sampling plan ID: {}", id);

        SamplingPlan plan = samplingPlanRepository.findById(id)
                .orElseThrow(() -> new SamplingPlanNotFoundException(id));

        plan.setIsActive(true);
        samplingPlanRepository.save(plan);

        log.info("Sampling plan activated successfully: {}", id);
    }

    @Override
    public void deactivateSamplingPlan(String id) {
        log.info("Deactivating sampling plan ID: {}", id);

        SamplingPlan plan = samplingPlanRepository.findById(id)
                .orElseThrow(() -> new SamplingPlanNotFoundException(id));

        if (Boolean.TRUE.equals(plan.getIsDefault())) {
            throw new BusinessRuleViolationException(
                    "Cannot deactivate default sampling plan",
                    "Please set another plan as default before deactivating this one"
            );
        }

        plan.setIsActive(false);
        samplingPlanRepository.save(plan);

        log.info("Sampling plan deactivated successfully: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SamplingPlanResponse> searchSamplingPlans(String keyword) {
        log.info("Searching sampling plans with keyword: {}", keyword);

        return samplingPlanRepository.searchSamplingPlans(keyword).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Helper methods
    private void validateSamplingPlanRules(SamplingPlanRequest request) {
        // Validate lot size range
        if (request.getLotSizeMin() != null && request.getLotSizeMax() != null) {
            if (request.getLotSizeMin() > request.getLotSizeMax()) {
                throw new BusinessRuleViolationException(
                        "Invalid lot size range",
                        "Minimum lot size cannot be greater than maximum lot size"
                );
            }
        }

        // Validate sample size
        if (request.getSampleSize() != null && request.getLotSizeMin() != null) {
            if (request.getSampleSize() > request.getLotSizeMin()) {
                throw new BusinessRuleViolationException(
                        "Invalid sample size",
                        "Sample size cannot exceed minimum lot size"
                );
            }
        }

        // Validate accept/reject numbers
        if (request.getAcceptNumber() != null && request.getRejectNumber() != null) {
            if (request.getAcceptNumber() >= request.getRejectNumber()) {
                throw new BusinessRuleViolationException(
                        "Invalid accept/reject numbers",
                        "Accept number must be less than reject number"
                );
            }
        }

        // Validate AQL percentage
        if (request.getAqlPercentage() != null) {
            if (request.getAqlPercentage() < 0 || request.getAqlPercentage() > 100) {
                throw new BusinessRuleViolationException(
                        "Invalid AQL percentage",
                        "AQL percentage must be between 0 and 100"
                );
            }
        }
    }

    private void removeDefaultFromOtherPlans() {
        List<SamplingPlan> allPlans = samplingPlanRepository.findAll();
        for (SamplingPlan plan : allPlans) {
            if (Boolean.TRUE.equals(plan.getIsDefault())) {
                plan.setIsDefault(false);
                samplingPlanRepository.save(plan);
            }
        }
    }

    private Integer calculateActualSampleSize(SamplingPlan plan, Integer lotSize) {
        // If sample size is explicitly defined, use it
        if (plan.getSampleSize() != null) {
            return plan.getSampleSize();
        }

        // If percentage is defined, calculate based on lot size
        if (plan.getSamplePercentage() != null) {
            return (int) Math.ceil(lotSize * plan.getSamplePercentage() / 100.0);
        }

        // Default: use standard sampling tables logic (simplified)
        // In production, this should follow ANSI/ASQ Z1.4 or ISO 2859 standards
        if (lotSize <= 50) return 5;
        if (lotSize <= 150) return 13;
        if (lotSize <= 280) return 20;
        if (lotSize <= 500) return 32;
        if (lotSize <= 1200) return 50;
        if (lotSize <= 3200) return 80;
        if (lotSize <= 10000) return 125;
        return 200;
    }

    private SamplingPlan mapToEntity(SamplingPlanRequest request) {
        SamplingPlan plan = new SamplingPlan();
        plan.setName(request.getName());
        plan.setDescription(request.getDescription());
        plan.setSamplingType(request.getSamplingType());
        plan.setInspectionLevel(request.getInspectionLevel());
        plan.setAqlPercentage(request.getAqlPercentage());
        plan.setLotSizeMin(request.getLotSizeMin());
        plan.setLotSizeMax(request.getLotSizeMax());
        plan.setSampleSize(request.getSampleSize());
        plan.setSamplePercentage(request.getSamplePercentage());
        plan.setAcceptNumber(request.getAcceptNumber());
        plan.setRejectNumber(request.getRejectNumber());
        plan.setSecondSampleSize(request.getSecondSampleSize());
        plan.setSecondAcceptNumber(request.getSecondAcceptNumber());
        plan.setSecondRejectNumber(request.getSecondRejectNumber());
        plan.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        plan.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : false);
        return plan;
    }

    private void updateEntityFromRequest(SamplingPlan plan, SamplingPlanRequest request) {
        plan.setName(request.getName());
        plan.setDescription(request.getDescription());
        plan.setSamplingType(request.getSamplingType());
        plan.setInspectionLevel(request.getInspectionLevel());
        plan.setAqlPercentage(request.getAqlPercentage());
        plan.setLotSizeMin(request.getLotSizeMin());
        plan.setLotSizeMax(request.getLotSizeMax());
        plan.setSampleSize(request.getSampleSize());
        plan.setSamplePercentage(request.getSamplePercentage());
        plan.setAcceptNumber(request.getAcceptNumber());
        plan.setRejectNumber(request.getRejectNumber());
        plan.setSecondSampleSize(request.getSecondSampleSize());
        plan.setSecondAcceptNumber(request.getSecondAcceptNumber());
        plan.setSecondRejectNumber(request.getSecondRejectNumber());
        if (request.getIsActive() != null) {
            plan.setIsActive(request.getIsActive());
        }
        if (request.getIsDefault() != null) {
            plan.setIsDefault(request.getIsDefault());
        }
    }

    private SamplingPlanResponse mapToResponse(SamplingPlan plan) {
        SamplingPlanResponse response = new SamplingPlanResponse();
        response.setId(plan.getId());
        response.setName(plan.getName());
        response.setDescription(plan.getDescription());
        response.setSamplingType(plan.getSamplingType());
        response.setInspectionLevel(plan.getInspectionLevel());
        response.setAqlPercentage(plan.getAqlPercentage());
        response.setLotSizeMin(plan.getLotSizeMin());
        response.setLotSizeMax(plan.getLotSizeMax());
        response.setSampleSize(plan.getSampleSize());
        response.setSamplePercentage(plan.getSamplePercentage());
        response.setAcceptNumber(plan.getAcceptNumber());
        response.setRejectNumber(plan.getRejectNumber());
        response.setSecondSampleSize(plan.getSecondSampleSize());
        response.setSecondAcceptNumber(plan.getSecondAcceptNumber());
        response.setSecondRejectNumber(plan.getSecondRejectNumber());
        response.setIsActive(plan.getIsActive());
        response.setIsDefault(plan.getIsDefault());
        response.setCreatedAt(plan.getCreatedAt());
        response.setUpdatedAt(plan.getUpdatedAt());
        response.setCreatedBy(plan.getCreatedBy());
        response.setUpdatedBy(plan.getUpdatedBy());
        return response;
    }
}