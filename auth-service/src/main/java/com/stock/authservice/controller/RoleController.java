package com.stock.authservice.controller;

import com.stock.authservice.dto.request.PermissionAssignRequest;
import com.stock.authservice.dto.request.RoleCreateRequest;
import com.stock.authservice.dto.response.ApiResponse;
import com.stock.authservice.dto.response.PageResponse;
import com.stock.authservice.dto.response.PermissionResponse;
import com.stock.authservice.dto.response.RoleResponse;
import com.stock.authservice.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Role Management", description = "Role and permission management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
@PreAuthorize("hasRole('ADMIN')")
public class RoleController {

    private final RoleService roleService;

    // ==================== CREATE ROLE ====================

    @PostMapping
    @Operation(summary = "Create role", description = "Create a new role")
    public ResponseEntity<ApiResponse<RoleResponse>> createRole(@Valid @RequestBody RoleCreateRequest request) {
        log.info("POST /api/roles - Create role: {}", request.getName());

        ApiResponse<RoleResponse> response = roleService.createRole(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ==================== GET ROLE ====================

    @GetMapping("/{id}")
    @Operation(summary = "Get role by ID", description = "Get role details by ID")
    public ResponseEntity<RoleResponse> getRoleById(@PathVariable String id) {
        log.info("GET /api/roles/{} - Get role by ID", id);

        RoleResponse response = roleService.getRoleById(id);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/name/{name}")
    @Operation(summary = "Get role by name", description = "Get role details by name")
    public ResponseEntity<RoleResponse> getRoleByName(@PathVariable String name) {
        log.info("GET /api/roles/name/{} - Get role by name", name);

        RoleResponse response = roleService.getRoleByName(name);

        return ResponseEntity.ok(response);
    }

    // ==================== LIST ROLES ====================

    @GetMapping
    @Operation(summary = "Get all roles", description = "Get paginated list of all roles")
    public ResponseEntity<PageResponse<RoleResponse>> getAllRoles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {
        log.info("GET /api/roles - Get all roles - page: {}, size: {}", page, size);

        PageResponse<RoleResponse> response = roleService.getAllRoles(page, size, sortBy, sortDirection);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/active")
    @Operation(summary = "Get active roles", description = "Get all active roles")
    public ResponseEntity<List<RoleResponse>> getActiveRoles() {
        log.info("GET /api/roles/active - Get active roles");

        List<RoleResponse> response = roleService.getAllActiveRoles();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/custom")
    @Operation(summary = "Get custom roles", description = "Get all custom (non-system) roles")
    public ResponseEntity<List<RoleResponse>> getCustomRoles() {
        log.info("GET /api/roles/custom - Get custom roles");

        List<RoleResponse> response = roleService.getCustomRoles();

        return ResponseEntity.ok(response);
    }

    // ==================== UPDATE ROLE ====================

    @PutMapping("/{id}")
    @Operation(summary = "Update role", description = "Update role details")
    public ResponseEntity<ApiResponse<RoleResponse>> updateRole(
            @PathVariable String id,
            @Valid @RequestBody RoleCreateRequest request) {
        log.info("PUT /api/roles/{} - Update role", id);

        ApiResponse<RoleResponse> response = roleService.updateRole(id, request);

        return ResponseEntity.ok(response);
    }

    // ==================== DELETE ROLE ====================

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete role", description = "Delete role by ID")
    public ResponseEntity<ApiResponse<Void>> deleteRole(@PathVariable String id) {
        log.info("DELETE /api/roles/{} - Delete role", id);

        ApiResponse<Void> response = roleService.deleteRole(id);

        return ResponseEntity.ok(response);
    }

    // ==================== ROLE ACTIVATION ====================

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate role", description = "Activate a role")
    public ResponseEntity<ApiResponse<Void>> activateRole(@PathVariable String id) {
        log.info("PATCH /api/roles/{}/activate - Activate role", id);

        ApiResponse<Void> response = roleService.activateRole(id);

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate role", description = "Deactivate a role")
    public ResponseEntity<ApiResponse<Void>> deactivateRole(@PathVariable String id) {
        log.info("PATCH /api/roles/{}/deactivate - Deactivate role", id);

        ApiResponse<Void> response = roleService.deactivateRole(id);

        return ResponseEntity.ok(response);
    }

    // ==================== PERMISSION MANAGEMENT ====================

    @GetMapping("/{id}/permissions")
    @Operation(summary = "Get role permissions", description = "Get all permissions for a role")
    public ResponseEntity<List<PermissionResponse>> getRolePermissions(@PathVariable String id) {
        log.info("GET /api/roles/{}/permissions - Get role permissions", id);

        List<PermissionResponse> response = roleService.getRolePermissions(id);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/permissions")
    @Operation(summary = "Assign permissions", description = "Assign permissions to a role")
    public ResponseEntity<ApiResponse<RoleResponse>> assignPermissions(
            @PathVariable String id,
            @Valid @RequestBody PermissionAssignRequest request) {
        log.info("POST /api/roles/{}/permissions - Assign permissions", id);

        ApiResponse<RoleResponse> response = roleService.assignPermissions(id, request);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{roleId}/permissions/{permissionId}")
    @Operation(summary = "Remove permission", description = "Remove a permission from a role")
    public ResponseEntity<ApiResponse<RoleResponse>> removePermission(
            @PathVariable String roleId,
            @PathVariable String permissionId) {
        log.info("DELETE /api/roles/{}/permissions/{} - Remove permission", roleId, permissionId);

        ApiResponse<RoleResponse> response = roleService.removePermission(roleId, permissionId);

        return ResponseEntity.ok(response);
    }
}
