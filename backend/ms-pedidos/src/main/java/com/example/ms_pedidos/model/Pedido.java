package com.example.ms_pedidos.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "PEDIDO")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido")
    private Integer idPedido;

    @Column(name = "fecha_pedido", nullable = false)
    private LocalDate fechaPedido;

    @Column(name = "estado", length = 1, nullable = false)
    private String estado;

    @Column(name = "total_a_pagar", precision = 6, scale = 0, nullable = false)
    private BigDecimal totalAPagar;

    @Column(name = "USUARIO_email", length = 100, nullable = false)
    private String usuarioEmail;

    public Pedido() {
    }

    // gett

    public Integer getIdPedido() {
        return idPedido;
    }

    public LocalDate getFechaPedido() {
        return fechaPedido;
    }

    public String getEstado() {
        return estado;
    }

    public BigDecimal getTotalAPagar() {
        return totalAPagar;
    }

    public String getUsuarioEmail() {
        return usuarioEmail;
    }

    // sett

    public void setIdPedido(Integer idPedido) {
        this.idPedido = idPedido;
    }

    public void setFechaPedido(LocalDate fechaPedido) {
        this.fechaPedido = fechaPedido;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public void setTotalAPagar(BigDecimal totalAPagar) {
        this.totalAPagar = totalAPagar;
    }

    public void setUsuarioEmail(String usuarioEmail) {
        this.usuarioEmail = usuarioEmail;
    }
}
