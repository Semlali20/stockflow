package com.stock.alertservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
@Slf4j
public class HtmlEmailTemplateService {

    public String loadAndProcess(String templateName, Map<String, String> variables) {
        try {
            ClassPathResource resource = new ClassPathResource("templates/" + templateName + ".html");
            String html = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);

            for (Map.Entry<String, String> entry : variables.entrySet()) {
                String placeholder = "{{" + entry.getKey() + "}}";
                String value = entry.getValue() != null ? entry.getValue() : "";
                html = html.replace(placeholder, escapeHtml(value));
            }
            return html;
        } catch (Exception e) {
            log.error("Failed to load email template: {}", templateName, e);
            return buildFallbackHtml(templateName, variables);
        }
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private String buildFallbackHtml(String templateName, Map<String, String> variables) {
        StringBuilder sb = new StringBuilder();
        sb.append("<html><body><h2>Notification: ").append(templateName).append("</h2><ul>");
        variables.forEach((k, v) -> sb.append("<li><strong>").append(k).append(":</strong> ").append(v).append("</li>"));
        sb.append("</ul></body></html>");
        return sb.toString();
    }
}
