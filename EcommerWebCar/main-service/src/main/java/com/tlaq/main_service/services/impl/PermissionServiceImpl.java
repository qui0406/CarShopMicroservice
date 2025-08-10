package com.tlaq.main_service.services.impl;

import com.tlaq.main_service.dto.requests.PermissionRequest;
import com.tlaq.main_service.dto.responses.PermissionResponse;
import com.tlaq.main_service.entity.Permission;
import com.tlaq.main_service.mapper.PermissionMapper;
import com.tlaq.main_service.repositories.PermissionRepository;
import com.tlaq.main_service.services.PermissionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PermissionServiceImpl implements PermissionService {
    PermissionRepository permissionRepository;
    PermissionMapper permissionMapper;


    public PermissionResponse create(PermissionRequest request) {
        Permission permission = permissionMapper.toPermission(request);
        permission = permissionRepository.save(permission);
        return permissionMapper.toPermissionResponse(permission);
    }

    public List<PermissionResponse> getAll() {
        var permissions = permissionRepository.findAll();
        return permissions.stream().map(permissionMapper::toPermissionResponse).toList();
    }

    public void delete(int id) {
        permissionRepository.deleteById(id);
    }


}
