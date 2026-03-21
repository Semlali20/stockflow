package com.stock.alertservice.dto.cache;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCacheDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private String id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Boolean isActive;

    private String phoneNumber;
    private String preferredLanguage;
    private List<String> roles;

    private LocalDateTime cachedAt;
    private String source;
}
