package com.tlaq.auth_service.services.impl;


import com.tlaq.auth_service.dto.requests.RoleRequest;
import com.tlaq.auth_service.dto.responses.RoleResponse;
import com.tlaq.auth_service.exceptions.AppException;
import com.tlaq.auth_service.exceptions.ErrorCode;
import com.tlaq.auth_service.mapper.RoleMapper;
import com.tlaq.auth_service.repositories.PermissionRepository;
import com.tlaq.auth_service.repositories.RoleRepository;
import com.tlaq.auth_service.services.RoleService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleServiceImpl implements RoleService {
    RoleRepository roleRepository;
    PermissionRepository permissionRepository;
    RoleMapper roleMapper;

    public RoleResponse create(RoleRequest request) {
        var role = roleMapper.toRole(request);

        var permissions = permissionRepository.findAllById(request.getPermissions());
        role.setPermissions(new HashSet<>(permissions));

        role = roleRepository.save(role);
        return roleMapper.toRoleResponse(role);
    }

    public List<RoleResponse> getAll() {
        return roleRepository.findAll().stream().map(roleMapper::toRoleResponse).toList();
    }

    public void delete(int roleId) {
        roleRepository.deleteById(roleId);
    }

    @Override
    public RoleResponse addPermissionsToRole(int roleId, List<Integer> permissionIds) {
        var role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        var permissions = permissionRepository.findAllById(permissionIds);
        if (permissions.isEmpty()) {
            throw new AppException(ErrorCode.PERMISSION_NOT_FOUND);
        }

        role.getPermissions().addAll(permissions);
        role = roleRepository.save(role);

        return roleMapper.toRoleResponse(role);
    }
}
