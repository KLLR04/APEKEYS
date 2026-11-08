package com.example.ms_pedidos.model;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "DETALLE_PEDIDO")
@IdClass(DetallePedidoId.class)
public class DetallePedido {

    @Id
    @Column(name = "PRODUCTO_id_producto", nullable = false)
    private Integer productoId;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PEDIDO_id_pedido", nullable = false)
    private Pedido pedido;

    // nombre del producto al momento de la compra para mostrar el historial aunque el producto se borre
    @Column(name = "nombre_producto", length = 50)
    private String nombreProducto;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "precio_unitario", precision = 6, scale = 0, nullable = false)
    private BigDecimal precioUnitario;

    @Column(name = "subtotal", precision = 6, scale = 0, nullable = false)
    private BigDecimal subtotal;

    public DetallePedido() {
    }

    // gett

    public Integer getProductoId() {
        return productoId;
    }

    public Pedido getPedido() {
        return pedido;
    }

    public String getNombreProducto() {
        return nombreProducto;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public BigDecimal getPrecioUnitario() {
        return precioUnitario;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    // sett

    public void setProductoId(Integer productoId) {
        this.productoId = productoId;
    }

    public void setPedido(Pedido pedido) {
        this.pedido = pedido;
    }

    public void setNombreProducto(String nombreProducto) {
        this.nombreProducto = nombreProducto;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public void setPrecioUnitario(BigDecimal precioUnitario) {
        this.precioUnitario = precioUnitario;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
}
