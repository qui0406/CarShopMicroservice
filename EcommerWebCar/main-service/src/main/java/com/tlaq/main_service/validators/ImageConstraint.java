package com.tlaq.main_service.validators;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Documented
@Constraint(validatedBy = ImageValidator.class)
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.ANNOTATION_TYPE, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ImageConstraint {
    String message() default "Số lượng ảnh phải từ ${min} tới ${max}";
    int min() default 1;
    int max() default 5;
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
