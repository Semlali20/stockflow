package com.stock.authservice.service;

import com.stock.authservice.dto.request.PermissionCreateRequest;
import com.stock.authservice.dto.response.ApiResponse;
import com.stock.authservice.dto.response.PageResponse;
import com.stock.authservice.dto.response.PermissionResponse;
import com.stock.authservice.entity.Permission;
import com.stock.authservice.exception.DuplicateResourceException;
import com.stock.authservice.exception.ResourceNotFoundException;
import com.stock.authservice.repository.PermissionRepository;
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
public class PermissionService {

    private final PermissionRepository permissionRepository;

    // ==================== CRUD OPERATIONS ====================

    @Transactional
    public ApiResponse<PermissionResponse> createPermission(PermissionCreateRequest request) {
        log.info("Creating permission: {}", request.getName());

        // Check if permission exists
        if (permissionRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Permission", "name", request.getName());
        }

        Permission permission = Permission.builder()
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory())
                .resourceType(request.getResourceType())
                .isSystem(request.getIsSystem() != null ? request.getIsSystem() : false)
                .build();

        permission = permissionRepository.save(permission);

        log.info("Permission created successfully: {}", permission.getName());
        return ApiResponse.success("Permission created successfully", mapToPermissionResponse(permission));
    }

    @Transactional(readOnly = true)
    public PermissionResponse getPermissionById(String id) {
        log.debug("Getting permission by id: {}", id);

        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission", "id", id));

        return mapToPermissionResponse(permission);
    }

    @Transactional(readOnly = true)
    public PermissionResponse getPermissionByName(String name) {
        log.debug("Getting permission by name: {}", name);

        Permission permission = permissionRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Permission", "name", name));

        return mapToPermissionResponse(permission);
    }

    @Transactional(readOnly = true)
    public PageResponse<PermissionResponse> getAllPermissions(int page, int size, String sortBy, String sortDirection) {
        log.debug("Getting all permissions - page: {}, size: {}", page, size);

        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ?
                Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<Permission> permissionPage = permissionRepository.findAll(pageable);

        List<PermissionResponse> content = permissionPage.getContent().stream()
                .map(this::mapToPermissionResponse)
                .collect(Collectors.toList());

        return PageResponse.<PermissionResponse>builder()
                .content(content)
                .pageNumber(permissionPage.getNumber())
                .pageSize(permissionPage.getSize())
                .totalElements(permissionPage.getTotalElements())
                .totalPages(permissionPage.getTotalPages())
                .isLast(permissionPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public List<PermissionResponse> getPermissionsByCategory(String category) {
        log.debug("Getting permissions by category: {}", category);

        return permissionRepository.findByCategory(category).stream()
                .map(this::mapToPermissionResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PermissionResponse> getPermissionsByResourceType(String resourceType) {
        log.debug("Getting permissions by resource type: {}", resourceType);

        return permissionRepository.findByResourceType(resourceType).stream()
                .map(this::mapToPermissionResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PermissionResponse> getCustomPermissions() {
        log.debug("Getting custom (non-system) permissions");

        return permissionRepository.findCustomPermissions().stream()
                .map(this::mapToPermissionResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ApiResponse<PermissionResponse> updatePermission(String id, PermissionCreateRequest request) {
        log.info("Updating permission with id: {}", id);

        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission", "id", id));

        // Check if system permission
        if (permission.getIsSystem()) {
            throw new IllegalStateException("Cannot update system permission");
        }

        // Check if name is being changed and already exists
        if (!permission.getName().equals(request.getName()) &&
                permissionRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Permission", "name", request.getName());
        }

        permission.setName(request.getName());
        permission.setDescription(request.getDescription());
        permission.setCategory(request.getCategory());
        permission.setResourceType(request.getResourceType());

        permission = permissionRepository.save(permission);

        log.info("Permission updated successfully: {}", permission.getName());
        return ApiResponse.success("Permission updated successfully", mapToPermissionResponse(permission));
    }

    @Transactional
    public ApiResponse<Void> deletePermission(String id) {
        log.info("Deleting permission with id: {}", id);

        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission", "id", id));

        // Check if system permission
        if (permission.getIsSystem()) {
            throw new IllegalStateException("Cannot delete system permission");
        }

        // Check if permission is assigned to roles
        if (!permission.getRoles().isEmpty()) {
            throw new IllegalStateException("Cannot delete permission that is assigned to roles");
        }

        permissionRepository.delete(permission);

        log.info("Permission deleted successfully: {}", permission.getName());
        return ApiResponse.success("Permission deleted successfully", null);
    }

    // ==================== BULK OPERATIONS ====================

    @Transactional
    public ApiResponse<List<PermissionResponse>> createBulkPermissions(List<PermissionCreateRequest> requests) {
        log.info("Creating {} permissions in bulk", requests.size());

        List<Permission> permissions = requests.stream()
                .filter(request -> !permissionRepository.existsByName(request.getName()))
                .map(request -> Permission.builder()
                        .name(request.getName())
                        .description(request.getDescription())
                        .category(request.getCategory())
                        .resourceType(request.getResourceType())
                        .isSystem(request.getIsSystem() != null ? request.getIsSystem() : false)
                        .build())
                .collect(Collectors.toList());

        List<Permission> savedPermissions = permissionRepository.saveAll(permissions);

        List<PermissionResponse> responses = savedPermissions.stream()
                .map(this::mapToPermissionResponse)
                .collect(Collectors.toList());

        log.info("{} permissions created successfully", responses.size());
        return ApiResponse.success("Permissions created successfully", responses);
    }

    // ==================== HELPER METHODS ====================

    private PermissionResponse mapToPermissionResponse(Permission permission) {
        return PermissionResponse.builder()
                .id(permission.getId())
                .name(permission.getName())
                .description(permission.getDescription())
                .category(permission.getCategory())
                .resourceType(permission.getResourceType())
                .isSystem(permission.getIsSystem())
                .createdAt(permission.getCreatedAt())
                .build();
    }
}
