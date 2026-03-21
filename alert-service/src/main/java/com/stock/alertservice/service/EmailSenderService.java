package com.stock.alertservice.service;

/**
 * 📧 Email Sender Service
 * Handles actual email sending via SMTP
 */
public interface EmailSenderService {

    /**
     * Send plain text email
     */
    void sendEmail(String to, String subject, String body);

    /**
     * Send HTML email
     */
    void sendHtmlEmail(String to, String subject, String htmlBody);

    /**
     * Send email with attachment
     */
    void sendEmailWithAttachment(String to, String subject, String body, String attachmentPath);

    /**
     * Send email to multiple recipients
     */
    void sendBulkEmail(String[] to, String subject, String body);
}
