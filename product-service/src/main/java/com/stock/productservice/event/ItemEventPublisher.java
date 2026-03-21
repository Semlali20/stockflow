package com.stock.productservice.event;

import com.stock.productservice.config.KafkaConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ItemEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishItemCreated(ItemEvent event) {
        log.info("Publishing item created event: {}", event.getId());
        kafkaTemplate.send(KafkaConfig.ITEM_CREATED_TOPIC, event.getId(), event);
    }

    public void publishItemUpdated(ItemEvent event) {
        log.info("Publishing item updated event: {}", event.getId());
        kafkaTemplate.send(KafkaConfig.ITEM_UPDATED_TOPIC, event.getId(), event);
    }

    public void publishItemDeleted(ItemEvent event) {
        log.info("Publishing item deleted event: {}", event.getId());
        kafkaTemplate.send(KafkaConfig.ITEM_DELETED_TOPIC, event.getId(), event);
    }
}