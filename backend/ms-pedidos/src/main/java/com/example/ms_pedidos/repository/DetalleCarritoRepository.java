package com.example.ms_pedidos.repository;

import com.example.ms_pedidos.model.DetalleCarrito;
import com.example.ms_pedidos.model.DetalleCarritoId;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetalleCarritoRepository
        extends JpaRepository<DetalleCarrito, DetalleCarritoId> {

    // listar los productos de un carrito
    List<DetalleCarrito> findByCarrito_IdCarrito(Integer idCarrito);
}
