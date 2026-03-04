package com.tlaq.catalog_service.mapper;

import com.tlaq.catalog_service.dto.request.ShowRoomRequest;
import com.tlaq.catalog_service.dto.response.ShowRoomResponse;
import com.tlaq.catalog_service.entity.ShowRoom;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ShowRoomMapper {
    @Mapping(target = "showRoomImages", ignore = true)
    ShowRoom toShowRoom(ShowRoomRequest request);

    @Mapping(target = "images", expression = "java(showRoom.getShowRoomImages().stream().map(img -> img.getImage()).toList())")
    ShowRoomResponse toShowRoomResponse(ShowRoom showRoom);

    void updateShowRoom(@MappingTarget ShowRoom showRoom, ShowRoomRequest request);
}