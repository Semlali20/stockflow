package com.stock.qualityservice.service;

import com.stock.qualityservice.dto.request.QualityProfileRequest;
import com.stock.qualityservice.dto.response.QualityProfileResponse;
import com.stock.qualityservice.entity.QualityProfileType;

import java.util.List;

public interface QualityProfileService {

    QualityProfileResponse createQualityProfile(QualityProfileRequest request);

    QualityProfileResponse updateQualityProfile(String id, QualityProfileRequest request);

    QualityProfileResponse getQualityProfileById(String id);

    List<QualityProfileResponse> getAllQualityProfiles();

    List<QualityProfileResponse> getQualityProfilesByItemId(String itemId);

    List<QualityProfileResponse> getQualityProfilesByCategoryId(String categoryId);

    List<QualityProfileResponse> getQualityProfilesByType(QualityProfileType type);

    List<QualityProfileResponse> getActiveQualityProfiles();

    QualityProfileResponse getActiveProfileByItemId(String itemId);

    void deleteQualityProfile(String id);

    void activateQualityProfile(String id);

    void deactivateQualityProfile(String id);

    List<QualityProfileResponse> searchQualityProfiles(String keyword);
}