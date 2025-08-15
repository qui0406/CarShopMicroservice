package com.tlaq.main_service.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.BeanUtils;

import java.time.LocalDateTime;

public class DateTimeValidator implements ConstraintValidator<DateTimeConstraint, Object> {
    private String startField;
    private String endField;

    @Override
    public void initialize(DateTimeConstraint constraintAnnotation) {
        this.startField = constraintAnnotation.startField();
        this.endField = constraintAnnotation.endField();
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        try {
            LocalDateTime startDate = (LocalDateTime) BeanUtils.getPropertyDescriptor(
                    value.getClass(), startField
            ).getReadMethod().invoke(value);

            LocalDateTime endDate = (LocalDateTime) BeanUtils.getPropertyDescriptor(
                    value.getClass(), endField
            ).getReadMethod().invoke(value);

            if (startDate == null || endDate == null) {
                return true; // để @NotNull xử lý riêng
            }

            return endDate.isAfter(startDate);
        } catch (Exception e) {
            return false;
        }
    }
}
