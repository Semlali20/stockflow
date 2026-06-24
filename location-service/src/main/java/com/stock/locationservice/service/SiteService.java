package com.stock.locationservice.service;


import com.stock.locationservice.dto.SiteCreateRequest;
import com.stock.locationservice.dto.SiteDTO;
import com.stock.locationservice.entity.SiteType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SiteService {

    SiteDTO createSite(SiteCreateRequest request);

    SiteDTO getSiteById(String id);

    Page<SiteDTO> getAllSites(SiteType type, Boolean active, Pageable pageable);

    SiteDTO updateSite(String id, SiteCreateRequest request);

    void deleteSite(String id);

    void activateSite(String id);

    void deactivateSite(String id);
}
