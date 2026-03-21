package com.stock.authservice.config;

import com.stock.authservice.constants.KafkaTopics;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConfig {

    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapServers;

    // ==================== PRODUCER CONFIGURATION ====================

    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        config.put(ProducerConfig.ACKS_CONFIG, "all");
        config.put(ProducerConfig.RETRIES_CONFIG, 3);
        config.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
        config.put(JsonSerializer.ADD_TYPE_INFO_HEADERS, false);

        return new DefaultKafkaProducerFactory<>(config);
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }

    // ==================== TOPIC DEFINITIONS ====================

    @Bean
    public NewTopic userLoginTopic() {
        return TopicBuilder
                .name("auth.user.login")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic userLogoutTopic() {
        return TopicBuilder
                .name("auth.user.logout")
                .partitions(3)
                .replicas(1)
                .build();
    }
    @Bean
    public NewTopic userLoginFailedTopic() {
        return TopicBuilder.name(KafkaTopics.USER_LOGIN_FAILED)
                .partitions(KafkaTopics.DEFAULT_PARTITIONS)
                .replicas(KafkaTopics.DEFAULT_REPLICATION_FACTOR)
                .build();
    }

    @Bean
    public NewTopic userCreatedTopic() {
        return TopicBuilder
                .name("auth.user.created")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic userUpdatedTopic() {
        return TopicBuilder.name(KafkaTopics.USER_UPDATED)
                .partitions(KafkaTopics.DEFAULT_PARTITIONS)
                .replicas(KafkaTopics.DEFAULT_REPLICATION_FACTOR)
                .build();
    }

    @Bean
    public NewTopic passwordChangedTopic() {
        return TopicBuilder.name(KafkaTopics.PASSWORD_CHANGED)
                .partitions(KafkaTopics.DEFAULT_PARTITIONS)
                .replicas(KafkaTopics.DEFAULT_REPLICATION_FACTOR)
                .build();
    }

    @Bean
    public NewTopic mfaEnabledTopic() {
        return TopicBuilder.name(KafkaTopics.MFA_ENABLED)
                .partitions(KafkaTopics.DEFAULT_PARTITIONS)
                .replicas(KafkaTopics.DEFAULT_REPLICATION_FACTOR)
                .build();
    }

    @Bean
    public NewTopic accountLockedTopic() {
        return TopicBuilder.name(KafkaTopics.USER_LOCKED)
                .partitions(KafkaTopics.DEFAULT_PARTITIONS)
                .replicas(KafkaTopics.DEFAULT_REPLICATION_FACTOR)
                .build();
    }

    @Bean
    public NewTopic sessionCreatedTopic() {
        return TopicBuilder.name(KafkaTopics.SESSION_CREATED)
                .partitions(KafkaTopics.DEFAULT_PARTITIONS)
                .replicas(KafkaTopics.DEFAULT_REPLICATION_FACTOR)
                .build();
    }

    // Add more topic beans as needed...
}
