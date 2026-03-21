package com.stock.qualityservice.service.impl;

import com.stock.qualityservice.dto.request.InspectionResultRequest;
import com.stock.qualityservice.dto.response.InspectionResultResponse;
import com.stock.qualityservice.entity.InspectionResult;
import com.stock.qualityservice.entity.QualityControl;
import com.stock.qualityservice.repository.InspectionResultRepository;
import com.stock.qualityservice.repository.QualityControlRepository;
import com.stock.qualityservice.service.InspectionResultService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class InspectionResultServiceImpl implements InspectionResultService {

    private final InspectionResultRepository inspectionResultRepository;
    private final QualityControlRepository qualityControlRepository;

    @Override
    public InspectionResultResponse createInspectionResult(InspectionResultRequest request) {
        log.info("Creating inspection result for QC ID: {}", request.getQualityControlId());

        QualityControl qualityControl = qualityControlRepository.findById(request.getQualityControlId())
                .orElseThrow(() -> new RuntimeException("Quality Control not found with ID: " + request.getQualityControlId()));

        InspectionResult result = mapToEntity(request, qualityControl);
        InspectionResult saved = inspectionResultRepository.save(result);

        log.info("Inspection result created successfully with ID: {}", saved.getId());
        return mapToResponse(saved);
    }

    @Override
    public InspectionResultResponse updateInspectionResult(String id, InspectionResultRequest request) {
        log.info("Updating inspection result ID: {}", id);

        InspectionResult result = inspectionResultRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inspection Result not found with ID: " + id));

        updateEntityFromRequest(result, request);
        InspectionResult updated = inspectionResultRepository.save(result);

        log.info("Inspection result updated successfully: {}", id);
        return mapToResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public InspectionResultResponse getInspectionResultById(String id) {
        log.info("Fetching inspection result by ID: {}", id);

        InspectionResult result = inspectionResultRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inspection Result not found with ID: " + id));

        return mapToResponse(result);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InspectionResultResponse> getInspectionResultsByQualityControlId(String qualityControlId) {
        log.info("Fetching inspection results for QC ID: {}", qualityControlId);

        QualityControl qualityControl = qualityControlRepository.findById(qualityControlId)
                .orElseThrow(() -> new RuntimeException("Quality Control not found with ID: " + qualityControlId));

        return inspectionResultRepository.findByQualityControl(qualityControl).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InspectionResultResponse> getFailedInspectionResults(String qualityControlId) {
        log.info("Fetching failed inspection results for QC ID: {}", qualityControlId);

        QualityControl qualityControl = qualityControlRepository.findById(qualityControlId)
                .orElseThrow(() -> new RuntimeException("Quality Control not found with ID: " + qualityControlId));

        return inspectionResultRepository.findByQualityControlAndIsPassedFalse(qualityControl).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteInspectionResult(String id) {
        log.info("Deleting inspection result ID: {}", id);

        if (!inspectionResultRepository.existsById(id)) {
            throw new RuntimeException("Inspection Result not found with ID: " + id);
        }

        inspectionResultRepository.deleteById(id);
        log.info("Inspection result deleted successfully: {}", id);
    }

    @Override
    public void deleteInspectionResultsByQualityControlId(String qualityControlId) {
        log.info("Deleting all inspection results for QC ID: {}", qualityControlId);

        QualityControl qualityControl = qualityControlRepository.findById(qualityControlId)
                .orElseThrow(() -> new RuntimeException("Quality Control not found with ID: " + qualityControlId));

        inspectionResultRepository.deleteByQualityControl(qualityControl);
        log.info("All inspection results deleted successfully for QC ID: {}", qualityControlId);
    }

    // Helper methods
    private InspectionResult mapToEntity(InspectionResultRequest request, QualityControl qualityControl) {
        InspectionResult result = new InspectionResult();
        result.setQualityControl(qualityControl);
        result.setTestParameter(request.getTestParameter());
        result.setExpectedValue(request.getExpectedValue());
        result.setActualValue(request.getActualValue());
        result.setUnitOfMeasure(request.getUnitOfMeasure());
        result.setMinValue(request.getMinValue());
        result.setMaxValue(request.getMaxValue());
        result.setIsPassed(request.getIsPassed() != null ? request.getIsPassed() : false);
        result.setDefectType(request.getDefectType());
        result.setDefectSeverity(request.getDefectSeverity());
        result.setRemarks(request.getRemarks());
        result.setSequenceOrder(request.getSequenceOrder());
        return result;
    }

    private void updateEntityFromRequest(InspectionResult result, InspectionResultRequest request) {
        if (request.getTestParameter() != null) {
            result.setTestParameter(request.getTestParameter());
        }
        if (request.getExpectedValue() != null) {
            result.setExpectedValue(request.getExpectedValue());
        }
        if (request.getActualValue() != null) {
            result.setActualValue(request.getActualValue());
        }
        if (request.getUnitOfMeasure() != null) {
            result.setUnitOfMeasure(request.getUnitOfMeasure());
        }
        if (request.getMinValue() != null) {
            result.setMinValue(request.getMinValue());
        }
        if (request.getMaxValue() != null) {
            result.setMaxValue(request.getMaxValue());
        }
        if (request.getIsPassed() != null) {
            result.setIsPassed(request.getIsPassed());
        }
        if (request.getDefectType() != null) {
            result.setDefectType(request.getDefectType());
        }
        if (request.getDefectSeverity() != null) {
            result.setDefectSeverity(request.getDefectSeverity());
        }
        if (request.getRemarks() != null) {
            result.setRemarks(request.getRemarks());
        }
        if (request.getSequenceOrder() != null) {
            result.setSequenceOrder(request.getSequenceOrder());
        }
    }

    private InspectionResultResponse mapToResponse(InspectionResult result) {
        InspectionResultResponse response = new InspectionResultResponse();
        response.setId(result.getId());
        response.setQualityControlId(result.getQualityControl().getId());
        response.setTestParameter(result.getTestParameter());
        response.setExpectedValue(result.getExpectedValue());
        response.setActualValue(result.getActualValue());
        response.setUnitOfMeasure(result.getUnitOfMeasure());
        response.setMinValue(result.getMinValue());
        response.setMaxValue(result.getMaxValue());
        response.setIsPassed(result.getIsPassed());
        response.setDefectType(result.getDefectType());
        response.setDefectSeverity(result.getDefectSeverity());
        response.setRemarks(result.getRemarks());
        response.setSequenceOrder(result.getSequenceOrder());
        response.setCreatedAt(result.getCreatedAt());
        return response;
    }
}
