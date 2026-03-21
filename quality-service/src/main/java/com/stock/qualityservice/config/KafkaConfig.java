package com.stock.qualityservice.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    // ============================================================
    // INCOMING TOPICS (Quality Service CONSUMES from other services)
    // ============================================================

    // From Product/Inventory Service - Item Events
    public static final String ITEM_CREATED_TOPIC = "item.created";
    public static final String ITEM_UPDATED_TOPIC = "item.updated";
    public static final String ITEM_DELETED_TOPIC = "item.deleted";

    // From Product Service - Category Events
    public static final String CATEGORY_CREATED_TOPIC = "category.created";
    public static final String CATEGORY_UPDATED_TOPIC = "category.updated";
    public static final String CATEGORY_DELETED_TOPIC = "category.deleted";

    // From Inventory Service - Movement/Receipt Events
    public static final String MOVEMENT_RECEIVED_TOPIC = "inventory.movement.received";
    public static final String LOT_CREATED_TOPIC = "inventory.lot.created";

    // ============================================================
    // OUTGOING TOPICS (Quality Service PRODUCES to other services)
    // ============================================================

    // Quality Inspection Events
    public static final String QUALITY_INSPECTION_CREATED = "quality.inspection.created";
    public static final String QUALITY_INSPECTION_COMPLETED = "quality.inspection.completed";
    public static final String QUALITY_INSPECTION_FAILED = "quality.inspection.failed";

    // Quarantine Events
    public static final String QUARANTINE_CREATED = "quality.quarantine.created";
    public static final String QUARANTINE_RELEASED = "quality.quarantine.released";
    public static final String QUARANTINE_REJECTED = "quality.quarantine.rejected";

    // Quality Status Updates (to Inventory Service)
    public static final String ITEM_APPROVED = "quality.item.approved";
    public static final String ITEM_REJECTED = "quality.item.rejected";
    public static final String INVENTORY_STATUS_UPDATE = "quality.inventory.status.update";

    // Quality Alerts & Defects
    public static final String QUALITY_ALERT = "quality.alert";
    public static final String DEFECT_REPORTED = "quality.defect.reported";

    // Quality Metrics (for reporting/analytics)
    public static final String QUALITY_METRICS = "quality.metrics";

    // ============================================================
    // TOPIC BEAN DEFINITIONS
    // ============================================================
    // Note: We only create topics that THIS service produces
    // Incoming topics are created by their respective services

    // Quality Inspection Topics
    @Bean
    public NewTopic qualityInspectionCreatedTopic() {
        return TopicBuilder.name(QUALITY_INSPECTION_CREATED)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic qualityInspectionCompletedTopic() {
        return TopicBuilder.name(QUALITY_INSPECTION_COMPLETED)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic qualityInspectionFailedTopic() {
        return TopicBuilder.name(QUALITY_INSPECTION_FAILED)
                .partitions(3)
                .replicas(1)
                .build();
    }

    // Quarantine Topics
    @Bean
    public NewTopic quarantineCreatedTopic() {
        return TopicBuilder.name(QUARANTINE_CREATED)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic quarantineReleasedTopic() {
        return TopicBuilder.name(QUARANTINE_RELEASED)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic quarantineRejectedTopic() {
        return TopicBuilder.name(QUARANTINE_REJECTED)
                .partitions(3)
                .replicas(1)
                .build();
    }

    // Item Status Topics
    @Bean
    public NewTopic itemApprovedTopic() {
        return TopicBuilder.name(ITEM_APPROVED)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic itemRejectedTopic() {
        return TopicBuilder.name(ITEM_REJECTED)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic inventoryStatusUpdateTopic() {
        return TopicBuilder.name(INVENTORY_STATUS_UPDATE)
                .partitions(3)
                .replicas(1)
                .build();
    }

    // Quality Alert Topics
    @Bean
    public NewTopic qualityAlertTopic() {
        return TopicBuilder.name(QUALITY_ALERT)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic defectReportedTopic() {
        return TopicBuilder.name(DEFECT_REPORTED)
                .partitions(3)
                .replicas(1)
                .build();
    }

    // Quality Metrics Topic
    @Bean
    public NewTopic qualityMetricsTopic() {
        return TopicBuilder.name(QUALITY_METRICS)
                .partitions(3)
                .replicas(1)
                .build();
    }
}