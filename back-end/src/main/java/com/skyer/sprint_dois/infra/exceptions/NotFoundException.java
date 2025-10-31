package com.skyer.sprint_dois.infra.exceptions;

public class NotFoundException extends RuntimeException{

    private String message;

    public NotFoundException(String s) {
        this.message = s;
    }

    @Override
    public String getMessage() {
        return message;
    }
}
