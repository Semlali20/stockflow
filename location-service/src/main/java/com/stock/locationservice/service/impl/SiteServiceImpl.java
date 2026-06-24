package com.stock.locationservice.service.impl;

import com.stock.locationservice.dto.SiteCreateRequest;
import com.stock.locationservice.dto.SiteDTO;
import com.stock.locationservice.entity.Site;
import com.stock.locationservice.entity.SiteType;
import com.stock.locationservice.repository.SiteRepository;
import com.stock.locationservice.service.SiteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SiteServiceImpl implements SiteService {

    private final SiteRepository siteRepository;

    @Override
    public SiteDTO createSite(SiteCreateRequest request) {
        log.info("Creating site with name: {}", request.getName());

        // Vérifier si le nom existe déjà
        if (siteRepository.existsByName(request.getName())) {
            throw new RuntimeException("Site with name " + request.getName() + " already exists");
        }

        Site site = Site.builder()
                .name(request.getName())
                .type(request.getType())
                .timezone(request.getTimezone())
                .address(request.getAddress())
                .settings(request.getSettings())
                .isActive(true)
                .build();

        Site savedSite = siteRepository.save(site);
        log.info("Site created successfully with ID: {}", savedSite.getId());

        return mapToDTO(savedSite);
    }

    @Override
    @Transactional(readOnly = true)
    public SiteDTO getSiteById(String id) {
        log.info("Fetching site with ID: {}", id);

        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Site not found with ID: " + id));

        return mapToDTO(site);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SiteDTO> getAllSites(SiteType type, Boolean active, Pageable pageable) {
        log.info("Fetching sites - type: {}, active: {}", type, active);

        Page<Site> page;
        if (type != null && active != null) {
            page = siteRepository.findByTypeAndIsActive(type, active, pageable);
        } else if (type != null) {
            page = siteRepository.findByType(type, pageable);
        } else if (active != null) {
            page = siteRepository.findByIsActive(active, pageable);
        } else {
            page = siteRepository.findAll(pageable);
        }

        return page.map(this::mapToDTO);
    }

    @Override
    public SiteDTO updateSite(String id, SiteCreateRequest request) {
        log.info("Updating site with ID: {}", id);

        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Site not found with ID: " + id));

        site.setName(request.getName());
        site.setType(request.getType());
        site.setTimezone(request.getTimezone());
        site.setAddress(request.getAddress());
        site.setSettings(request.getSettings());

        Site updatedSite = siteRepository.save(site);
        log.info("Site updated successfully with ID: {}", updatedSite.getId());

        return mapToDTO(updatedSite);
    }

    @Override
    public void deleteSite(String id) {
        log.info("Deleting site with ID: {}", id);

        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Site not found with ID: " + id));

        siteRepository.delete(site);
        log.info("Site deleted successfully with ID: {}", id);
    }

    @Override
    public void activateSite(String id) {
        log.info("Activating site with ID: {}", id);

        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Site not found with ID: " + id));

        site.setIsActive(true);
        siteRepository.save(site);
        log.info("Site activated successfully with ID: {}", id);
    }

    @Override
    public void deactivateSite(String id) {
        log.info("Deactivating site with ID: {}", id);

        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Site not found with ID: " + id));

        site.setIsActive(false);
        siteRepository.save(site);
        log.info("Site deactivated successfully with ID: {}", id);
    }

    // Mapper Entity → DTO
    private SiteDTO mapToDTO(Site site) {
        return SiteDTO.builder()
                .id(site.getId())
                .name(site.getName())
                .type(site.getType())
                .timezone(site.getTimezone())
                .address(site.getAddress())
                .settings(site.getSettings())
                .isActive(site.getIsActive())
                .createdAt(site.getCreatedAt())
                .updatedAt(site.getUpdatedAt())
                .build();
    }
}
