package com.example.ms_catalogo.repository;

import com.example.ms_catalogo.model.Producto;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> {

    // listar productos por categoria
    List<Producto> findByCategoria_IdCategoria(Integer idCategoria);

    // verificar si una categoria tiene productos
    boolean existsByCategoria_IdCategoria(Integer idCategoria);

    // descontar stock de forma atomica solo si alcanza y el producto esta disponible
    @Modifying
    @Query("""
            UPDATE Producto p
            SET p.stock = p.stock - :cantidad
            WHERE p.idProducto = :productoId
              AND p.stock >= :cantidad
              AND p.disponibilidad = 'S'
            """)
    int descontarStock(
            @Param("productoId") Integer productoId,
            @Param("cantidad") Integer cantidad
    );
}
