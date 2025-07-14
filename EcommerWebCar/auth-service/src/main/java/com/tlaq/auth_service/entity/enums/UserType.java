package com.tlaq.auth_service.entity.enums;

public enum UserType {
    DEFAULT, GOOGLE;

    @Override
    public String toString() {
        return this.name();
    }
}
