package com.example.ms_pedidos.model;

import java.io.Serializable;
import java.util.Objects;

public class DetallePedidoId implements Serializable {

    private Integer productoId;
    private Integer pedido;

    public DetallePedidoId() {
    }

    public DetallePedidoId(Integer productoId, Integer pedido) {
        this.productoId = productoId;
        this.pedido = pedido;
    }

    // gett

    public Integer getProductoId() {
        return productoId;
    }

    public Integer getPedido() {
        return pedido;
    }

    // sett

    public void setProductoId(Integer productoId) {
        this.productoId = productoId;
    }

    public void setPedido(Integer pedido) {
        this.pedido = pedido;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }

        if (!(obj instanceof DetallePedidoId otro)) {
            return false;
        }

        return Objects.equals(productoId, otro.productoId)
                && Objects.equals(pedido, otro.pedido);
    }

    @Override
    public int hashCode() {
        return Objects.hash(productoId, pedido);
    }
}
