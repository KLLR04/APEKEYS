package com.example.ms_usuario.repository;

import com.example.ms_usuario.model.TipoUsuario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TipoUsuarioRepository extends JpaRepository<TipoUsuario, Integer> {

    // buscar tipo de usuario por su descripcion sin importar mayusculas
    Optional<TipoUsuario> findByDescripcionIgnoreCase(String descripcion);
}
