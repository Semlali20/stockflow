package com.stock.purchaseservice.config;

import io.swagger.v3.oas.models.Components;
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

@Configuration
public class OpenApiConfig {

    @Value("${server.port:8089}")
    private String serverPort;

    @Value("${spring.application.name:purchase-service}")
    private String applicationName;

    @Bean
    public OpenAPI purchaseServiceOpenAPI() {
        Server devServer = new Server();
        devServer.setUrl("http://localhost:" + serverPort);
        devServer.setDescription("Development Server");

        Server prodServer = new Server();
        prodServer.setUrl("https://api.yourcompany.com");
        prodServer.setDescription("Production Server");

        Contact contact = new Contact()
                .name("Stock Management Team")
                .email("support@yourcompany.com")
                .url("https://www.yourcompany.com");

        License license = new License()
                .name("Apache 2.0")
                .url("https://www.apache.org/licenses/LICENSE-2.0.html");

        Info info = new Info()
                .title("Purchase Service API")
                .version("1.0.0")
                .description("REST API for Purchase Management in the Stock Management System. " +
                        "This service handles supplier management and purchase order lifecycle " +
                        "including creation, confirmation, sending, receiving, and cancellation.")
                .contact(contact)
                .license(license);

        SecurityScheme jwtScheme = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .name("BearerAuth")
                .description("Enter JWT Bearer token");

        return new OpenAPI()
                .info(info)
                .servers(List.of(devServer, prodServer))
                .addSecurityItem(new SecurityRequirement().addList("BearerAuth"))
                .components(new Components().addSecuritySchemes("BearerAuth", jwtScheme));
    }
}
