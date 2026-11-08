package com.example.ms_usuario.controller;

import com.example.ms_usuario.dto.LoginRequestDTO;
import com.example.ms_usuario.dto.LoginResponseDTO;
import com.example.ms_usuario.service.AuthService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // iniciar sesion y obtener token
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
            @RequestBody LoginRequestDTO datos) {

        return ResponseEntity.ok(authService.login(datos));
    }
}
