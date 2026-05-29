package com.tlaq.ordering_service.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrdersDetailsRequest {

    @NotBlank(message = "carId không được để trống")
    String carId;

    @NotBlank(message = "fullName không được để trống")
    String fullName;

    @NotBlank(message = "phoneNumber không được để trống")
    String phoneNumber;

    @NotBlank(message = "address không được để trống")
    String address;

    @NotBlank(message = "CCCD không được để trống")
    String cccd;

    @NotNull(message = "Ngày sinh không được để trống")
    LocalDate dob;
}