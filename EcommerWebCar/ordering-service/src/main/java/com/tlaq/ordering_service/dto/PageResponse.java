package com.tlaq.ordering_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.TypeAlias;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TypeAlias("OrderPageResponse")
public class PageResponse<T> {
    int currentPage;
    int totalPages;
    long totalElements;
    List<T> data;
}