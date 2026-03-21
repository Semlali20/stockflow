package com.stock.movementservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${server.port:8083}")
    private String serverPort;

    @Value("${spring.application.name:movement-service}")
    private String applicationName;

    @Bean
    public OpenAPI movementServiceOpenAPI() {
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
                .title("Movement Service API")
                .version("1.0.0")
                .description("REST API for Stock Movement Management System. " +
                        "This service handles all stock movements including transfers, receipts, shipments, " +
                        "adjustments, and returns.")
                .contact(contact)
                .license(license);

        return new OpenAPI()
                .info(info)
                .servers(List.of(devServer, prodServer));
    }
}
