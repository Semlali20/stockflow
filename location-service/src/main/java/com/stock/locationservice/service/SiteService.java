package com.stock.locationservice.service;


import com.stock.locationservice.dto.SiteCreateRequest;
import com.stock.locationservice.dto.SiteDTO;
import com.stock.locationservice.entity.SiteType;

import java.util.List;

public interface SiteService {

    SiteDTO createSite(SiteCreateRequest request);

    SiteDTO getSiteById(String id);

    List<SiteDTO> getAllSites();

    List<SiteDTO> getSitesByType(SiteType type);

    List<SiteDTO> getActiveSites();

    SiteDTO updateSite(String id, SiteCreateRequest request);

    void deleteSite(String id);

    void activateSite(String id);

    void deactivateSite(String id);
}
