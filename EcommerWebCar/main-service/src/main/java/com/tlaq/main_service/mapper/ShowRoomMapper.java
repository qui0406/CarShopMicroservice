package com.tlaq.main_service.mapper;

import com.tlaq.main_service.dto.requests.showroomRequest.ShowRoomRequest;
import com.tlaq.main_service.dto.responses.showroomResponse.ShowRoomResponse;
import com.tlaq.main_service.entity.CarImage;
import com.tlaq.main_service.entity.ShowRoom;
import com.tlaq.main_service.mapper.decorator.ShowRoomMapperDecorator;
import org.mapstruct.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
@DecoratedWith(ShowRoomMapperDecorator.class)
public interface ShowRoomMapper {
    ShowRoom toShowRoom(ShowRoomRequest request);

    ShowRoomResponse toShowRoomResponse(ShowRoom showRoom);
}
