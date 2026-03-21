package com.stock.qualityservice.service;

import com.stock.qualityservice.dto.request.SamplingPlanRequest;
import com.stock.qualityservice.dto.response.SamplingPlanResponse;
import com.stock.qualityservice.dto.response.SampleSizeCalculationResponse;
import com.stock.qualityservice.entity.SamplingType;

import java.util.List;

public interface SamplingPlanService {

    SamplingPlanResponse createSamplingPlan(SamplingPlanRequest request);

    SamplingPlanResponse updateSamplingPlan(String id, SamplingPlanRequest request);

    SamplingPlanResponse getSamplingPlanById(String id);

    List<SamplingPlanResponse> getAllSamplingPlans();

    List<SamplingPlanResponse> getSamplingPlansByType(SamplingType type);

    List<SamplingPlanResponse> getActiveSamplingPlans();

    SamplingPlanResponse getDefaultSamplingPlan();

    SamplingPlanResponse getSamplingPlanForLotSize(Integer lotSize);

    SampleSizeCalculationResponse calculateSampleSize(Integer lotSize, String inspectionLevel);

    void deleteSamplingPlan(String id);

    void setDefaultSamplingPlan(String id);

    void activateSamplingPlan(String id);

    void deactivateSamplingPlan(String id);

    List<SamplingPlanResponse> searchSamplingPlans(String keyword);
}