package com.tlaq.main_service.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;


public class ImageValidator implements ConstraintValidator<ImageConstraint, List<MultipartFile>> {
    private int min;
    private int max;

    @Override
    public void initialize(ImageConstraint constraintAnnotation) {
        this.min = constraintAnnotation.min();
        this.max = constraintAnnotation.max();
    }

    @Override
    public boolean isValid(List<MultipartFile> images, ConstraintValidatorContext context) {
        if (images == null) {
            return false;
        }
        int size = images.size();
        boolean isValid = size >= min && size <= max;
        if (!isValid) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(context.getDefaultConstraintMessageTemplate())
                    .addConstraintViolation();
        }
        return isValid;
    }
}
