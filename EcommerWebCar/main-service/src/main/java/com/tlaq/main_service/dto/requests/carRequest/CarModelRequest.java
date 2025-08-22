package com.tlaq.main_service.dto.requests.carRequest;

import com.tlaq.main_service.entity.CarBranch;
import com.tlaq.main_service.entity.CarCategory;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarModelRequest {
    String name;
    Long categoryId;
    Long carBranchId;
}
