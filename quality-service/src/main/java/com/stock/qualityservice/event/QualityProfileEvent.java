package com.stock.qualityservice.event;

import com.stock.qualityservice.entity.QualityProfileType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QualityProfileEvent {

    private String eventId;
    private String eventType; // PROFILE_CREATED, PROFILE_UPDATED, PROFILE_DELETED
    private LocalDateTime eventTime;

    private String profileId;
    private String name;
    private String itemId;
    private String categoryId;
    private QualityProfileType profileType;
    private String inspectionCriteria;
    private Double passThreshold;
    private Double failThreshold;
    private Boolean isActive;
}