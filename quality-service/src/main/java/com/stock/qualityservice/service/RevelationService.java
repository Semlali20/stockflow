package com.stock.qualityservice.service;

import com.stock.qualityservice.dto.request.RevelationRequest;
import com.stock.qualityservice.dto.response.RevelationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RevelationService {

    RevelationResponse createRevelation(RevelationRequest request);

    RevelationResponse updateRevelation(String id, RevelationRequest request);

    RevelationResponse getRevelationById(String id);

    Page<RevelationResponse> getAllRevelations(Pageable pageable);

    List<RevelationResponse> getRevelationsByQualityProfileId(String qualityProfileId);

    List<RevelationResponse> getMandatoryRevelationsByQualityProfileId(String qualityProfileId);

    List<RevelationResponse> getRevelationsByTestType(String testType);

    List<RevelationResponse> searchRevelationsByName(String name);

    void deleteRevelation(String id);
}
