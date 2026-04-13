package com.stock.alertservice.service.impl;

import com.stock.alertservice.service.EmailSenderService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.File;

/**
 * 📧 Email Sender Service Implementation
 * Uses Spring JavaMailSender for sending emails via SMTP
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailSenderServiceImpl implements EmailSenderService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@stock-management.com}")
    private String fromEmail;

    @Override
    public void sendEmail(String to, String subject, String body) {
        log.info("📧 Sending email to: {}", to);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            log.info("✅ Email sent successfully to: {}", to);

        } catch (Exception e) {
            log.error("❌ Failed to send email to: {}", to, e);
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }

    @Override
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        log.info("📧 Sending HTML email to: {}", to);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML

            mailSender.send(mimeMessage);
            log.info("✅ HTML email sent successfully to: {}", to);

        } catch (MessagingException e) {
            log.error("❌ Failed to send HTML email to: {}", to, e);
            throw new RuntimeException("Failed to send HTML email: " + e.getMessage(), e);
        }
    }

    @Override
    public void sendEmailWithAttachment(String to, String subject, String body, String attachmentPath) {
        log.info("📧 Sending email with attachment to: {}", to);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body);

            // Add attachment
            FileSystemResource file = new FileSystemResource(new File(attachmentPath));
            helper.addAttachment(file.getFilename(), file);

            mailSender.send(mimeMessage);
            log.info("✅ Email with attachment sent successfully to: {}", to);

        } catch (MessagingException e) {
            log.error("❌ Failed to send email with attachment to: {}", to, e);
            throw new RuntimeException("Failed to send email with attachment: " + e.getMessage(), e);
        }
    }

    @Override
    public void sendBulkEmail(String[] to, String subject, String body) {
        log.info("📧 Sending bulk email to {} recipients", to.length);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            log.info("✅ Bulk email sent successfully to {} recipients", to.length);

        } catch (Exception e) {
            log.error("❌ Failed to send bulk email", e);
            throw new RuntimeException("Failed to send bulk email: " + e.getMessage(), e);
        }
    }
}
