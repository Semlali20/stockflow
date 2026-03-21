package com.stock.alertservice.service.impl;

import com.stock.alertservice.dto.request.NotificationChannelRequest;
import com.stock.alertservice.dto.response.NotificationChannelResponse;
import com.stock.alertservice.dto.response.PageResponse;
import com.stock.alertservice.entity.NotificationChannel;
import com.stock.alertservice.enums.NotificationChannelType;
import com.stock.alertservice.exception.DuplicateRuleException;
import com.stock.alertservice.exception.NotificationChannelNotFoundException;
import com.stock.alertservice.repository.NotificationChannelRepository;
import com.stock.alertservice.service.NotificationChannelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationChannelServiceImpl implements NotificationChannelService {

    private final NotificationChannelRepository channelRepository;

    @Override
    public NotificationChannelResponse createChannel(NotificationChannelRequest request) {
        log.info("Creating notification channel: {}", request.getName());

        // Vérifier si un canal avec ce nom existe déjà
        if (channelRepository.existsByName(request.getName())) {
            throw new DuplicateRuleException(
                    "Notification channel with name '" + request.getName() + "' already exists",
                    "DUPLICATE_CHANNEL"
            );
        }

        NotificationChannel channel = NotificationChannel.builder()
                .name(request.getName())
                .channelType(request.getChannelType())
                .settings(request.getSettings())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .rateLimitPerHour(request.getRateLimitPerHour())
                .priority(request.getPriority() != null ? request.getPriority() : 10)
                .totalNotificationsSent(0L)
                .successfulNotifications(0L)
                .failedNotifications(0L)
                .build();

        NotificationChannel savedChannel = channelRepository.save(channel);
        log.info("Notification channel created successfully with ID: {}", savedChannel.getId());

        return mapToResponse(savedChannel);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationChannelResponse getChannelById(String id) {
        log.info("Fetching notification channel by ID: {}", id);

        NotificationChannel channel = channelRepository.findById(id)
                .orElseThrow(() -> new NotificationChannelNotFoundException(id));

        return mapToResponse(channel);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationChannelResponse getChannelByName(String name) {
        log.info("Fetching notification channel by name: {}", name);

        NotificationChannel channel = channelRepository.findByName(name)
                .orElseThrow(() -> new NotificationChannelNotFoundException("name", name));

        return mapToResponse(channel);
    }

    @Override
    public NotificationChannelResponse updateChannel(String id, NotificationChannelRequest request) {
        log.info("Updating notification channel with ID: {}", id);

        NotificationChannel channel = channelRepository.findById(id)
                .orElseThrow(() -> new NotificationChannelNotFoundException(id));

        // Vérifier si le nouveau nom existe déjà
        if (request.getName() != null && !request.getName().equals(channel.getName())) {
            if (channelRepository.existsByName(request.getName())) {
                throw new DuplicateRuleException(
                        "Notification channel with name '" + request.getName() + "' already exists",
                        "DUPLICATE_CHANNEL"
                );
            }
            channel.setName(request.getName());
        }

        if (request.getChannelType() != null) {
            channel.setChannelType(request.getChannelType());
        }
        if (request.getSettings() != null) {
            channel.setSettings(request.getSettings());
        }
        if (request.getIsActive() != null) {
            channel.setIsActive(request.getIsActive());
        }
        if (request.getRateLimitPerHour() != null) {
            channel.setRateLimitPerHour(request.getRateLimitPerHour());
        }
        if (request.getPriority() != null) {
            channel.setPriority(request.getPriority());
        }

        NotificationChannel updatedChannel = channelRepository.save(channel);
        log.info("Notification channel updated successfully: {}", id);

        return mapToResponse(updatedChannel);
    }

    @Override
    public void deleteChannel(String id) {
        log.info("Deleting notification channel with ID: {}", id);

        if (!channelRepository.existsById(id)) {
            throw new NotificationChannelNotFoundException(id);
        }

        channelRepository.deleteById(id);
        log.info("Notification channel deleted successfully: {}", id);
    }

    @Override
    public NotificationChannelResponse activateChannel(String id) {
        log.info("Activating notification channel with ID: {}", id);

        NotificationChannel channel = channelRepository.findById(id)
                .orElseThrow(() -> new NotificationChannelNotFoundException(id));

        channel.setIsActive(true);
        NotificationChannel updatedChannel = channelRepository.save(channel);

        log.info("Notification channel activated successfully: {}", id);
        return mapToResponse(updatedChannel);
    }

    @Override
    public NotificationChannelResponse deactivateChannel(String id) {
        log.info("Deactivating notification channel with ID: {}", id);

        NotificationChannel channel = channelRepository.findById(id)
                .orElseThrow(() -> new NotificationChannelNotFoundException(id));

        channel.setIsActive(false);
        NotificationChannel updatedChannel = channelRepository.save(channel);

        log.info("Notification channel deactivated successfully: {}", id);
        return mapToResponse(updatedChannel);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationChannelResponse> getAllChannels(
            int page,
            int size,
            String sortBy,
            String sortDirection) {

        log.info("Fetching all notification channels - page: {}, size: {}", page, size);

        Sort sort = sortDirection.equalsIgnoreCase("DESC")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<NotificationChannel> channelPage = channelRepository.findAll(pageable);

        List<NotificationChannelResponse> content = channelPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.of(content, page, size, channelPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationChannelResponse> getActiveChannels() {
        log.info("Fetching all active notification channels");

        return channelRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationChannelResponse> getChannelsByType(NotificationChannelType channelType) {
        log.info("Fetching notification channels by type: {}", channelType);

        return channelRepository.findByChannelType(channelType).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationChannelResponse> getActiveChannelsByType(NotificationChannelType channelType) {
        log.info("Fetching active notification channels by type: {}", channelType);

        return channelRepository.findByChannelTypeAndIsActiveTrue(channelType).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationChannelResponse getTopPriorityChannelByType(NotificationChannelType channelType) {
        log.info("Fetching top priority channel by type: {}", channelType);

        // OPTION 1: Using List return type with Pageable
        Pageable pageable = PageRequest.of(0, 1);
        List<NotificationChannel> channels = channelRepository
                .findTopPriorityActiveChannelByType(channelType, pageable);

        if (channels.isEmpty()) {
            throw new NotificationChannelNotFoundException(
                    String.format("No active channel found for type %s", channelType)
            );
        }

        NotificationChannel channel = channels.get(0);

        // OPTION 2: Using the simpler method without Pageable (RECOMMENDED)
        // NotificationChannel channel = channelRepository
        //         .findFirstByChannelTypeAndIsActiveTrueOrderByPriorityAsc(channelType)
        //         .orElseThrow(() -> new NotificationChannelNotFoundException(
        //                 String.format("No active channel found for type %s", channelType)
        //         ));

        return mapToResponse(channel);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationChannelResponse> searchChannels(
            String name,
            NotificationChannelType channelType,
            Boolean isActive,
            int page,
            int size) {

        log.info("Searching notification channels with filters");

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<NotificationChannel> channelPage = channelRepository.searchChannels(
                name, channelType, isActive, pageable);

        List<NotificationChannelResponse> content = channelPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.of(content, page, size, channelPage.getTotalElements());
    }

    /**
     * Mapper une entité NotificationChannel vers NotificationChannelResponse
     */
    private NotificationChannelResponse mapToResponse(NotificationChannel channel) {
        return NotificationChannelResponse.builder()
                .id(channel.getId())
                .name(channel.getName())
                .channelType(channel.getChannelType())
                .settings(channel.getSettings())
                .isActive(channel.getIsActive())
                .rateLimitPerHour(channel.getRateLimitPerHour())
                .priority(channel.getPriority())
                .totalNotificationsSent(channel.getTotalNotificationsSent())
                .successfulNotifications(channel.getSuccessfulNotifications())
                .failedNotifications(channel.getFailedNotifications())
                .createdAt(channel.getCreatedAt())
                .updatedAt(channel.getUpdatedAt())
                .build();
    }
}
