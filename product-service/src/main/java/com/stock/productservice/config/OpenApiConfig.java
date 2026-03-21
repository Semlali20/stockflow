package com.stock.productservice.config;

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
    public OpenAPI productServiceOpenAPI() {
        Server devServer = new Server();
        devServer.setUrl("http://localhost:8082");
        devServer.setDescription("Development Server");

        Server dockerServer = new Server();
        dockerServer.setUrl("http://api-gateway:8083/product-service");
        dockerServer.setDescription("Docker Server");

        Contact contact = new Contact();
        contact.setName("Product Management Team");
        contact.setEmail("support@stock-management.com");

        License license = new License()
                .name("MIT License")
                .url("https://opensource.org/licenses/MIT");

        Info info = new Info()
                .title("Product Service API")
                .version("1.0.0")
                .contact(contact)
                .description("Product Management API - Products, Categories, and Suppliers")
                .license(license);

        return new OpenAPI()
                .info(info)
                .servers(List.of(devServer, dockerServer));
    }
}
