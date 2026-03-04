package com.tlaq.catalog_service.specifications;

import com.tlaq.catalog_service.entity.Car;
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

    public static Specification<Car> hasCondition(Boolean isUsed) {
        return (root, query, cb) -> isUsed == null ? null : cb.equal(root.get("isUsed"), isUsed);
    }

    // Lọc theo khoảng năm sản xuất [cite: 2026-02-25]
    public static Specification<Car> yearBetween(Integer fromYear, Integer toYear) {
        return (root, query, cb) -> {
            if (fromYear != null && toYear != null) return cb.between(root.get("manufacturingYear"), fromYear, toYear);
            if (fromYear != null) return cb.greaterThanOrEqualTo(root.get("manufacturingYear"), fromYear);
            if (toYear != null) return cb.lessThanOrEqualTo(root.get("manufacturingYear"), toYear);
            return null;
        };
    }
}
