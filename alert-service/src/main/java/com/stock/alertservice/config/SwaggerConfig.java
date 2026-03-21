package com.stock.alertservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Configuration Swagger/OpenAPI pour la documentation de l'API
 */
@Configuration
public class SwaggerConfig {

    @Value("${server.port:8087}")
    private String serverPort;

    @Bean
    public OpenAPI alertServiceOpenAPI() {
        // Configuration du serveur
        Server server = new Server()
                .url("http://localhost:" + serverPort)
                .description("Alert Service - Development Server");

        // Information de contact
        Contact contact = new Contact()
                .name("Stock Management Team")
                .email("support@stock-management.com")
                .url("https://stock-management.com");

        // Licence
        License license = new License()
                .name("Apache 2.0")
                .url("https://www.apache.org/licenses/LICENSE-2.0.html");

        // Information de l'API
        Info info = new Info()
                .title("Alert Service API")
                .version("1.0.0")
                .description("API REST pour la gestion des alertes et notifications dans le système de gestion de stock")
                .contact(contact)
                .license(license);

        // Schéma de sécurité JWT
        SecurityScheme securityScheme = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .in(SecurityScheme.In.HEADER)
                .name("Authorization");

        SecurityRequirement securityRequirement = new SecurityRequirement()
                .addList("Bearer Authentication");

        return new OpenAPI()
                .info(info)
                .servers(List.of(server))
                .addSecurityItem(securityRequirement)
                .schemaRequirement("Bearer Authentication", securityScheme);
    }
}
