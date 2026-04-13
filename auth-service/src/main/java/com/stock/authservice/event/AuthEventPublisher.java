package com.stock.authservice.event;

import com.stock.authservice.constants.KafkaTopics;
import com.stock.authservice.event.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishUserLogin(UserLoginEvent event) {
        log.info("Publishing user.login event for user: {}", event.getUserId());
        try {
            kafkaTemplate.send(KafkaTopics.USER_LOGIN, event.getUserId(), event);
        } catch (Exception e) {
            log.error("Failed to publish user.login event", e);
        }
    }

    public void publishUserLogout(UserLogoutEvent event) {
        log.info("Publishing user.logout event for user: {}", event.getUserId());
        try {
            kafkaTemplate.send(KafkaTopics.USER_LOGOUT, event.getUserId(), event);
        } catch (Exception e) {
            log.error("Failed to publish user.logout event", e);
        }
    }

    public void publishSessionCreated(SessionCreatedEvent event) {
        log.info("Publishing session.created event for session: {}", event.getSessionId());
        try {
            kafkaTemplate.send(KafkaTopics.USER_LOGIN, event.getSessionId(), event);
        } catch (Exception e) {
            log.error("Failed to publish session.created event", e);
        }
    }

    public void publishSessionTerminated(SessionTerminatedEvent event) {
        log.info("Publishing session.terminated event for session: {}", event.getSessionId());
        try {
            kafkaTemplate.send(KafkaTopics.USER_LOGOUT, event.getSessionId(), event);
        } catch (Exception e) {
            log.error("Failed to publish session.terminated event", e);
        }
    }
}
