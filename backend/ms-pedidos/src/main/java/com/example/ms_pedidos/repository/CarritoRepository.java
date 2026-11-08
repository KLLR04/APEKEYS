package com.example.ms_pedidos.repository;

import com.example.ms_pedidos.model.Carrito;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CarritoRepository extends JpaRepository<Carrito, Integer> {

    // buscar el carrito del usuario por su email
    Optional<Carrito> findByUsuarioEmail(String usuarioEmail);
}
