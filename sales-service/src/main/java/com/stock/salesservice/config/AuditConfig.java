package com.stock.salesservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.web.client.RestTemplate;

@Configuration
@EnableAspectJAutoProxy
public class AuditConfig {

    @Bean(name = "auditRestTemplate")
    public RestTemplate auditRestTemplate() {
        return new RestTemplate();
    }
}
