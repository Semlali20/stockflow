package com.stock.locationservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI locationServiceOpenAPI() {
        Server devServer = new Server();
        devServer.setUrl("http://localhost:8085");
        devServer.setDescription("Development Server");

        Server dockerServer = new Server();
        dockerServer.setUrl("http://api-gateway:8083/location-service");
        dockerServer.setDescription("Docker Server");

        Contact contact = new Contact();
        contact.setName("Warehouse Team");
        contact.setEmail("support@warehouse.com");

        License license = new License()
                .name("MIT License")
                .url("https://opensource.org/licenses/MIT");

        Info info = new Info()
                .title("Location Service API")
                .version("1.0.0")
                .contact(contact)
                .description("Warehouse Location Management API - Sites, Warehouses, and Locations")
                .license(license);

        return new OpenAPI()
                .info(info)
                .servers(List.of(devServer, dockerServer));
    }
}
