package com.example.ms_pedidos.repository;

import com.example.ms_pedidos.model.DetallePedido;
import com.example.ms_pedidos.model.DetallePedidoId;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetallePedidoRepository
        extends JpaRepository<DetallePedido, DetallePedidoId> {

    // listar los productos de un pedido
    List<DetallePedido> findByPedido_IdPedido(Integer idPedido);
}
