package com.example.ms_catalogo.model;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "PRODUCTO")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto")
    private Integer idProducto;

    // codigo visible para el negocio por ejemplo GAM-001
    @Column(name = "codigo", length = 20, nullable = false, unique = true)
    private String codigo;

    @Column(name = "nombre", length = 50, nullable = false)
    private String nombre;

    @Column(name = "descripcion", length = 100, nullable = false)
    private String descripcion;

    // plataforma donde se activa la llave por ejemplo Steam
    @Column(name = "plataforma", length = 30, nullable = false)
    private String plataforma;

    // url de la portada del juego
    @Column(name = "imagen", length = 500)
    private String imagen;

    @Column(name = "precio", precision = 6, scale = 0, nullable = false)
    private BigDecimal precio;

    // precio rebajado opcional si existe y es menor al precio el producto esta en oferta
    @Column(name = "precio_oferta", precision = 6, scale = 0)
    private BigDecimal precioOferta;

    @Column(name = "stock", nullable = false)
    private Integer stock;

    // bajo este stock el panel de administracion muestra una alerta
    @Column(name = "stock_critico", nullable = false)
    private Integer stockCritico;

    @Column(name = "disponibilidad", length = 1, nullable = false)
    private String disponibilidad;

    @ManyToOne
    @JoinColumn(name = "CATEGORIA_id_categoria", nullable = false)
    private Categoria categoria;

    public Producto() {
    }

    // precio que realmente se cobra
    public BigDecimal getPrecioFinal() {
        if (precioOferta != null
                && precioOferta.signum() > 0
                && precio != null
                && precioOferta.compareTo(precio) < 0) {
            return precioOferta;
        }
        return precio;
    }

    // gett

    public Integer getIdProducto() {
        return idProducto;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getNombre() {
        return nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public String getPlataforma() {
        return plataforma;
    }

    public String getImagen() {
        return imagen;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public BigDecimal getPrecioOferta() {
        return precioOferta;
    }

    public Integer getStock() {
        return stock;
    }

    public Integer getStockCritico() {
        return stockCritico;
    }

    public String getDisponibilidad() {
        return disponibilidad;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    // sett

    public void setIdProducto(Integer idProducto) {
        this.idProducto = idProducto;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public void setPlataforma(String plataforma) {
        this.plataforma = plataforma;
    }

    public void setImagen(String imagen) {
        this.imagen = imagen;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public void setPrecioOferta(BigDecimal precioOferta) {
        this.precioOferta = precioOferta;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public void setStockCritico(Integer stockCritico) {
        this.stockCritico = stockCritico;
    }

    public void setDisponibilidad(String disponibilidad) {
        this.disponibilidad = disponibilidad;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }
}
