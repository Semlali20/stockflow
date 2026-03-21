package com.stock.productservice.event;

import com.stock.productservice.config.KafkaConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ItemVariantEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishItemVariantCreated(ItemVariantEvent event) {
        log.info("Publishing item variant created event: {}", event.getId());
        kafkaTemplate.send(KafkaConfig.ITEM_VARIANT_CREATED_TOPIC, event.getId(), event);
    }

    public void publishItemVariantUpdated(ItemVariantEvent event) {
        log.info("Publishing item variant updated event: {}", event.getId());
        kafkaTemplate.send(KafkaConfig.ITEM_VARIANT_UPDATED_TOPIC, event.getId(), event);
    }

    public void publishItemVariantDeleted(ItemVariantEvent event) {
        log.info("Publishing item variant deleted event: {}", event.getId());
        kafkaTemplate.send(KafkaConfig.ITEM_VARIANT_DELETED_TOPIC, event.getId(), event);
    }
}