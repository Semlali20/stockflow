package com.stock.locationservice.repository;

import com.stock.locationservice.entity.Site;
import com.stock.locationservice.entity.SiteType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SiteRepository extends JpaRepository<Site, String> {

    Optional<Site> findByName(String name);

    List<Site> findByType(SiteType type);

    List<Site> findByIsActive(Boolean isActive);

    List<Site> findByTypeAndIsActive(SiteType type, Boolean isActive);

    boolean existsByName(String name);
}
