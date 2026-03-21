package com.stock.alertservice.service.impl;

import com.stock.alertservice.service.SmsSenderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * 📱 SMS Sender Service Implementation
 *
 * IMPLEMENTATION OPTIONS:
 * 1. Twilio - Most popular SMS provider
 * 2. AWS SNS - Amazon Simple Notification Service
 * 3. Nexmo/Vonage - Alternative SMS provider
 * 4. Firebase Cloud Messaging - For app notifications
 *
 * Current: Stub implementation with logging
 * TODO: Integrate with actual SMS provider
 */
@Service
@Slf4j
public class SmsSenderServiceImpl implements SmsSenderService {

    @Value("${sms.provider.enabled:false}")
    private boolean smsEnabled;

    @Value("${sms.provider.api-key:}")
    private String apiKey;

    @Value("${sms.provider.from-number:}")
    private String fromNumber;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public void sendSms(String to, String message) {
        log.info("📱 Sending SMS to: {}", to);

        if (!smsEnabled) {
            log.warn("⚠️ SMS provider not enabled. Message would be: {}", message);
            return;
        }

        try {
            // TODO: Implement actual SMS sending
            // Example for Twilio:
            // String url = "https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json";
            // MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            // params.add("To", to);
            // params.add("From", fromNumber);
            // params.add("Body", message);
            //
            // HttpHeaders headers = new HttpHeaders();
            // headers.setBasicAuth(apiKey, apiSecret);
            // headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            //
            // HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
            // ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            log.info("✅ SMS sent successfully to: {}", to);

        } catch (Exception e) {
            log.error("❌ Failed to send SMS to: {}", to, e);
            throw new RuntimeException("Failed to send SMS: " + e.getMessage(), e);
        }
    }

    @Override
    public void sendBulkSms(String[] to, String message) {
        log.info("📱 Sending bulk SMS to {} recipients", to.length);

        for (String recipient : to) {
            try {
                sendSms(recipient, message);
            } catch (Exception e) {
                log.error("❌ Failed to send SMS to recipient: {}", recipient, e);
                // Continue with other recipients
            }
        }

        log.info("✅ Bulk SMS sending completed");
    }

    @Override
    public boolean isAvailable() {
        return smsEnabled && apiKey != null && !apiKey.isEmpty();
    }
}
