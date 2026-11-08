package com.example.ms_favoritos.repository;

import com.example.ms_favoritos.model.Favorito;
import com.example.ms_favoritos.model.FavoritoId;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FavoritoRepository extends JpaRepository<Favorito, FavoritoId> {

    // listar los favoritos de un usuario
    List<Favorito> findByUsuarioEmail(String usuarioEmail);

    // borrar los favoritos que apuntan a un producto eliminado del catalogo
    @Modifying
    @Query("DELETE FROM Favorito f WHERE f.productoId = :productoId")
    int eliminarPorProducto(@Param("productoId") Integer productoId);
}
