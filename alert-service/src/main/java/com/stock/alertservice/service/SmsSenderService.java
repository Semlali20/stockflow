package com.stock.alertservice.service;

/**
 * 📱 SMS Sender Service
 * Handles SMS sending via SMS provider (Twilio, AWS SNS, etc.)
 */
public interface SmsSenderService {

    /**
     * Send SMS to a single recipient
     */
    void sendSms(String to, String message);

    /**
     * Send SMS to multiple recipients
     */
    void sendBulkSms(String[] to, String message);

    /**
     * Check SMS service availability
     */
    boolean isAvailable();
}
