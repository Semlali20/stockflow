package com.stock.alertservice.config;

import com.stock.alertservice.service.AlertService;
import com.stock.alertservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Tâches planifiées pour l'Alert Service
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ScheduledTasks {

    private final AlertService alertService;
    private final NotificationService notificationService;

    /**
     * Traiter l'escalade des alertes toutes les 30 minutes
     */
    @Scheduled(cron = "0 */30 * * * *")
    public void processAlertEscalation() {
        log.info("Starting scheduled task: processAlertEscalation");

        try {
            alertService.processAlertEscalation();
            log.info("Completed scheduled task: processAlertEscalation");
        } catch (Exception e) {
            log.error("Error in scheduled task: processAlertEscalation", e);
        }
    }

    /**
     * Réessayer les notifications échouées toutes les heures
     */
    @Scheduled(cron = "0 0 * * * *")
    public void retryFailedNotifications() {
        log.info("Starting scheduled task: retryFailedNotifications");

        try {
            notificationService.retryFailedNotifications();
            log.info("Completed scheduled task: retryFailedNotifications");
        } catch (Exception e) {
            log.error("Error in scheduled task: retryFailedNotifications", e);
        }
    }

    /**
     * Nettoyer les alertes résolues de plus de 90 jours (tous les jours à 2h du matin)
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void cleanupOldResolvedAlerts() {
        log.info("Starting scheduled task: cleanupOldResolvedAlerts");

        try {
            alertService.cleanupOldResolvedAlerts(90);
            log.info("Completed scheduled task: cleanupOldResolvedAlerts");
        } catch (Exception e) {
            log.error("Error in scheduled task: cleanupOldResolvedAlerts", e);
        }
    }

    /**
     * Nettoyer les notifications de plus de 60 jours (tous les jours à 3h du matin)
     */
    @Scheduled(cron = "0 0 3 * * *")
    public void cleanupOldNotifications() {
        log.info("Starting scheduled task: cleanupOldNotifications");

        try {
            notificationService.cleanupOldNotifications(60);
            log.info("Completed scheduled task: cleanupOldNotifications");
        } catch (Exception e) {
            log.error("Error in scheduled task: cleanupOldNotifications", e);
        }
    }
}
