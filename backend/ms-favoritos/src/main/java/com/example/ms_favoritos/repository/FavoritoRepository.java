package com.example.ms_favoritos.repository;

import com.example.ms_favoritos.model.Favorito;
import com.example.ms_favoritos.model.FavoritoId;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FavoritoRepository extends JpaRepository<Favorito, FavoritoId> {

    // listar los favoritos de un usuario
    List<Favorito> findByUsuarioEmail(String usuarioEmail);
}
