package com.example.ms_pedidos.repository;

import com.example.ms_pedidos.model.Pedido;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Integer> {

    // listar pedidos del usuario del mas reciente al mas antiguo
    List<Pedido> findByUsuarioEmailOrderByIdPedidoDesc(String usuarioEmail);

    // listar todos los pedidos del mas reciente al mas antiguo
    List<Pedido> findAllByOrderByIdPedidoDesc();
}
