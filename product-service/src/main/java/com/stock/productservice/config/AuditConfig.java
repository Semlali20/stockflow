package com.stock.productservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.web.client.RestTemplate;

@Configuration
@EnableAspectJAutoProxy
public class AuditConfig {

    @Bean(name = "auditRestTemplate")
    public RestTemplate auditRestTemplate() {
        RestTemplate rt = new RestTemplate();
        rt.getInterceptors().add((req, body, execution) -> {
            req.getHeaders().set("Content-Type", "application/json");
            return execution.execute(req, body);
        });
        return rt;
    }
}
