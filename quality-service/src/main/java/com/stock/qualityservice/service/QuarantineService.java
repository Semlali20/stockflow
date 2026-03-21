package com.stock.qualityservice.service;

import com.stock.qualityservice.dto.request.QuarantineRequest;
import com.stock.qualityservice.dto.request.QuarantineUpdateRequest;
import com.stock.qualityservice.dto.response.QuarantineResponse;
import com.stock.qualityservice.dto.response.QuarantineSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface QuarantineService {

    QuarantineResponse createQuarantine(QuarantineRequest request);

    QuarantineResponse updateQuarantine(String id, QuarantineUpdateRequest request);

    QuarantineResponse getQuarantineById(String id);

    Page<QuarantineResponse> getAllQuarantines(Pageable pageable);

    List<QuarantineResponse> getQuarantinesByItemId(String itemId);

    List<QuarantineResponse> getQuarantinesByQualityControlId(String qualityControlId);

    Page<QuarantineResponse> getQuarantinesByStatus(String status, Pageable pageable);

    List<QuarantineResponse> getActiveQuarantines();

    List<QuarantineResponse> getQuarantinesByLocation(String locationId);

    List<QuarantineResponse> getQuarantinesExpiringSoon(int days);

    QuarantineResponse updateQuarantineStatus(String id, String status);

    QuarantineResponse releaseQuarantine(String id, String releaseNotes);

    QuarantineResponse rejectQuarantine(String id, String reason);

    QuarantineResponse extendQuarantine(String id, LocalDateTime newEndDate, String reason);

    void deleteQuarantine(String id);

    QuarantineSummaryResponse getQuarantineSummary();
}