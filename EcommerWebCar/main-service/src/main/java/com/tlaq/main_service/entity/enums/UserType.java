package com.tlaq.main_service.entity.enums;

public enum UserType {
    DEFAULT, GOOGLE;

    @Override
    public String toString() {
        return this.name();
    }
}
