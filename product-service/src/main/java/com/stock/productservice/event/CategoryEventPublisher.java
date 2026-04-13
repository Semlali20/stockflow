package com.stock.productservice.event;

import com.stock.productservice.config.KafkaConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class CategoryEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishCategoryCreated(CategoryEvent event) {
        log.info("Publishing category created event: {}", event.getId());
        kafkaTemplate.send(KafkaConfig.CATEGORY_CREATED_TOPIC, event.getId(), event);
    }

    public void publishCategoryUpdated(CategoryEvent event) {
        log.info("Publishing category updated event: {}", event.getId());
        kafkaTemplate.send(KafkaConfig.CATEGORY_UPDATED_TOPIC, event.getId(), event);
    }

    public void publishCategoryDeleted(CategoryEvent event) {
        log.info("Publishing category deleted event: {}", event.getId());
        kafkaTemplate.send(KafkaConfig.CATEGORY_DELETED_TOPIC, event.getId(), event);
    }
}