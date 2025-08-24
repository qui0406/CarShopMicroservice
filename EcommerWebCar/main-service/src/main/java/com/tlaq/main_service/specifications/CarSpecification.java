package com.tlaq.main_service.specifications;

import com.tlaq.main_service.entity.Car;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public class CarSpecification {
    public static Specification<Car> hasBranch(String branch) {
        return (root, query, cb) -> branch == null || branch.isEmpty() ?
                cb.conjunction() :
                cb.equal(root.join("carModel").join("carBranch").get("name"), branch);
    }

    public static Specification<Car> hasModel(String model) {
        return (root, query, cb) -> model == null || model.isEmpty() ?
                cb.conjunction() :
                cb.equal(root.join("carModel").get("name"), model);
    }

    public static Specification<Car> hasCategory(String category) {
        return (root, query, cb) -> category == null || category.isEmpty() ?
                cb.conjunction() :
                cb.equal(root.join("carModel").join("category").get("name"), category);
    }

    public static Specification<Car> priceBetween(BigDecimal fromPrice, BigDecimal toPrice) {
        return (root, query, cb) -> {
            if (fromPrice != null && toPrice != null) {
                return cb.between(root.get("price"), fromPrice, toPrice);
            } else if (fromPrice != null) {
                return cb.greaterThanOrEqualTo(root.get("price"), fromPrice);
            } else if (toPrice != null) {
                return cb.lessThanOrEqualTo(root.get("price"), toPrice);
            }
            return cb.conjunction();
        };
    }
}
