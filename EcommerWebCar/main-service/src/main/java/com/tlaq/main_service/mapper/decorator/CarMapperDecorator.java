package com.tlaq.main_service.mapper.decorator;

import com.tlaq.main_service.dto.requests.carRequest.CarRequest;
import com.tlaq.main_service.dto.responses.carResponse.*;
import com.tlaq.main_service.entity.*;
import com.tlaq.main_service.exceptions.AppException;
import com.tlaq.main_service.exceptions.ErrorCode;
import com.tlaq.main_service.mapper.CarMapper;
import com.tlaq.main_service.repositories.CarImageRepository;
import com.tlaq.main_service.repositories.CarModelRepository;
import com.tlaq.main_service.repositories.CarRepository;
import com.tlaq.main_service.repositories.CarTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;


@Component
public abstract class CarMapperDecorator implements CarMapper {
    @Autowired
    private CarModelRepository carModelRepository;

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private CarImageRepository carImageRepository;

    @Override
    public Car toCar(CarRequest carRequest) {
        if (carRequest == null) throw new AppException(ErrorCode.REQUEST_CAR_IS_EMPTY);
        CarModel carModel = carModelRepository.findById(carRequest.getCarModel()).orElseThrow(
                () -> new AppException(ErrorCode.MODEL_CAR_IS_EMPTY)
        );

        return Car.builder()
                .price(carRequest.getPrice())
                .name(carRequest.getName())
                .year(carRequest.getYear())
                .carFeature(CarFeature.builder()
                    .carComfort(CarComfort.builder()
                            .loa(carRequest.getCarFeature().getCarComfort().getLoa())
                            .gps(carRequest.getCarFeature().getCarComfort().isGps())
                            .ghe(carRequest.getCarFeature().getCarComfort().getGhe())
                            .bluetooth(carRequest.getCarFeature().getCarComfort().isBluetooth())
                            .copDien(carRequest.getCarFeature().getCarComfort().isCopDien())
                            .cuaSo(carRequest.getCarFeature().getCarComfort().getCuaSo())
                            .manHinh(carRequest.getCarFeature().getCarComfort().getManHinh())
                            .sacKhongDay(carRequest.getCarFeature().getCarComfort().isSacKhongDay())
                            .mayDieuHoa(carRequest.getCarFeature().getCarComfort().isMayDieuHoa())
                            .build())
                        .carExterior(CarExterior.builder()
                                .den(carRequest.getCarFeature().getCarExterior().getDen())
                                .gatMua(carRequest.getCarFeature().getCarExterior().getGatMua())
                                .guongDien(carRequest.getCarFeature().getCarExterior().isGuongDien())
                                .smartKey(carRequest.getCarFeature().getCarExterior().isSmartKey())
                                .build())
                        .featureSafety(FeatureSafety.builder()
                                .phanh(carRequest.getCarFeature().getFeatureSafety().getPhanh())
                                .camBienDoXe(carRequest.getCarFeature().getFeatureSafety().isCamBienDoXe())
                                .hoTroGiuLan(carRequest.getCarFeature().getFeatureSafety().isHoTroGiuLan())
                                .canBangDienTu(carRequest.getCarFeature().getFeatureSafety().isCanBangDienTu())
                                .tuiKhi(carRequest.getCarFeature().getFeatureSafety().isTuiKhi())
                                .camera(carRequest.getCarFeature().getFeatureSafety().isCamera())
                                .build())
                        .build())
                .carModel(carModel)

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

    @Override
    public CarResponse toCarResponse(Car car) {
        return CarResponse.builder()
                .id(car.getId())
                .name(car.getName())
                .price(car.getPrice())
                .year(car.getYear())
                .carBranch(car.getCarModel().getCarBranch().getName())
                .carModel(car.getCarModel().getName())
                .carImage(car.getCarImages().get(0).getImage())
                .createdAt(car.getCreatedAt())
                .updatedAt(car.getUpdatedAt())
                .build();
    }

    @Override
    public CarDetailsResponse toCarDetailsResponse(Car car) {
        List<String> images = carImageRepository.findByCarId(car.getId()).stream().map(CarImage::getImage).collect(Collectors.toList());

        return CarDetailsResponse.builder()
                .id(car.getId())
                .name(car.getName())
                .price(car.getPrice())
                .year(car.getYear())
                .carBranch(car.getCarModel().getName())
                .carModel(car.getCarModel().getCarBranch().getName())
                .createdAt(car.getCreatedAt())
                .carService(CarServiceResponse.builder()
                        .id(car.getCarService().getId())
                        .dongCo(car.getCarService().getDongCo())
                        .hopSo(car.getCarService().getHopSo())
                        .congSuat(car.getCarService().getCongSuat())
                        .momenXoan(car.getCarService().getMomenXoan())
                        .dungTichXiLanh(car.getCarService().getDungTichXiLanh())
                        .dungTichXang(car.getCarService().getDungTichXang())
                        .taiTrong(car.getCarService().getTaiTrong())
                        .chieuDai(car.getCarService().getChieuDai())
                        .mauSac(car.getCarService().getMauSac())
                        .tocDoToiDa(car.getCarService().getTocDoToiDa())
                        .loaiNhienLieu(car.getCarService().getLoaiNhienLieu())
                        .build())
                .carFeature(CarFeatureResponse.builder()
                        .carComfortResponse(CarComfortResponse.builder()
                                .id(car.getCarFeature().getId())
                                .loa(car.getCarFeature().getCarComfort().getLoa())
                                .gps(car.getCarFeature().getCarComfort().isGps())
                                .ghe(car.getCarFeature().getCarComfort().getGhe())
                                .bluetooth(car.getCarFeature().getCarComfort().isBluetooth())
                                .copDien(car.getCarFeature().getCarComfort().isCopDien())
                                .cuaSo(car.getCarFeature().getCarComfort().getCuaSo())
                                .manHinh(car.getCarFeature().getCarComfort().getManHinh())
                                .sacKhongDay(car.getCarFeature().getCarComfort().isSacKhongDay())
                                .mayDieuHoa(car.getCarFeature().getCarComfort().isMayDieuHoa())
                                .build())
                        .carExteriorResponse(CarExteriorResponse.builder()
                                .id(car.getCarFeature().getId())
                                .den(car.getCarFeature().getCarExterior().getDen())
                                .gatMua(car.getCarFeature().getCarExterior().getGatMua())
                                .guongDien(car.getCarFeature().getCarExterior().isGuongDien())
                                .smartKey(car.getCarFeature().getCarExterior().isSmartKey())
                                .build())
                        .featureSafetyResponse(FeatureSafetyResponse.builder()
                                .id(car.getCarFeature().getId())
                                .phanh(car.getCarFeature().getFeatureSafety().getPhanh())
                                .camBienDoXe(car.getCarFeature().getFeatureSafety().isCamBienDoXe())
                                .hoTroGiuLan(car.getCarFeature().getFeatureSafety().isHoTroGiuLan())
                                .canBangDienTu(car.getCarFeature().getFeatureSafety().isCanBangDienTu())
                                .tuiKhi(car.getCarFeature().getFeatureSafety().isTuiKhi())
                                .camera(car.getCarFeature().getFeatureSafety().isCamera())
                                .build())
                        .build())
                .images(images)
                .build();
    }
}
