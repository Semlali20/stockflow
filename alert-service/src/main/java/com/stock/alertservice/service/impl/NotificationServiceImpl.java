package com.stock.alertservice.service.impl;

import com.stock.alertservice.dto.response.NotificationResponse;
import com.stock.alertservice.dto.response.PageResponse;
import com.stock.alertservice.entity.Alert;
import com.stock.alertservice.entity.Notification;
import com.stock.alertservice.entity.NotificationChannel;
import com.stock.alertservice.entity.NotificationTemplate;
import com.stock.alertservice.enums.NotificationChannelType;
import com.stock.alertservice.enums.NotificationStatus;
import com.stock.alertservice.exception.AlertNotFoundException;
import com.stock.alertservice.exception.NotificationChannelNotFoundException;
import com.stock.alertservice.exception.NotificationNotFoundException;
import com.stock.alertservice.exception.NotificationRateLimitException;
import com.stock.alertservice.exception.NotificationTemplateNotFoundException;
import com.stock.alertservice.repository.AlertRepository;
import com.stock.alertservice.repository.NotificationChannelRepository;
import com.stock.alertservice.repository.NotificationRepository;
import com.stock.alertservice.repository.NotificationTemplateRepository;
import com.stock.alertservice.service.EmailSenderService;
import com.stock.alertservice.service.HtmlEmailTemplateService;
import com.stock.alertservice.service.NotificationService;
import com.stock.alertservice.service.NotificationTemplateService;
import com.stock.alertservice.service.SmsSenderService;
import com.stock.alertservice.service.WebhookSenderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationChannelRepository channelRepository;
    private final NotificationTemplateRepository templateRepository;
    private final AlertRepository alertRepository;
    private final NotificationTemplateService templateService;
    private final EmailSenderService emailSenderService;
    private final SmsSenderService smsSenderService;
    private final WebhookSenderService webhookSenderService;
    private final HtmlEmailTemplateService htmlEmailTemplateService;

    @Value("${app.admin.email:admin@stock-management.com}")
    private String adminEmail;

    @Override
    public void sendNotificationForAlert(String alertId) {
        log.info("Sending notification for alert: {}", alertId);

        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new AlertNotFoundException(alertId));

        // Trouver le template approprié
        NotificationTemplate template = templateRepository
                .findActiveTemplateByTypeAndChannel(alert.getType(), NotificationChannelType.EMAIL)
                .orElse(null);

        if (template == null) {
            log.warn("No active template found for alert type: {}", alert.getType());
            return;
        }

        // Préparer les variables pour le template
        Map<String, Object> variables = new HashMap<>();
        variables.put("alertId", alert.getId());
        variables.put("alertType", alert.getType().toString());
        variables.put("alertLevel", alert.getLevel().toString());
        variables.put("message", alert.getMessage());
        variables.put("entityType", alert.getEntityType());
        variables.put("entityId", alert.getEntityId());
        variables.put("createdAt", alert.getCreatedAt().toString());

        // Traiter le template
        String processedBody = templateService.processTemplate(template.getId(), variables);

        // Récupérer le canal avec la plus haute priorité
        // OPTION 1: Using List return type with Pageable
        List<NotificationChannel> channels = channelRepository
                .findTopPriorityActiveChannelByType(
                        NotificationChannelType.EMAIL,
                        PageRequest.of(0, 1)
                );

        if (channels.isEmpty()) {
            throw new NotificationChannelNotFoundException("No active EMAIL channel found");
        }

        NotificationChannel channel = channels.get(0);

        // OPTION 2: Using the simpler method without Pageable (RECOMMENDED)
        // NotificationChannel channel = channelRepository
        //         .findFirstByChannelTypeAndIsActiveTrueOrderByPriorityAsc(NotificationChannelType.EMAIL)
        //         .orElseThrow(() -> new NotificationChannelNotFoundException(
        //                 "No active EMAIL channel found"
        //         ));

        // Vérifier le rate limit
        checkRateLimit(channel);

        // Envoyer la notification
        String recipient = extractRecipientFromAlert(alert);
        sendNotification(
                NotificationChannelType.EMAIL,
                recipient,
                template.getSubject(),
                processedBody,
                alertId,
                template.getId()
        );
    }


    @Override
    public NotificationResponse sendNotification(
            NotificationChannelType channelType,
            String recipient,
            String subject,
            String body,
            String alertId,
            String templateId) {

        log.info("Sending {} notification to: {}", channelType, recipient);

        // Fetch the Alert entity if alertId is provided
        Alert alert = null;
        if (alertId != null) {
            alert = alertRepository.findById(alertId)
                    .orElseThrow(() -> new AlertNotFoundException(alertId));
        }

        // Fetch the Template entity if templateId is provided
        NotificationTemplate template = null;
        if (templateId != null) {
            template = templateRepository.findById(templateId)
                    .orElseThrow(() -> new NotificationTemplateNotFoundException(templateId));
        }

        // Créer la notification
        Notification notification = Notification.builder()
                .channelType(channelType)
                .recipient(recipient)
                .subject(subject)
                .body(body)
                .status(NotificationStatus.PENDING)
                .retryCount(0)
                .alert(alert)
                .template(template)
                .build();

        Notification savedNotification = notificationRepository.save(notification);

        // Envoyer effectivement la notification (simulation)
        try {
            sendActualNotification(savedNotification);

            savedNotification.setStatus(NotificationStatus.SENT);
            savedNotification.setSentAt(LocalDateTime.now());

            // Incrémenter les compteurs
            if (template != null) {
                template.setTotalNotificationsSent(template.getTotalNotificationsSent() + 1);
                templateRepository.save(template);
            }

            NotificationChannel channel = channelRepository
                    .findByChannelTypeAndIsActiveTrue(channelType)
                    .stream()
                    .findFirst()
                    .orElse(null);

            if (channel != null) {
                channel.setTotalNotificationsSent(channel.getTotalNotificationsSent() + 1);
                channel.setSuccessfulNotifications(channel.getSuccessfulNotifications() + 1);
                channelRepository.save(channel);
            }

            log.info("Notification sent successfully: {}", savedNotification.getId());

        } catch (Exception e) {
            log.error("Failed to send notification: {}", savedNotification.getId(), e);

            savedNotification.setStatus(NotificationStatus.FAILED);
            savedNotification.setErrorMessage(e.getMessage());

            // Incrémenter le compteur d'échecs
            NotificationChannel channel = channelRepository
                    .findByChannelTypeAndIsActiveTrue(channelType)
                    .stream()
                    .findFirst()
                    .orElse(null);

            if (channel != null) {
                channel.setFailedNotifications(channel.getFailedNotifications() + 1);
                channelRepository.save(channel);
            }
        }

        Notification finalNotification = notificationRepository.save(savedNotification);
        return mapToResponse(finalNotification);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationResponse getNotificationById(String id) {
        log.info("Fetching notification by ID: {}", id);

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotificationNotFoundException(id));

        return mapToResponse(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getAllNotifications(
            int page,
            int size,
            String sortBy,
            String sortDirection) {

        log.info("Fetching all notifications - page: {}, size: {}", page, size);

        Sort sort = sortDirection.equalsIgnoreCase("DESC")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Notification> notificationPage = notificationRepository.findAll(pageable);

        List<NotificationResponse> content = notificationPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.of(content, page, size, notificationPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsByAlert(String alertId) {
        log.info("Fetching notifications by alert: {}", alertId);

        return notificationRepository.findByAlert_Id(alertId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getNotificationsByStatus(
            NotificationStatus status,
            int page,
            int size) {

        log.info("Fetching notifications by status: {} - page: {}, size: {}", status, page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Notification> notificationPage = notificationRepository.findByStatus(status, pageable);

        List<NotificationResponse> content = notificationPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.of(content, page, size, notificationPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getNotificationsByChannel(
            NotificationChannelType channelType,
            int page,
            int size) {

        log.info("Fetching notifications by channel: {} - page: {}, size: {}", channelType, page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Notification> notificationPage = notificationRepository.findByChannelType(channelType, pageable);

        List<NotificationResponse> content = notificationPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.of(content, page, size, notificationPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsByRecipient(String recipient) {
        log.info("Fetching notifications by recipient: {}", recipient);

        return notificationRepository.findByRecipient(recipient).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void retryFailedNotifications() {
        log.info("Retrying failed notifications");

        List<Notification> failedNotifications = notificationRepository.findNotificationsToRetry();
        log.info("Found {} notifications to retry", failedNotifications.size());

        failedNotifications.forEach(notification -> {
            try {
                log.info("Retrying notification: {}", notification.getId());

                sendActualNotification(notification);

                notification.setStatus(NotificationStatus.SENT);
                notification.setSentAt(LocalDateTime.now());
                notification.setRetryCount(notification.getRetryCount() + 1);

                notificationRepository.save(notification);

                log.info("Notification retry successful: {}", notification.getId());

            } catch (Exception e) {
                log.error("Notification retry failed: {}", notification.getId(), e);

                notification.setRetryCount(notification.getRetryCount() + 1);
                notification.setErrorMessage(e.getMessage());

                if (notification.getRetryCount() >= 3) {
                    notification.setStatus(NotificationStatus.FAILED);
                }

                notificationRepository.save(notification);
            }
        });
    }

    @Override
    public NotificationResponse markAsDelivered(String id) {
        log.info("Marking notification as delivered: {}", id);

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotificationNotFoundException(id));

        notification.setStatus(NotificationStatus.DELIVERED);
        notification.setDeliveredAt(LocalDateTime.now());

        Notification updatedNotification = notificationRepository.save(notification);
        return mapToResponse(updatedNotification);
    }

    @Override
    public NotificationResponse markAsFailed(String id, String errorMessage) {
        log.info("Marking notification as failed: {}", id);

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotificationNotFoundException(id));

        notification.setStatus(NotificationStatus.FAILED);
        notification.setErrorMessage(errorMessage);

        Notification updatedNotification = notificationRepository.save(notification);
        return mapToResponse(updatedNotification);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> searchNotifications(
            NotificationStatus status,
            NotificationChannelType channelType,
            String recipient,
            String alertId,
            int page,
            int size) {

        log.info("Searching notifications with filters");

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Notification> notificationPage = notificationRepository.searchNotifications(
                status, channelType, recipient, alertId, null, null, pageable);

        List<NotificationResponse> content = notificationPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.of(content, page, size, notificationPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getNotificationStatistics() {
        log.info("Fetching notification statistics");

        Map<String, Object> statistics = new HashMap<>();

        // Statistiques de base
        statistics.put("totalNotifications", notificationRepository.count());
        statistics.put("pendingNotifications", notificationRepository.countByStatus(NotificationStatus.PENDING));
        statistics.put("sentNotifications", notificationRepository.countByStatus(NotificationStatus.SENT));
        statistics.put("deliveredNotifications", notificationRepository.countByStatus(NotificationStatus.DELIVERED));
        statistics.put("failedNotifications", notificationRepository.countByStatus(NotificationStatus.FAILED));

        // Statistiques par statut
        List<Object[]> statusStats = notificationRepository.getNotificationStatisticsByStatus();
        Map<String, Long> byStatus = new HashMap<>();
        statusStats.forEach(stat -> {
            byStatus.put(stat[0].toString(), (Long) stat[1]);
        });
        statistics.put("byStatus", byStatus);

        // Statistiques par canal
        List<Object[]> channelStats = notificationRepository.getNotificationStatisticsByChannel();
        Map<String, Long> byChannel = new HashMap<>();
        channelStats.forEach(stat -> {
            byChannel.put(stat[0].toString(), (Long) stat[1]);
        });
        statistics.put("byChannel", byChannel);

        // Taux de succès par canal
        List<Object[]> successRates = notificationRepository.getSuccessRateByChannel();
        Map<String, Object> successRateByChannel = new HashMap<>();
        successRates.forEach(rate -> {
            String channelType = rate[0].toString();
            Long success = (Long) rate[1];
            Long total = (Long) rate[2];
            double percentage = total > 0 ? (success * 100.0 / total) : 0.0;

            Map<String, Object> channelRate = new HashMap<>();
            channelRate.put("success", success);
            channelRate.put("total", total);
            channelRate.put("successRate", String.format("%.2f%%", percentage));

            successRateByChannel.put(channelType, channelRate);
        });
        statistics.put("successRateByChannel", successRateByChannel);

        return statistics;
    }

    @Override
    public void cleanupOldNotifications(int daysOld) {
        log.info("Cleaning up notifications older than {} days", daysOld);

        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
        notificationRepository.deleteOldNotifications(cutoffDate);

        log.info("Old notifications cleaned up successfully");
    }

    /**
     * Vérifier le rate limit d'un canal
     */
    private void checkRateLimit(NotificationChannel channel) {
        if (channel.getRateLimitPerHour() == null) {
            return;
        }

        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        long recentCount = notificationRepository.countRecentNotificationsByChannel(
                channel.getChannelType(), oneHourAgo);

        if (recentCount >= channel.getRateLimitPerHour()) {
            throw new NotificationRateLimitException(
                    channel.getName(), channel.getRateLimitPerHour());
        }
    }

    /**
     * Extract recipient email from alert data, falling back to configured admin email.
     */
    private String extractRecipientFromAlert(Alert alert) {
        // Try to get from alert data first
        if (alert.getData() != null && alert.getData().containsKey("recipientEmail")) {
            Object recipientEmail = alert.getData().get("recipientEmail");
            if (recipientEmail != null && !recipientEmail.toString().isBlank()) {
                return recipientEmail.toString();
            }
        }
        // Fall back to configured admin email
        return adminEmail;
    }

    /**
     * Envoyer effectivement la notification
     */
    private void sendActualNotification(Notification notification) {
        log.info("Sending {} notification to: {}",
                notification.getChannelType(), notification.getRecipient());

        switch (notification.getChannelType()) {
            case EMAIL:
                sendEmailNotification(notification);
                break;
            case SMS:
                sendSmsNotification(notification);
                break;
            case WEBHOOK:
                sendWebhookNotification(notification);
                break;
            case PUSH:
            case BLACK:
                // Keep as no-op - PUSH not yet implemented, BLACK is disabled
                log.info("Channel {} - no-op (not implemented or disabled)",
                        notification.getChannelType());
                break;
            default:
                log.warn("Unknown channel type: {}", notification.getChannelType());
        }
    }

    /**
     * Send email notification using EmailSenderService
     */
    private void sendEmailNotification(Notification notification) {
        String recipient = notification.getRecipient();
        String subject = notification.getSubject();
        String body = notification.getBody();

        // Check if body contains HTML tags
        boolean isHtml = body != null && (
                body.contains("<html>") ||
                body.contains("<div>") ||
                body.contains("<p>") ||
                body.contains("<br>") ||
                body.contains("<table>") ||
                body.contains("<!DOCTYPE")
        );

        if (isHtml) {
            emailSenderService.sendHtmlEmail(recipient, subject, body);
            log.info("HTML email sent to: {}", recipient);
        } else {
            emailSenderService.sendEmail(recipient, subject, body);
            log.info("Plain text email sent to: {}", recipient);
        }
    }

    /**
     * Send SMS notification using SmsSenderService
     */
    private void sendSmsNotification(Notification notification) {
        String recipient = notification.getRecipient();
        String message = notification.getBody();

        smsSenderService.sendSms(recipient, message);
        log.info("SMS sent to: {}", recipient);
    }

    /**
     * Send webhook notification using WebhookSenderService
     */
    private void sendWebhookNotification(Notification notification) {
        String url = notification.getRecipient(); // For webhooks, recipient is the URL

        // Prepare payload
        Map<String, Object> payload = new HashMap<>();
        payload.put("subject", notification.getSubject());
        payload.put("body", notification.getBody());
        payload.put("channelType", notification.getChannelType().toString());
        payload.put("status", notification.getStatus().toString());
        payload.put("createdAt", notification.getCreatedAt().toString());

        if (notification.getAlert() != null) {
            payload.put("alertId", notification.getAlert().getId());
            payload.put("alertType", notification.getAlert().getType().toString());
            payload.put("alertLevel", notification.getAlert().getLevel().toString());
        }

        if (notification.getMetadata() != null) {
            payload.put("metadata", notification.getMetadata());
        }

        webhookSenderService.sendWebhook(url, payload);
        log.info("Webhook sent to: {}", url);
    }

    /**
     * Mapper une entité Notification vers NotificationResponse
     */
    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .channelType(notification.getChannelType())
                .recipient(notification.getRecipient())
                .subject(notification.getSubject())
                .body(notification.getBody())
                .status(notification.getStatus())
                .sentAt(notification.getSentAt())
                .deliveredAt(notification.getDeliveredAt())
                .retryCount(notification.getRetryCount())
                .errorMessage(notification.getErrorMessage())
                .metadata(notification.getMetadata())
                .alertId(notification.getAlert() != null ? notification.getAlert().getId() : null)
                .templateId(notification.getTemplate() != null ? notification.getTemplate().getId() : null)
                .createdAt(notification.getCreatedAt())
                .updatedAt(notification.getUpdatedAt())
                .build();
    }
}