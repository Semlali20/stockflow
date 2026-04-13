package com.stock.locationservice.audit;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.aop.support.AopUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

    private final RestTemplate auditRestTemplate;

    @Value("${audit.service.url:http://localhost:8083}")
    private String auditServiceUrl;

    private static final String SERVICE_KEY = "stockflow-service-2024";

    private static final Map<String, String> RESOURCE_TYPE_MAP = Map.of(
        "LocationController",  "LOCATION",
        "SiteController",      "SITE",
        "WarehouseController", "WAREHOUSE"
    );

    @Around("within(@org.springframework.web.bind.annotation.RestController *)")
    public Object audit(ProceedingJoinPoint pjp) throws Throwable {
        HttpServletRequest request = currentRequest();
        if (request == null) return pjp.proceed();

        String httpMethod = request.getMethod();
        if ("GET".equals(httpMethod) || "OPTIONS".equals(httpMethod) || "HEAD".equals(httpMethod)) {
            return pjp.proceed();
        }

        String userId = null, username = "anonymous";
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jat) {
            Jwt jwt = jat.getToken();
            userId   = jwt.getClaimAsString("userId");
            username = jwt.getClaimAsString("username");
            if (username == null) username = jwt.getSubject();
        } else if (auth != null && auth.isAuthenticated()) {
            username = auth.getName();
        }

        String targetClass  = AopUtils.getTargetClass(pjp.getTarget()).getSimpleName();
        String resourceType = RESOURCE_TYPE_MAP.getOrDefault(targetClass,
                targetClass.replace("Controller", "").toUpperCase());
        String action    = resolveAction(httpMethod, pjp.getSignature().getName());
        String ipAddress = extractIp(request);
        String userAgent = request.getHeader("User-Agent");

        Object result = null;
        String status = "SUCCESS";
        String errMsg = null;
        try {
            result = pjp.proceed();
        } catch (Throwable ex) {
            status = "FAILURE";
            errMsg = ex.getClass().getSimpleName() + ": " + ex.getMessage();
            throw ex;
        } finally {
            String resourceId  = extractResourceId(pjp, result);
            String description = buildDescription(action, resourceType, resourceId);
            sendAsync(userId, username, action, resourceType, resourceId,
                      description, ipAddress, userAgent, status, errMsg);
        }
        return result;
    }

    private String resolveAction(String httpMethod, String methodName) {
        if ("POST".equals(httpMethod))   return "CREATE";
        if ("PUT".equals(httpMethod) || "PATCH".equals(httpMethod)) return "UPDATE";
        if ("DELETE".equals(httpMethod)) return "DELETE";
        return "ACTION";
    }

    private String extractResourceId(ProceedingJoinPoint pjp, Object result) {
        try {
            Parameter[] params = ((MethodSignature) pjp.getSignature()).getMethod().getParameters();
            Object[]    args   = pjp.getArgs();
            for (int i = 0; i < params.length; i++) {
                if (params[i].isAnnotationPresent(PathVariable.class) && args[i] instanceof String s && !s.isBlank()) {
                    return s;
                }
            }
        } catch (Exception ignored) {}
        if (result != null) {
            try {
                Method getId = result.getClass().getMethod("getId");
                Object id = getId.invoke(result);
                if (id != null) return id.toString();
            } catch (Exception ignored) {}
        }
        return null;
    }

    private String buildDescription(String action, String type, String id) {
        String suffix = id != null ? " #" + id.substring(0, Math.min(8, id.length())) : "";
        return switch (action) {
            case "CREATE" -> "Created " + type + suffix;
            case "UPDATE" -> "Updated " + type + suffix;
            case "DELETE" -> "Deleted " + type + suffix;
            default       -> action + " " + type + suffix;
        };
    }

    private void sendAsync(String userId, String username, String action,
                           String resourceType, String resourceId, String description,
                           String ipAddress, String userAgent, String status, String errMsg) {
        CompletableFuture.runAsync(() -> {
            try {
                AuditEventRequest event = AuditEventRequest.builder()
                        .userId(userId).username(username)
                        .action(action).resourceType(resourceType).resourceId(resourceId)
                        .description(description).ipAddress(ipAddress).userAgent(userAgent)
                        .status(status).errorMessage(errMsg)
                        .build();
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("X-Service-Key", SERVICE_KEY);
                auditRestTemplate.postForEntity(
                        auditServiceUrl + "/internal/audit/log",
                        new HttpEntity<>(event, headers), Void.class);
            } catch (Exception e) {
                log.debug("Audit send failed (non-critical): {}", e.getMessage());
            }
        });
    }

    private HttpServletRequest currentRequest() {
        try {
            return ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        } catch (Exception e) {
            return null;
        }
    }

    private String extractIp(HttpServletRequest req) {
        String xff = req.getHeader("X-Forwarded-For");
        return (xff != null && !xff.isBlank()) ? xff.split(",")[0].trim() : req.getRemoteAddr();
    }
}
