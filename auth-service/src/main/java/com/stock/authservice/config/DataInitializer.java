package com.stock.authservice.config;

import com.stock.authservice.entity.Permission;
import com.stock.authservice.entity.Role;
import com.stock.authservice.entity.User;
import com.stock.authservice.repository.PermissionRepository;
import com.stock.authservice.repository.RoleRepository;
import com.stock.authservice.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ─── Permission definitions: { name, description, category, resourceType } ──

    private static final Object[][] SYSTEM_PERMISSIONS = {
            // Dashboard
            { "dashboard:view",         "View dashboard and summary statistics",          "DASHBOARD",   "DASHBOARD"   },

            // Products
            { "products:view",          "View products and item details",                 "PRODUCTS",    "PRODUCT"     },
            { "products:create",        "Create new products and items",                  "PRODUCTS",    "PRODUCT"     },
            { "products:edit",          "Edit existing products and items",               "PRODUCTS",    "PRODUCT"     },
            { "products:delete",        "Delete products and items",                      "PRODUCTS",    "PRODUCT"     },

            // Categories
            { "categories:view",        "View product categories",                        "PRODUCTS",    "CATEGORY"    },
            { "categories:create",      "Create new product categories",                  "PRODUCTS",    "CATEGORY"    },
            { "categories:edit",        "Edit existing product categories",               "PRODUCTS",    "CATEGORY"    },
            { "categories:delete",      "Delete product categories",                      "PRODUCTS",    "CATEGORY"    },

            // Inventory
            { "inventory:view",         "View inventory stock levels",                    "INVENTORY",   "INVENTORY"   },
            { "inventory:create",       "Add new inventory records",                      "INVENTORY",   "INVENTORY"   },
            { "inventory:edit",         "Edit inventory records",                         "INVENTORY",   "INVENTORY"   },
            { "inventory:delete",       "Delete inventory records",                       "INVENTORY",   "INVENTORY"   },

            // Lots
            { "lots:view",              "View lot tracking information",                  "INVENTORY",   "LOT"         },
            { "lots:create",            "Create new lots",                                "INVENTORY",   "LOT"         },
            { "lots:edit",              "Edit lot information",                           "INVENTORY",   "LOT"         },
            { "lots:delete",            "Delete lots",                                    "INVENTORY",   "LOT"         },

            // Serials
            { "serials:view",           "View serial number tracking",                    "INVENTORY",   "SERIAL"      },
            { "serials:create",         "Register new serial numbers",                    "INVENTORY",   "SERIAL"      },
            { "serials:edit",           "Edit serial number information",                 "INVENTORY",   "SERIAL"      },
            { "serials:delete",         "Delete serial number records",                   "INVENTORY",   "SERIAL"      },

            // Locations
            { "locations:view",         "View sites, warehouses and locations",           "LOCATIONS",   "LOCATION"    },
            { "locations:create",       "Create new locations and warehouses",            "LOCATIONS",   "LOCATION"    },
            { "locations:edit",         "Edit location information",                      "LOCATIONS",   "LOCATION"    },
            { "locations:delete",       "Delete locations",                               "LOCATIONS",   "LOCATION"    },

            // Movements
            { "movements:view",         "View stock movements and history",               "MOVEMENTS",   "MOVEMENT"    },
            { "movements:create",       "Create new stock movements",                     "MOVEMENTS",   "MOVEMENT"    },
            { "movements:edit",         "Edit pending stock movements",                   "MOVEMENTS",   "MOVEMENT"    },
            { "movements:delete",       "Delete stock movements",                         "MOVEMENTS",   "MOVEMENT"    },
            { "movements:approve",      "Approve stock movements",                        "MOVEMENTS",   "MOVEMENT"    },
            { "movements:cancel",       "Cancel stock movements",                         "MOVEMENTS",   "MOVEMENT"    },

            // Alerts
            { "alerts:view",            "View alerts and notifications",                  "ALERTS",      "ALERT"       },
            { "alerts:manage",          "Manage alert rules and channels",                "ALERTS",      "ALERT"       },
            { "alerts:delete",          "Delete alerts",                                  "ALERTS",      "ALERT"       },

            // Users
            { "users:view",             "View user accounts",                             "USERS",       "USER"        },
            { "users:create",           "Create new user accounts",                       "USERS",       "USER"        },
            { "users:edit",             "Edit user accounts",                             "USERS",       "USER"        },
            { "users:delete",           "Delete user accounts",                           "USERS",       "USER"        },

            // Permissions
            { "permissions:view",       "View roles and permissions",                     "USERS",       "PERMISSION"  },
            { "permissions:manage",     "Create and manage roles and permissions",        "USERS",       "PERMISSION"  },

            // Audit
            { "audit:view",             "View audit logs",                                "AUDIT",       "AUDIT"       },

            // Settings
            { "settings:view",          "View system settings",                           "SETTINGS",    "SETTINGS"    },
            { "settings:manage",        "Manage system settings",                         "SETTINGS",    "SETTINGS"    },
    };

    // ─── Role definitions ──────────────────────────────────────────────────────

    private static final Object[][] SYSTEM_ROLES = {
            { "ADMIN",             "Full system access" },
            { "MANAGER",          "Broad access except user and permission management" },
            { "WAREHOUSE_MANAGER","Full warehouse, inventory and movement control" },
            { "SUPERVISOR",       "Supervise operations, approve movements" },
            { "OPERATOR",         "Day-to-day operational tasks" },
            { "PROCUREMENT",      "Product and lot creation for purchasing" },
            { "AUDITOR",          "Read-only audit access" },
            { "USER",             "Default user role" },
    };

    // ─── Role → Permission mapping (mirrors frontend permissions.ts) ────────────

    private static final Map<String, Set<String>> ROLE_PERMISSION_MAP = new HashMap<>();
    static {
        ROLE_PERMISSION_MAP.put("ADMIN", null); // null = all permissions

        ROLE_PERMISSION_MAP.put("MANAGER", new HashSet<>(Arrays.asList(
                "dashboard:view",
                "products:view", "products:create", "products:edit",
                "categories:view", "categories:create", "categories:edit",
                "inventory:view", "inventory:create", "inventory:edit",
                "lots:view", "lots:create", "lots:edit",
                "serials:view", "serials:create", "serials:edit",
                "locations:view", "locations:create", "locations:edit",
                "movements:view", "movements:create", "movements:edit", "movements:approve", "movements:cancel",
                "alerts:view", "alerts:manage",
                "users:view",
                "audit:view",
                "settings:view"
        )));

        ROLE_PERMISSION_MAP.put("WAREHOUSE_MANAGER", new HashSet<>(Arrays.asList(
                "dashboard:view",
                "products:view",
                "categories:view",
                "inventory:view", "inventory:create", "inventory:edit",
                "lots:view", "lots:create", "lots:edit",
                "serials:view", "serials:create", "serials:edit",
                "locations:view", "locations:create", "locations:edit",
                "movements:view", "movements:create", "movements:edit", "movements:approve", "movements:cancel",
                "alerts:view",
                "settings:view"
        )));

        ROLE_PERMISSION_MAP.put("SUPERVISOR", new HashSet<>(Arrays.asList(
                "dashboard:view",
                "products:view",
                "categories:view",
                "inventory:view", "inventory:create",
                "lots:view", "lots:create",
                "serials:view", "serials:create",
                "locations:view",
                "movements:view", "movements:create", "movements:edit", "movements:approve",
                "alerts:view",
                "settings:view"
        )));

        ROLE_PERMISSION_MAP.put("OPERATOR", new HashSet<>(Arrays.asList(
                "dashboard:view",
                "products:view",
                "inventory:view",
                "lots:view",
                "serials:view",
                "locations:view",
                "movements:view", "movements:create",
                "alerts:view",
                "settings:view"
        )));

        ROLE_PERMISSION_MAP.put("PROCUREMENT", new HashSet<>(Arrays.asList(
                "dashboard:view",
                "products:view", "products:create", "products:edit",
                "categories:view", "categories:create",
                "inventory:view",
                "lots:view", "lots:create",
                "locations:view",
                "movements:view", "movements:create",
                "alerts:view",
                "settings:view"
        )));

        ROLE_PERMISSION_MAP.put("AUDITOR", new HashSet<>(Arrays.asList(
                "dashboard:view",
                "products:view",
                "categories:view",
                "inventory:view",
                "lots:view",
                "serials:view",
                "locations:view",
                "movements:view",
                "alerts:view",
                "audit:view",
                "settings:view"
        )));

        ROLE_PERMISSION_MAP.put("USER", new HashSet<>(Arrays.asList(
                "dashboard:view",
                "products:view",
                "inventory:view",
                "lots:view",
                "locations:view",
                "movements:view",
                "alerts:view",
                "settings:view"
        )));
    }

    // ─── Runner ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Map<String, Permission> allPermissions = initializePermissions();
        initializeRoles(allPermissions);
        initializeAdminUser();
    }

    // ─── Seed permissions ──────────────────────────────────────────────────────

    private Map<String, Permission> initializePermissions() {
        Map<String, Permission> result = new HashMap<>();

        for (Object[] pData : SYSTEM_PERMISSIONS) {
            String name         = (String) pData[0];
            String description  = (String) pData[1];
            String category     = (String) pData[2];
            String resourceType = (String) pData[3];

            Permission perm = permissionRepository.findByName(name).orElseGet(() -> {
                Permission p = Permission.builder()
                        .name(name)
                        .description(description)
                        .category(category)
                        .resourceType(resourceType)
                        .isSystem(true)
                        .build();
                Permission saved = permissionRepository.save(p);
                log.info("Permission created: {}", name);
                return saved;
            });
            result.put(name, perm);
        }

        log.info("Permissions initialized: {} total", result.size());
        return result;
    }

    // ─── Seed roles + assign permissions ──────────────────────────────────────

    private void initializeRoles(Map<String, Permission> allPermissions) {
        for (Object[] roleData : SYSTEM_ROLES) {
            String roleName    = (String) roleData[0];
            String description = (String) roleData[1];

            Role role = roleRepository.findByName(roleName).orElseGet(() -> {
                Role r = Role.builder()
                        .name(roleName)
                        .description(description)
                        .isSystem(true)
                        .isActive(true)
                        .build();
                Role saved = roleRepository.save(r);
                log.info("Role created: {}", roleName);
                return saved;
            });

            // Assign permissions if not already assigned
            Set<String> assignedNames = role.getPermissions().stream()
                    .map(Permission::getName)
                    .collect(Collectors.toSet());

            Set<String> targetNames = ROLE_PERMISSION_MAP.get(roleName);
            Set<Permission> targetPerms = (targetNames == null)
                    ? new HashSet<>(allPermissions.values())           // ADMIN → all
                    : targetNames.stream()
                            .map(allPermissions::get)
                            .filter(Objects::nonNull)
                            .collect(Collectors.toSet());

            boolean changed = false;
            for (Permission p : targetPerms) {
                if (!assignedNames.contains(p.getName())) {
                    role.addPermission(p);
                    changed = true;
                }
            }

            if (changed) {
                roleRepository.save(role);
                log.info("Permissions assigned to role {}: {} permissions", roleName, role.getPermissions().size());
            }
        }
    }

    // ─── Seed admin user ───────────────────────────────────────────────────────

    private void initializeAdminUser() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            Role adminRole = roleRepository.findByName("ADMIN").orElseThrow();

            User admin = User.builder()
                    .username("admin")
                    .email("admin@stock.com")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .firstName("System")
                    .lastName("Administrator")
                    .isActive(true)
                    .isEmailVerified(true)
                    .mfaEnabled(false)
                    .failedLoginAttempts(0)
                    .roles(Set.of(adminRole))
                    .build();

            userRepository.save(admin);
            log.info("Admin user created: admin / Admin@123");
        }
    }
}
