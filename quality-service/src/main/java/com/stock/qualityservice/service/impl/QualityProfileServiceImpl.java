package com.stock.qualityservice.service.impl;

import com.stock.qualityservice.dto.request.QualityProfileRequest;
import com.stock.qualityservice.dto.response.QualityProfileResponse;
import com.stock.qualityservice.entity.QualityProfile;
import com.stock.qualityservice.entity.QualityProfileType;
import com.stock.qualityservice.exception.QualityProfileNotFoundException;

import com.stock.qualityservice.repository.QualityProfileRepository;
import com.stock.qualityservice.service.QualityProfileService;
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
public class QualityProfileServiceImpl implements QualityProfileService {

    private final QualityProfileRepository qualityProfileRepository;

    @Override
    public QualityProfileResponse createQualityProfile(QualityProfileRequest request) {
        log.info("Creating quality profile: {}", request.getName());

        if (qualityProfileRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Quality profile with name '" + request.getName() + "' already exists");
        }

        QualityProfile profile = mapToEntity(request);
        QualityProfile savedProfile = qualityProfileRepository.save(profile);

        log.info("Quality profile created successfully with ID: {}", savedProfile.getId());
        return mapToResponse(savedProfile);
    }

    @Override
    public QualityProfileResponse updateQualityProfile(String id, QualityProfileRequest request) {
        log.info("Updating quality profile ID: {}", id);

        QualityProfile profile = qualityProfileRepository.findById(id)
                .orElseThrow(() -> new QualityProfileNotFoundException(id));

        // Check for duplicate name (excluding current profile)
        if (!profile.getName().equals(request.getName()) &&
                qualityProfileRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Quality profile with name '" + request.getName() + "' already exists");
        }

        updateEntityFromRequest(profile, request);
        QualityProfile updatedProfile = qualityProfileRepository.save(profile);

        log.info("Quality profile updated successfully: {}", id);
        return mapToResponse(updatedProfile);
    }

    @Override
    @Transactional(readOnly = true)
    public QualityProfileResponse getQualityProfileById(String id) {
        log.info("Fetching quality profile by ID: {}", id);

        QualityProfile profile = qualityProfileRepository.findById(id)
                .orElseThrow(() -> new QualityProfileNotFoundException(id));

        return mapToResponse(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QualityProfileResponse> getAllQualityProfiles() {
        log.info("Fetching all quality profiles");

        return qualityProfileRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QualityProfileResponse> getQualityProfilesByItemId(String itemId) {
        log.info("Fetching quality profiles for item ID: {}", itemId);

        return qualityProfileRepository.findByItemId(itemId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QualityProfileResponse> getQualityProfilesByCategoryId(String categoryId) {
        log.info("Fetching quality profiles for category ID: {}", categoryId);

        return qualityProfileRepository.findByCategoryId(categoryId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QualityProfileResponse> getQualityProfilesByType(QualityProfileType type) {
        log.info("Fetching quality profiles by type: {}", type);

        return qualityProfileRepository.findByProfileType(type).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QualityProfileResponse> getActiveQualityProfiles() {
        log.info("Fetching active quality profiles");

        return qualityProfileRepository.findAllActiveProfiles().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public QualityProfileResponse getActiveProfileByItemId(String itemId) {
        log.info("Fetching active quality profile for item ID: {}", itemId);

        QualityProfile profile = qualityProfileRepository.findActiveProfileByItemId(itemId)
                .orElseThrow(() -> new QualityProfileNotFoundException("itemId", itemId));

        return mapToResponse(profile);
    }

    @Override
    public void deleteQualityProfile(String id) {
        log.info("Deleting quality profile ID: {}", id);

        if (!qualityProfileRepository.existsById(id)) {
            throw new QualityProfileNotFoundException(id);
        }

        qualityProfileRepository.deleteById(id);
        log.info("Quality profile deleted successfully: {}", id);
    }

    @Override
    public void activateQualityProfile(String id) {
        log.info("Activating quality profile ID: {}", id);

        QualityProfile profile = qualityProfileRepository.findById(id)
                .orElseThrow(() -> new QualityProfileNotFoundException(id));

        profile.setIsActive(true);
        qualityProfileRepository.save(profile);

        log.info("Quality profile activated successfully: {}", id);
    }

    @Override
    public void deactivateQualityProfile(String id) {
        log.info("Deactivating quality profile ID: {}", id);

        QualityProfile profile = qualityProfileRepository.findById(id)
                .orElseThrow(() -> new QualityProfileNotFoundException(id));

        profile.setIsActive(false);
        qualityProfileRepository.save(profile);

        log.info("Quality profile deactivated successfully: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QualityProfileResponse> searchQualityProfiles(String keyword) {
        log.info("Searching quality profiles with keyword: {}", keyword);

        return qualityProfileRepository.searchQualityProfiles(keyword).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Helper methods
    private QualityProfile mapToEntity(QualityProfileRequest request) {
        QualityProfile profile = new QualityProfile();
        profile.setName(request.getName());
        profile.setDescription(request.getDescription());
        profile.setItemId(request.getItemId());
        profile.setCategoryId(request.getCategoryId());
        profile.setProfileType(request.getProfileType());
        profile.setInspectionCriteria(request.getInspectionCriteria());
        profile.setPassThreshold(request.getPassThreshold());
        profile.setFailThreshold(request.getFailThreshold());
        profile.setSamplingPlanId(request.getSamplingPlanId());
        profile.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        profile.setVersion(request.getVersion() != null ? request.getVersion() : 1);
        return profile;
    }

    private void updateEntityFromRequest(QualityProfile profile, QualityProfileRequest request) {
        profile.setName(request.getName());
        profile.setDescription(request.getDescription());
        profile.setItemId(request.getItemId());
        profile.setCategoryId(request.getCategoryId());
        profile.setProfileType(request.getProfileType());
        profile.setInspectionCriteria(request.getInspectionCriteria());
        profile.setPassThreshold(request.getPassThreshold());
        profile.setFailThreshold(request.getFailThreshold());
        profile.setSamplingPlanId(request.getSamplingPlanId());
        if (request.getIsActive() != null) {
            profile.setIsActive(request.getIsActive());
        }
        if (request.getVersion() != null) {
            profile.setVersion(request.getVersion());
        }
    }

    private QualityProfileResponse mapToResponse(QualityProfile profile) {
        QualityProfileResponse response = new QualityProfileResponse();
        response.setId(profile.getId());
        response.setName(profile.getName());
        response.setDescription(profile.getDescription());
        response.setItemId(profile.getItemId());
        response.setCategoryId(profile.getCategoryId());
        response.setProfileType(profile.getProfileType());
        response.setInspectionCriteria(profile.getInspectionCriteria());
        response.setPassThreshold(profile.getPassThreshold());
        response.setFailThreshold(profile.getFailThreshold());
        response.setSamplingPlanId(profile.getSamplingPlanId());
        response.setIsActive(profile.getIsActive());
        response.setVersion(profile.getVersion());
        response.setCreatedAt(profile.getCreatedAt());
        response.setUpdatedAt(profile.getUpdatedAt());
        response.setCreatedBy(profile.getCreatedBy());
        response.setUpdatedBy(profile.getUpdatedBy());
        return response;
    }
}