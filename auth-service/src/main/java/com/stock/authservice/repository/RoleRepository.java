package com.stock.authservice.repository;

import com.stock.authservice.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, String> {

    Optional<Role> findByName(String name);

    Boolean existsByName(String name);

    List<Role> findByIsActive(Boolean isActive);

    List<Role> findByIsSystem(Boolean isSystem);

    @Query("SELECT r FROM Role r WHERE r.isSystem = false")
    List<Role> findCustomRoles();

    @Query("SELECT r FROM Role r WHERE r.isActive = true")
    List<Role> findActiveRoles();
}
