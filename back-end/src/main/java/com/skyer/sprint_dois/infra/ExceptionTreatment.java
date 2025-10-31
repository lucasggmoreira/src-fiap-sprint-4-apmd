package com.skyer.sprint_dois.infra;

import com.skyer.sprint_dois.infra.exceptions.NotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ExceptionTreatment {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<String> handleNotFound(RuntimeException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity handleBadRequest(MethodArgumentNotValidException e){
        var errors = e.getFieldErrors();
        return ResponseEntity.badRequest().body(errors.stream().map(ValidationErrorDTO::new).toList());
    }

    public record ValidationErrorDTO(String field, String message){
        public ValidationErrorDTO(FieldError error){
            this(error.getField(), error.getDefaultMessage());
        }
    }
}
