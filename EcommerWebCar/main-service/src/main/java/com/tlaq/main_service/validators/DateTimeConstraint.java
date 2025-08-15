package com.tlaq.main_service.validators;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;
import java.time.LocalDateTime;

@Documented
@Constraint(validatedBy = DateTimeValidator.class)
@Target({ElementType.TYPE}) // gắn ở class để đọc nhiều field
@Retention(RetentionPolicy.RUNTIME)
public @interface DateTimeConstraint {
    String message() default "Ngày hết hạn phải sau ngày tạo";
    String startField();
    String endField();

    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
