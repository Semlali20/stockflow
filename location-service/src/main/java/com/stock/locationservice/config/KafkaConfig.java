package com.stock.locationservice.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    public static final String LOCATION_CREATED_TOPIC = "location.created";
    public static final String LOCATION_UPDATED_TOPIC = "location.updated";
    public static final String LOCATION_DELETED_TOPIC = "location.deleted";
    public static final String WAREHOUSE_CREATED_TOPIC = "warehouse.created";
    public static final String SITE_CREATED_TOPIC = "site.created";

    @Bean
    public NewTopic locationCreatedTopic() {
        return TopicBuilder
                .name(LOCATION_CREATED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic locationUpdatedTopic() {
        return TopicBuilder
                .name(LOCATION_UPDATED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic locationDeletedTopic() {
        return TopicBuilder
                .name(LOCATION_DELETED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic warehouseCreatedTopic() {
        return TopicBuilder
                .name(WAREHOUSE_CREATED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic siteCreatedTopic() {
        return TopicBuilder
                .name(SITE_CREATED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
