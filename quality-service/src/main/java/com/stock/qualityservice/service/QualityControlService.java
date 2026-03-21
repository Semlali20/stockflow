package com.stock.qualityservice.service;

import com.stock.qualityservice.dto.request.QualityControlRequest;
import com.stock.qualityservice.dto.request.QualityControlUpdateRequest;
import com.stock.qualityservice.dto.response.QualityControlResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface QualityControlService {

    QualityControlResponse createQualityControl(QualityControlRequest request);

    QualityControlResponse updateQualityControl(String id, QualityControlUpdateRequest request);

    QualityControlResponse getQualityControlById(String id);

    Page<QualityControlResponse> getAllQualityControls(Pageable pageable);

    List<QualityControlResponse> getQualityControlsByProductId(String productId);

    List<QualityControlResponse> getQualityControlsByBatchNumber(String batchNumber);

    Page<QualityControlResponse> getQualityControlsByStatus(String status, Pageable pageable);

    List<QualityControlResponse> getQualityControlsByInspector(String inspectorId);

    List<QualityControlResponse> getQualityControlsByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    QualityControlResponse updateQualityControlStatus(String id, String status);

    QualityControlResponse approveQualityControl(String id);

    QualityControlResponse rejectQualityControl(String id, String reason);

    void deleteQualityControl(String id);
}