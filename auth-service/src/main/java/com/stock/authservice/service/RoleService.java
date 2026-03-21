package com.stock.authservice.service;

import com.stock.authservice.dto.request.PermissionAssignRequest;
import com.stock.authservice.dto.request.RoleCreateRequest;
import com.stock.authservice.dto.response.ApiResponse;
import com.stock.authservice.dto.response.PageResponse;
import com.stock.authservice.dto.response.PermissionResponse;
import com.stock.authservice.dto.response.RoleResponse;
import com.stock.authservice.entity.Permission;
import com.stock.authservice.entity.Role;
import com.stock.authservice.exception.DuplicateResourceException;
import com.stock.authservice.exception.ResourceNotFoundException;
import com.stock.authservice.repository.PermissionRepository;
import com.stock.authservice.repository.RoleRepository;
import com.stock.authservice.security.SecurityContextHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final SecurityContextHelper securityContextHelper;

    // ==================== CRUD OPERATIONS ====================

    @Transactional
    public ApiResponse<RoleResponse> createRole(RoleCreateRequest request) {
        log.info("Creating role: {}", request.getName());

        // Check if role exists
        if (roleRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Role", "name", request.getName());
        }

        // Create role
        Role role = Role.builder()
                .name(request.getName())
                .description(request.getDescription())
                .isSystem(request.getIsSystem() != null ? request.getIsSystem() : false)
                .isActive(true)
                .build();

        // Assign permissions if provided
        if (request.getPermissionIds() != null && !request.getPermissionIds().isEmpty()) {
            Set<Permission> permissions = new HashSet<>(
                    permissionRepository.findAllById(request.getPermissionIds())
            );
            role.setPermissions(permissions);
        }

        role = roleRepository.save(role);

        log.info("Role created successfully: {}", role.getName());
        return ApiResponse.success("Role created successfully", mapToRoleResponse(role));
    }

    @Transactional(readOnly = true)
    public RoleResponse getRoleById(String id) {
        log.debug("Getting role by id: {}", id);

        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));

        return mapToRoleResponse(role);
    }

    @Transactional(readOnly = true)
    public RoleResponse getRoleByName(String name) {
        log.debug("Getting role by name: {}", name);

        Role role = roleRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", name));

        return mapToRoleResponse(role);
    }

    @Transactional(readOnly = true)
    public PageResponse<RoleResponse> getAllRoles(int page, int size, String sortBy, String sortDirection) {
        log.debug("Getting all roles - page: {}, size: {}", page, size);

        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ?
                Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<Role> rolePage = roleRepository.findAll(pageable);

        List<RoleResponse> content = rolePage.getContent().stream()
                .map(this::mapToRoleResponse)
                .collect(Collectors.toList());

        return PageResponse.<RoleResponse>builder()
                .content(content)
                .pageNumber(rolePage.getNumber())
                .pageSize(rolePage.getSize())
                .totalElements(rolePage.getTotalElements())
                .totalPages(rolePage.getTotalPages())
                .isLast(rolePage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public List<RoleResponse> getAllActiveRoles() {
        log.debug("Getting all active roles");

        return roleRepository.findActiveRoles().stream()
                .map(this::mapToRoleResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RoleResponse> getCustomRoles() {
        log.debug("Getting custom (non-system) roles");

        return roleRepository.findCustomRoles().stream()
                .map(this::mapToRoleResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ApiResponse<RoleResponse> updateRole(String id, RoleCreateRequest request) {
        log.info("Updating role with id: {}", id);

        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));

        // Check if system role
        if (role.getIsSystem()) {
            throw new IllegalStateException("Cannot update system role");
        }

        // Check if name is being changed and already exists
        if (!role.getName().equals(request.getName()) &&
                roleRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Role", "name", request.getName());
        }

        role.setName(request.getName());
        role.setDescription(request.getDescription());

        // Update permissions if provided
        if (request.getPermissionIds() != null) {
            Set<Permission> permissions = new HashSet<>(
                    permissionRepository.findAllById(request.getPermissionIds())
            );
            role.setPermissions(permissions);
        }

        role = roleRepository.save(role);

        log.info("Role updated successfully: {}", role.getName());
        return ApiResponse.success("Role updated successfully", mapToRoleResponse(role));
    }

    @Transactional
    public ApiResponse<Void> deleteRole(String id) {
        log.info("Deleting role with id: {}", id);

        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));

        // Check if system role
        if (role.getIsSystem()) {
            throw new IllegalStateException("Cannot delete system role");
        }

        // Check if role is assigned to users
        if (!role.getUsers().isEmpty()) {
            throw new IllegalStateException("Cannot delete role that is assigned to users");
        }

        roleRepository.delete(role);

        log.info("Role deleted successfully: {}", role.getName());
        return ApiResponse.success("Role deleted successfully", null);
    }

    // ==================== PERMISSION MANAGEMENT ====================

    @Transactional
    public ApiResponse<RoleResponse> assignPermissions(String roleId, PermissionAssignRequest request) {
        log.info("Assigning permissions to role: {}", roleId);

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));

        Set<Permission> permissions = new HashSet<>(
                permissionRepository.findAllById(request.getPermissionIds())
        );

        if (permissions.size() != request.getPermissionIds().size()) {
            throw new ResourceNotFoundException("Some permissions not found");
        }

        role.getPermissions().addAll(permissions);
        role = roleRepository.save(role);

        log.info("Permissions assigned successfully to role: {}", role.getName());
        return ApiResponse.success("Permissions assigned successfully", mapToRoleResponse(role));
    }

    @Transactional
    public ApiResponse<RoleResponse> removePermission(String roleId, String permissionId) {
        log.info("Removing permission {} from role: {}", permissionId, roleId);

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));

        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Permission", "id", permissionId));

        role.getPermissions().remove(permission);
        role = roleRepository.save(role);

        log.info("Permission removed successfully from role: {}", role.getName());
        return ApiResponse.success("Permission removed successfully", mapToRoleResponse(role));
    }

    @Transactional(readOnly = true)
    public List<PermissionResponse> getRolePermissions(String roleId) {
        log.debug("Getting permissions for role: {}", roleId);

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));

        return role.getPermissions().stream()
                .map(this::mapToPermissionResponse)
                .collect(Collectors.toList());
    }

    // ==================== ROLE ACTIVATION ====================

    @Transactional
    public ApiResponse<Void> activateRole(String id) {
        log.info("Activating role: {}", id);

        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));

        role.setIsActive(true);
        roleRepository.save(role);

        log.info("Role activated successfully: {}", role.getName());
        return ApiResponse.success("Role activated successfully", null);
    }

    @Transactional
    public ApiResponse<Void> deactivateRole(String id) {
        log.info("Deactivating role: {}", id);

        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));

        // Check if system role
        if (role.getIsSystem()) {
            throw new IllegalStateException("Cannot deactivate system role");
        }

        role.setIsActive(false);
        roleRepository.save(role);

        log.info("Role deactivated successfully: {}", role.getName());
        return ApiResponse.success("Role deactivated successfully", null);
    }

    // ==================== HELPER METHODS ====================

    private RoleResponse mapToRoleResponse(Role role) {
        Set<PermissionResponse> permissions = role.getPermissions().stream()
                .map(this::mapToPermissionResponse)
                .collect(Collectors.toSet());

        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .isSystem(role.getIsSystem())
                .isActive(role.getIsActive())
                .permissions(permissions)
                .createdAt(role.getCreatedAt())
                .updatedAt(role.getUpdatedAt())
                .build();
    }

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
