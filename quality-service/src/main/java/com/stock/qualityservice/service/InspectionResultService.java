package com.stock.qualityservice.service;

import com.stock.qualityservice.dto.request.InspectionResultRequest;
import com.stock.qualityservice.dto.response.InspectionResultResponse;

import java.util.List;

public interface InspectionResultService {

    InspectionResultResponse createInspectionResult(InspectionResultRequest request);

    InspectionResultResponse updateInspectionResult(String id, InspectionResultRequest request);

    InspectionResultResponse getInspectionResultById(String id);

    List<InspectionResultResponse> getInspectionResultsByQualityControlId(String qualityControlId);

    List<InspectionResultResponse> getFailedInspectionResults(String qualityControlId);

    void deleteInspectionResult(String id);

    void deleteInspectionResultsByQualityControlId(String qualityControlId);
}
