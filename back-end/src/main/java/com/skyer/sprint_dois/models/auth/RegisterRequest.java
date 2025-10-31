package com.skyer.sprint_dois.models.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "username is required")
        @Size(min = 3, max = 100, message = "username must be between 3 and 100 characters")
        String username,
        @NotBlank(message = "password is required")
        @Size(min = 6, max = 255, message = "password must be at least 6 characters")
        String password
) {
}
