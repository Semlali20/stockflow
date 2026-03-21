package com.stock.alertservice.service.impl;

import com.stock.alertservice.dto.request.NotificationTemplateRequest;
import com.stock.alertservice.dto.response.NotificationTemplateResponse;
import com.stock.alertservice.dto.response.PageResponse;
import com.stock.alertservice.entity.NotificationTemplate;
import com.stock.alertservice.enums.AlertType;
import com.stock.alertservice.enums.NotificationChannelType;
import com.stock.alertservice.exception.DuplicateRuleException;
import com.stock.alertservice.exception.NotificationTemplateNotFoundException;
import com.stock.alertservice.exception.TemplateProcessingException;
import com.stock.alertservice.repository.NotificationTemplateRepository;
import com.stock.alertservice.service.NotificationTemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationTemplateServiceImpl implements NotificationTemplateService {

    private final NotificationTemplateRepository templateRepository;

    private static final Pattern VARIABLE_PATTERN = Pattern.compile("\\{\\{([^}]+)\\}\\}");

    @Override
    public NotificationTemplateResponse createTemplate(NotificationTemplateRequest request) {
        log.info("Creating notification template: {}", request.getName());

        // Vérifier si un template avec ce nom existe déjà
        if (templateRepository.existsByName(request.getName())) {
            throw new DuplicateRuleException(
                    "Notification template with name '" + request.getName() + "' already exists",
                    "DUPLICATE_TEMPLATE"
            );
        }

        NotificationTemplate template = NotificationTemplate.builder()
                .name(request.getName())
                .subject(request.getSubject())
                .htmlBody(request.getHtmlBody())
                .textBody(request.getTextBody())
                .channel(request.getChannel())
                .templateType(request.getTemplateType())
                .language(request.getLanguage() != null ? request.getLanguage() : "en")
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .requiredVariables(request.getRequiredVariables())
                .totalNotificationsSent(0L)
                .build();

        NotificationTemplate savedTemplate = templateRepository.save(template);
        log.info("Notification template created successfully with ID: {}", savedTemplate.getId());

        return mapToResponse(savedTemplate);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationTemplateResponse getTemplateById(String id) {
        log.info("Fetching notification template by ID: {}", id);

        NotificationTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new NotificationTemplateNotFoundException(id));

        return mapToResponse(template);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationTemplateResponse getTemplateByName(String name) {
        log.info("Fetching notification template by name: {}", name);

        NotificationTemplate template = templateRepository.findByName(name)
                .orElseThrow(() -> new NotificationTemplateNotFoundException("name", name));

        return mapToResponse(template);
    }

    @Override
    public NotificationTemplateResponse updateTemplate(String id, NotificationTemplateRequest request) {
        log.info("Updating notification template with ID: {}", id);

        NotificationTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new NotificationTemplateNotFoundException(id));

        // Vérifier si le nouveau nom existe déjà
        if (request.getName() != null && !request.getName().equals(template.getName())) {
            if (templateRepository.existsByName(request.getName())) {
                throw new DuplicateRuleException(
                        "Notification template with name '" + request.getName() + "' already exists",
                        "DUPLICATE_TEMPLATE"
                );
            }
            template.setName(request.getName());
        }

        if (request.getSubject() != null) {
            template.setSubject(request.getSubject());
        }
        if (request.getHtmlBody() != null) {
            template.setHtmlBody(request.getHtmlBody());
        }
        if (request.getTextBody() != null) {
            template.setTextBody(request.getTextBody());
        }
        if (request.getChannel() != null) {
            template.setChannel(request.getChannel());
        }
        if (request.getTemplateType() != null) {
            template.setTemplateType(request.getTemplateType());
        }
        if (request.getLanguage() != null) {
            template.setLanguage(request.getLanguage());
        }
        if (request.getIsActive() != null) {
            template.setIsActive(request.getIsActive());
        }
        if (request.getRequiredVariables() != null) {
            template.setRequiredVariables(request.getRequiredVariables());
        }

        NotificationTemplate updatedTemplate = templateRepository.save(template);
        log.info("Notification template updated successfully: {}", id);

        return mapToResponse(updatedTemplate);
    }

    @Override
    public void deleteTemplate(String id) {
        log.info("Deleting notification template with ID: {}", id);

        if (!templateRepository.existsById(id)) {
            throw new NotificationTemplateNotFoundException(id);
        }

        templateRepository.deleteById(id);
        log.info("Notification template deleted successfully: {}", id);
    }

    @Override
    public NotificationTemplateResponse activateTemplate(String id) {
        log.info("Activating notification template with ID: {}", id);

        NotificationTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new NotificationTemplateNotFoundException(id));

        template.setIsActive(true);
        NotificationTemplate updatedTemplate = templateRepository.save(template);

        log.info("Notification template activated successfully: {}", id);
        return mapToResponse(updatedTemplate);
    }

    @Override
    public NotificationTemplateResponse deactivateTemplate(String id) {
        log.info("Deactivating notification template with ID: {}", id);

        NotificationTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new NotificationTemplateNotFoundException(id));

        template.setIsActive(false);
        NotificationTemplate updatedTemplate = templateRepository.save(template);

        log.info("Notification template deactivated successfully: {}", id);
        return mapToResponse(updatedTemplate);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationTemplateResponse> getAllTemplates(
            int page,
            int size,
            String sortBy,
            String sortDirection) {

        log.info("Fetching all notification templates - page: {}, size: {}", page, size);

        Sort sort = sortDirection.equalsIgnoreCase("DESC")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<NotificationTemplate> templatePage = templateRepository.findAll(pageable);

        List<NotificationTemplateResponse> content = templatePage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.of(content, page, size, templatePage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationTemplateResponse> getActiveTemplates() {
        log.info("Fetching all active notification templates");

        return templateRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationTemplateResponse> getTemplatesByChannel(NotificationChannelType channel) {
        log.info("Fetching notification templates by channel: {}", channel);

        return templateRepository.findByChannel(channel).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationTemplateResponse> getTemplatesByAlertType(AlertType alertType) {
        log.info("Fetching notification templates by alert type: {}", alertType);

        return templateRepository.findByTemplateType(alertType).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationTemplateResponse getTemplateByTypeAndChannel(
            AlertType alertType,
            NotificationChannelType channel) {

        log.info("Fetching notification template by type: {} and channel: {}", alertType, channel);

        NotificationTemplate template = templateRepository
                .findActiveTemplateByTypeAndChannel(alertType, channel)
                .orElseThrow(() -> new NotificationTemplateNotFoundException(
                        String.format("No active template found for type %s and channel %s",
                                alertType, channel)
                ));

        return mapToResponse(template);
    }

    @Override
    @Transactional(readOnly = true)
    public String processTemplate(String templateId, Map<String, Object> variables) {
        log.info("Processing template: {}", templateId);

        NotificationTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new NotificationTemplateNotFoundException(templateId));

        if (!template.getIsActive()) {
            throw new TemplateProcessingException(
                    template.getName(),
                    "Template is not active"
            );
        }

        try {
            String processedBody = template.getHtmlBody();

            // Remplacer toutes les variables {{variable}} par leurs valeurs
            Matcher matcher = VARIABLE_PATTERN.matcher(processedBody);
            StringBuffer result = new StringBuffer();

            while (matcher.find()) {
                String variableName = matcher.group(1).trim();
                Object value = variables.get(variableName);

                if (value == null) {
                    log.warn("Variable '{}' not found in template '{}'", variableName, template.getName());
                    value = "";
                }

                matcher.appendReplacement(result, Matcher.quoteReplacement(value.toString()));
            }
            matcher.appendTail(result);

            log.info("Template processed successfully: {}", templateId);
            return result.toString();

        } catch (Exception e) {
            log.error("Error processing template: {}", templateId, e);
            throw new TemplateProcessingException(template.getName(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationTemplateResponse> searchTemplates(
            String name,
            NotificationChannelType channel,
            AlertType templateType,
            String language,
            Boolean isActive,
            int page,
            int size) {

        log.info("Searching notification templates with filters");

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<NotificationTemplate> templatePage = templateRepository.searchTemplates(
                name, channel, templateType, language, isActive, pageable);

        List<NotificationTemplateResponse> content = templatePage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.of(content, page, size, templatePage.getTotalElements());
    }

    /**
     * Mapper une entité NotificationTemplate vers NotificationTemplateResponse
     */
    private NotificationTemplateResponse mapToResponse(NotificationTemplate template) {
        return NotificationTemplateResponse.builder()
                .id(template.getId())
                .name(template.getName())
                .subject(template.getSubject())
                .htmlBody(template.getHtmlBody())
                .textBody(template.getTextBody())
                .channel(template.getChannel())
                .templateType(template.getTemplateType())
                .language(template.getLanguage())
                .isActive(template.getIsActive())
                .requiredVariables(template.getRequiredVariables())
                .totalNotificationsSent(template.getTotalNotificationsSent())
                .createdAt(template.getCreatedAt())
                .updatedAt(template.getUpdatedAt())
                .build();
    }
}
