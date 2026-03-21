package com.stock.authservice.validator;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = ProfanityValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface NotProfane {

    String message() default "Content contains inappropriate language";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
