package com.tlaq.main_service.services.impl;

import com.tlaq.main_service.dto.requests.voucherRequest.VoucherRequest;
import com.tlaq.main_service.dto.responses.voucherResponse.VoucherResponse;
import com.tlaq.main_service.entity.ShowRoom;
import com.tlaq.main_service.entity.Voucher;
import com.tlaq.main_service.exceptions.AppException;
import com.tlaq.main_service.exceptions.ErrorCode;
import com.tlaq.main_service.mapper.VoucherMapper;
import com.tlaq.main_service.repositories.ShowRoomRepository;
import com.tlaq.main_service.repositories.VoucherRepository;
import com.tlaq.main_service.services.VoucherService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VoucherServiceImpl implements VoucherService {
    VoucherMapper voucherMapper;
    VoucherRepository voucherRepository;
    ShowRoomRepository showRoomRepository;

    @Override
    public VoucherResponse getVoucher(Long voucherId) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(()-> new AppException(ErrorCode.VOUCHER_IS_EMPTY));
        return voucherMapper.toVoucherResponse(voucher);
    }

    @Override
    public List<VoucherResponse> getVouchers(String showroomId) {
        List<Voucher> vouchers = voucherRepository.findAllVouchersByShowRoomId(showroomId);
        if(vouchers.isEmpty()){
            throw new AppException(ErrorCode.VOUCHER_IS_EMPTY);
        }
        return voucherMapper.toListVoucherResponse(vouchers);
    }

    @Override
    public VoucherResponse createVoucher(VoucherRequest request, String showroomId) {
        Voucher voucher = voucherMapper.toVoucher(request);
        ShowRoom showRoom = showRoomRepository.findById(showroomId).orElseThrow(()-> new AppException(ErrorCode.SHOW_ROOM_IS_EMPTY));
        voucher.setShowRoom(showRoom);
        return voucherMapper.toVoucherResponse(voucherRepository.save(voucher));
    }

    @Override
    public VoucherResponse updateVoucher(VoucherRequest voucherRequest, Long voucherId) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(()-> new AppException(ErrorCode.VOUCHER_IS_EMPTY));

        voucherMapper.updateVoucherFromRequest(voucherRequest, voucher);
        voucher = voucherRepository.save(voucher);
        return voucherMapper.toVoucherResponse(voucher);
    }

    @Override
    public void deleteVoucher(Long voucherId) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(()-> new AppException(ErrorCode.VOUCHER_IS_EMPTY));
        voucherRepository.delete(voucher);
    }
}
