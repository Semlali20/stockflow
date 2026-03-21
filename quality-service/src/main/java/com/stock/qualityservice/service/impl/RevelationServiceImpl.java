package com.stock.qualityservice.service.impl;

import com.stock.qualityservice.dto.request.RevelationRequest;
import com.stock.qualityservice.dto.response.RevelationResponse;
import com.stock.qualityservice.entity.Revelation;
import com.stock.qualityservice.entity.Revelation.TestType;
import com.stock.qualityservice.repository.RevelationRepository;
import com.stock.qualityservice.service.RevelationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RevelationServiceImpl implements RevelationService {

    private final RevelationRepository revelationRepository;

    @Override
    public RevelationResponse createRevelation(RevelationRequest request) {
        log.info("Creating revelation: {}", request.getName());

        if (revelationRepository.existsByName(request.getName())) {
            throw new RuntimeException("Revelation with name '" + request.getName() + "' already exists");
        }

        Revelation revelation = mapToEntity(request);
        Revelation saved = revelationRepository.save(revelation);

        log.info("Revelation created successfully with ID: {}", saved.getId());
        return mapToResponse(saved);
    }

    @Override
    public RevelationResponse updateRevelation(String id, RevelationRequest request) {
        log.info("Updating revelation ID: {}", id);

        UUID uuid = UUID.fromString(id);
        Revelation revelation = revelationRepository.findById(uuid)
                .orElseThrow(() -> new RuntimeException("Revelation not found with ID: " + id));

        updateEntityFromRequest(revelation, request);
        Revelation updated = revelationRepository.save(revelation);

        log.info("Revelation updated successfully: {}", id);
        return mapToResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public RevelationResponse getRevelationById(String id) {
        log.info("Fetching revelation by ID: {}", id);

        UUID uuid = UUID.fromString(id);
        Revelation revelation = revelationRepository.findById(uuid)
                .orElseThrow(() -> new RuntimeException("Revelation not found with ID: " + id));

        return mapToResponse(revelation);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RevelationResponse> getAllRevelations(Pageable pageable) {
        log.info("Fetching all revelations with pagination");
        return revelationRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RevelationResponse> getRevelationsByQualityProfileId(String qualityProfileId) {
        log.info("Fetching revelations for quality profile: {}", qualityProfileId);
        UUID uuid = UUID.fromString(qualityProfileId);
        return revelationRepository.findByQualityProfileId(uuid).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RevelationResponse> getMandatoryRevelationsByQualityProfileId(String qualityProfileId) {
        log.info("Fetching mandatory revelations for quality profile: {}", qualityProfileId);
        UUID uuid = UUID.fromString(qualityProfileId);
        return revelationRepository.findByQualityProfileIdAndIsMandatoryTrue(uuid).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RevelationResponse> getRevelationsByTestType(String testType) {
        log.info("Fetching revelations by test type: {}", testType);
        TestType type = TestType.valueOf(testType.toUpperCase());
        return revelationRepository.findByTestType(type).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RevelationResponse> searchRevelationsByName(String name) {
        log.info("Searching revelations by name: {}", name);
        return revelationRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteRevelation(String id) {
        log.info("Deleting revelation ID: {}", id);

        UUID uuid = UUID.fromString(id);
        if (!revelationRepository.existsById(uuid)) {
            throw new RuntimeException("Revelation not found with ID: " + id);
        }

        revelationRepository.deleteById(uuid);
        log.info("Revelation deleted successfully: {}", id);
    }

    // Helper methods
    private Revelation mapToEntity(RevelationRequest request) {
        Revelation revelation = new Revelation();
        revelation.setName(request.getName());
        revelation.setDescription(request.getDescription());
        if (request.getQualityProfileId() != null) {
            revelation.setQualityProfileId(UUID.fromString(request.getQualityProfileId()));
        }
        revelation.setTestType(TestType.valueOf(request.getTestType().toUpperCase()));
        revelation.setTestParameter(request.getTestParameter());
        revelation.setAcceptableMin(request.getAcceptableMin());
        revelation.setAcceptableMax(request.getAcceptableMax());
        revelation.setUnit(request.getUnit());
        revelation.setIsMandatory(request.getIsMandatory() != null ? request.getIsMandatory() : false);
        revelation.setTestInstructions(request.getTestInstructions());
        revelation.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        return revelation;
    }

    private void updateEntityFromRequest(Revelation revelation, RevelationRequest request) {
        if (request.getName() != null) {
            revelation.setName(request.getName());
        }
        if (request.getDescription() != null) {
            revelation.setDescription(request.getDescription());
        }
        if (request.getTestType() != null) {
            revelation.setTestType(TestType.valueOf(request.getTestType().toUpperCase()));
        }
        if (request.getTestParameter() != null) {
            revelation.setTestParameter(request.getTestParameter());
        }
        if (request.getAcceptableMin() != null) {
            revelation.setAcceptableMin(request.getAcceptableMin());
        }
        if (request.getAcceptableMax() != null) {
            revelation.setAcceptableMax(request.getAcceptableMax());
        }
        if (request.getUnit() != null) {
            revelation.setUnit(request.getUnit());
        }
        if (request.getIsMandatory() != null) {
            revelation.setIsMandatory(request.getIsMandatory());
        }
        if (request.getTestInstructions() != null) {
            revelation.setTestInstructions(request.getTestInstructions());
        }
        if (request.getIsActive() != null) {
            revelation.setIsActive(request.getIsActive());
        }
    }

    private RevelationResponse mapToResponse(Revelation revelation) {
        RevelationResponse response = new RevelationResponse();
        response.setId(revelation.getId() != null ? revelation.getId().toString() : null);
        response.setName(revelation.getName());
        response.setDescription(revelation.getDescription());
        response.setQualityProfileId(revelation.getQualityProfileId() != null ? revelation.getQualityProfileId().toString() : null);
        response.setTestType(revelation.getTestType() != null ? revelation.getTestType().toString() : null);
        response.setTestParameter(revelation.getTestParameter());
        response.setAcceptableMin(revelation.getAcceptableMin());
        response.setAcceptableMax(revelation.getAcceptableMax());
        response.setUnit(revelation.getUnit());
        response.setIsMandatory(revelation.getIsMandatory());
        response.setTestInstructions(revelation.getTestInstructions());
        response.setIsActive(revelation.getIsActive());
        response.setCreatedAt(revelation.getCreatedAt());
        response.setUpdatedAt(revelation.getUpdatedAt());
        response.setCreatedBy(revelation.getCreatedBy());
        response.setUpdatedBy(revelation.getUpdatedBy());
        return response;
    }
}
