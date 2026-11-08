package com.example.ms_usuario.config;

import com.example.ms_usuario.model.TipoUsuario;
import com.example.ms_usuario.model.Usuario;
import com.example.ms_usuario.repository.TipoUsuarioRepository;
import com.example.ms_usuario.repository.UsuarioRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class DataInitializer implements CommandLineRunner {

    public static final String ROL_ADMINISTRADOR = "ADMINISTRADOR";
    public static final String ROL_CLIENTE = "CLIENTE";

    private final TipoUsuarioRepository tipoUsuarioRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    private final String adminEmail;
    private final String adminPassword;
    private final String adminNombre;
    private final String adminApellido;

    public DataInitializer(
            TipoUsuarioRepository tipoUsuarioRepository,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.email}") String adminEmail,
            @Value("${app.admin.password}") String adminPassword,
            @Value("${app.admin.nombre}") String adminNombre,
            @Value("${app.admin.apellido}") String adminApellido) {

        this.tipoUsuarioRepository = tipoUsuarioRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.adminNombre = adminNombre;
        this.adminApellido = adminApellido;
    }

    @Override
    public void run(String... args) {

        // crear los tipos de usuario base si no existen
        TipoUsuario administrador = buscarOCrearTipo(ROL_ADMINISTRADOR);
        buscarOCrearTipo(ROL_CLIENTE);

        // crear el usuario administrador inicial si no existe
        String email = adminEmail.trim().toLowerCase(Locale.ROOT);

        if (!usuarioRepository.existsById(email)) {

            Usuario admin = new Usuario();
            admin.setEmail(email);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setNombre(adminNombre);
            admin.setApellido(adminApellido);
            admin.setTipoUsuario(administrador);

            usuarioRepository.save(admin);
        }
    }

    private TipoUsuario buscarOCrearTipo(String descripcion) {

        return tipoUsuarioRepository
                .findByDescripcionIgnoreCase(descripcion)
                .orElseGet(() -> {
                    TipoUsuario tipo = new TipoUsuario();
                    tipo.setDescripcion(descripcion);

                    return tipoUsuarioRepository.save(tipo);
                });
    }
}
