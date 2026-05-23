package com.tlaq.payment_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {
    int currentPage;
    int totalPages;
    int pageSize;
    long totalElements;
    List<T> data;
}
