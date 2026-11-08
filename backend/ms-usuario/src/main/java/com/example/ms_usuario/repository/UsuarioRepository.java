package com.example.ms_usuario.repository;

import com.example.ms_usuario.model.Usuario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, String> {

    // verificar si algun usuario usa el tipo indicado
    boolean existsByTipoUsuario_IdTipoUsuario(Integer idTipoUsuario);
}
