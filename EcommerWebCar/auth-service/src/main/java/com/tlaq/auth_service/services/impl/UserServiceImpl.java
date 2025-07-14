package com.tlaq.auth_service.services.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.tlaq.auth_service.constants.PredefinedRole;
import com.tlaq.auth_service.dto.requests.RegistrationRequest;
import com.tlaq.auth_service.dto.responses.RegistrationResponse;
import com.tlaq.auth_service.entity.Role;
import com.tlaq.auth_service.entity.User;
import com.tlaq.auth_service.entity.enums.RoleUser;
import com.tlaq.auth_service.entity.enums.UserType;
import com.tlaq.auth_service.exceptions.AppException;
import com.tlaq.auth_service.exceptions.ErrorCode;
import com.tlaq.auth_service.mapper.UserMapper;
import com.tlaq.auth_service.repositories.RoleRepository;
import com.tlaq.auth_service.repositories.UserRepository;
import com.tlaq.auth_service.services.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashSet;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserServiceImpl implements UserService {
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    RoleRepository roleRepository;
    UserRepository userRepository;
    Cloudinary cloudinary;

    @Override
    public RegistrationResponse register(RegistrationRequest request) {
        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        HashSet<Role> roles = new HashSet<>();
        roleRepository.findById(PredefinedRole.USER_ROLE).ifPresent(roles::add);
        user.setRoles(roles);

        user.setActive(true);
        user.setType(UserType.DEFAULT);

        MultipartFile avatar = request.getAvatar();

        if (!avatar.isEmpty()) {
            try {
                Map res = cloudinary.uploader().upload(avatar.getBytes(), ObjectUtils.asMap("resource_type", "auto"));
                user.setAvatar(res.get("secure_url").toString());
            } catch (IOException ex) {
                throw new AppException(ErrorCode.UPLOAD_AVATAR_ERROR);
            }
        }
        log.info("Tao thanh cong");
        try{
            userRepository.save(user);
        }catch(DataIntegrityViolationException e){
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        return userMapper.toUserResponse(user);
    }
}
