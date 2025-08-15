package com.tlaq.main_service.mapper.decorator;

import com.tlaq.main_service.dto.requests.carRequest.CarRequest;
import com.tlaq.main_service.dto.responses.carResponse.CarResponse;
import com.tlaq.main_service.entity.*;
import com.tlaq.main_service.exceptions.AppException;
import com.tlaq.main_service.exceptions.ErrorCode;
import com.tlaq.main_service.mapper.CarMapper;
import com.tlaq.main_service.repositories.CarFeatureRepository;
import com.tlaq.main_service.repositories.CarImageRepository;
import com.tlaq.main_service.repositories.CarServiceRepository;
import com.tlaq.main_service.repositories.CarTypeRepository;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import java.util.Optional;


@Component
public abstract class CarMapperDecorator implements CarMapper {
    @Autowired
    @Qualifier("delegate")
    private CarMapper delegate;

    @Autowired
    private CarTypeRepository carTypeRepository;

    @Override
    public Car toCar(CarRequest carRequest) {
        if (carRequest == null) throw new AppException(ErrorCode.REQUEST_CAR_IS_EMPTY);
        var carType = carTypeRepository.findById(carRequest.getCarTypeId()).orElseThrow(
                () -> new AppException(ErrorCode.CAR_TYPE_NOT_EXISTED)
        );

        return Car.builder()
                .name(carRequest.getName())
                .year(carRequest.getYear())
                .carType(carType)
                .carFeature(CarFeature.builder()
                    .mayDieuHoa(carRequest.getCarFeature().getMayDieuHoa())
                    .manHinh(carRequest.getCarFeature().getManHinh())
                    .ghe(carRequest.getCarFeature().getGhe())
                    .sacKhongDay(carRequest.getCarFeature().isSacKhongDay())
                    .copDien(carRequest.getCarFeature().isCopDien())
                    .cuaSo(carRequest.getCarFeature().getCuaSo())
                    .hoTroPhanh(carRequest.getCarFeature().getHoTroPhanh())
                    .bluetooth(carRequest.getCarFeature().isBluetooth())
                    .camera(carRequest.getCarFeature().isCamera())
                    .phanhKhanCap(carRequest.getCarFeature().getPhanhKhanCap())
                    .hoTroGiuLan(carRequest.getCarFeature().isHoTroGiuLan())
                .build())

                .carService(CarService.builder()
                    .dongCo(carRequest.getCarService().getDongCo())
                    .hopSo(carRequest.getCarService().getHopSo())
                    .congSuat(carRequest.getCarService().getCongSuat())
                    .momenXoan(carRequest.getCarService().getMomenXoan())
                    .dungTichXiLanh(carRequest.getCarService().getDungTichXiLanh())
                    .dungTichXang(carRequest.getCarService().getDungTichXang())
                    .taiTrong(carRequest.getCarService().getTaiTrong())
                    .chieuDai(carRequest.getCarService().getChieuDai())
                    .mauSac(carRequest.getCarService().getMauSac())
                    .tocDoToiDa(carRequest.getCarService().getTocDoToiDa())
                    .loaiNhienLieu(carRequest.getCarService().getLoaiNhienLieu())
                .build())
            .build();
    }

}
