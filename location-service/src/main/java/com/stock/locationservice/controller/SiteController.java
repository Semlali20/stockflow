package com.stock.locationservice.controller;

import com.stock.locationservice.dto.SiteCreateRequest;
import com.stock.locationservice.dto.SiteDTO;
import com.stock.locationservice.entity.SiteType;
import com.stock.locationservice.service.SiteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
@Slf4j
public class SiteController {

    private final SiteService siteService;

    @PostMapping
    public ResponseEntity<SiteDTO> createSite(@Valid @RequestBody SiteCreateRequest request) {
        log.info("REST request to create site: {}", request.getName());
        SiteDTO created = siteService.createSite(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SiteDTO> getSiteById(@PathVariable String id) {
        log.info("REST request to get site by ID: {}", id);
        SiteDTO site = siteService.getSiteById(id);
        return ResponseEntity.ok(site);
    }

    @GetMapping
    public ResponseEntity<List<SiteDTO>> getAllSites(
            @RequestParam(required = false) SiteType type,
            @RequestParam(required = false) Boolean active) {
        log.info("REST request to get all sites - type: {}, active: {}", type, active);

        List<SiteDTO> sites;

        if (type != null) {
            sites = siteService.getSitesByType(type);
        } else if (active != null && active) {
            sites = siteService.getActiveSites();
        } else {
            sites = siteService.getAllSites();
        }

        return ResponseEntity.ok(sites);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SiteDTO> updateSite(
            @PathVariable String id,
            @Valid @RequestBody SiteCreateRequest request) {
        log.info("REST request to update site with ID: {}", id);
        SiteDTO updated = siteService.updateSite(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSite(@PathVariable String id) {
        log.info("REST request to delete site with ID: {}", id);
        siteService.deleteSite(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<Void> activateSite(@PathVariable String id) {
        log.info("REST request to activate site with ID: {}", id);
        siteService.activateSite(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateSite(@PathVariable String id) {
        log.info("REST request to deactivate site with ID: {}", id);
        siteService.deactivateSite(id);
        return ResponseEntity.ok().build();
    }
}
