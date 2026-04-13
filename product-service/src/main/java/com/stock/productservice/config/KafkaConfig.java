// Updated KafkaConfig.java
package com.stock.productservice.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    // Item Topics (changed from Product)
    public static final String ITEM_CREATED_TOPIC = "item.created";
    public static final String ITEM_UPDATED_TOPIC = "item.updated";
    public static final String ITEM_DELETED_TOPIC = "item.deleted";

    // Category Topics
    public static final String CATEGORY_CREATED_TOPIC = "category.created";
    public static final String CATEGORY_UPDATED_TOPIC = "category.updated";
    public static final String CATEGORY_DELETED_TOPIC = "category.deleted";

    // ItemVariant Topics (changed from Supplier)
    public static final String ITEM_VARIANT_CREATED_TOPIC = "itemvariant.created";
    public static final String ITEM_VARIANT_UPDATED_TOPIC = "itemvariant.updated";
    public static final String ITEM_VARIANT_DELETED_TOPIC = "itemvariant.deleted";

    // Item Topics
    @Bean
    public NewTopic itemCreatedTopic() {
        return TopicBuilder
                .name(ITEM_CREATED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic itemUpdatedTopic() {
        return TopicBuilder
                .name(ITEM_UPDATED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic itemDeletedTopic() {
        return TopicBuilder
                .name(ITEM_DELETED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    // Category Topics
    @Bean
    public NewTopic categoryCreatedTopic() {
        return TopicBuilder
                .name(CATEGORY_CREATED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic categoryUpdatedTopic() {
        return TopicBuilder
                .name(CATEGORY_UPDATED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic categoryDeletedTopic() {
        return TopicBuilder
                .name(CATEGORY_DELETED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    // ItemVariant Topics
    @Bean
    public NewTopic itemVariantCreatedTopic() {
        return TopicBuilder
                .name(ITEM_VARIANT_CREATED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic itemVariantUpdatedTopic() {
        return TopicBuilder
                .name(ITEM_VARIANT_UPDATED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic itemVariantDeletedTopic() {
        return TopicBuilder
                .name(ITEM_VARIANT_DELETED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }
}