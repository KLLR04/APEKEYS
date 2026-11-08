package com.example.ms_pedidos.service;

import com.example.ms_pedidos.dto.DetallePedidoResponse;
import com.example.ms_pedidos.dto.PedidoResponse;
import com.example.ms_pedidos.dto.ProductoCatalogoResponse;
import com.example.ms_pedidos.model.Carrito;
import com.example.ms_pedidos.model.DetalleCarrito;
import com.example.ms_pedidos.model.DetallePedido;
import com.example.ms_pedidos.model.Pedido;
import com.example.ms_pedidos.repository.CarritoRepository;
import com.example.ms_pedidos.repository.DetalleCarritoRepository;
import com.example.ms_pedidos.repository.DetallePedidoRepository;
import com.example.ms_pedidos.repository.PedidoRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class PedidoService {

    // estado p pendiente e enviado r recibido
    public static final String ESTADO_PENDIENTE = "P";
    private static final Set<String> ESTADOS_VALIDOS = Set.of("P", "E", "R");

    private static final BigDecimal MONTO_MAXIMO = new BigDecimal("999999");

    private final CarritoRepository carritoRepository;
    private final DetalleCarritoRepository detalleCarritoRepository;
    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final CatalogoClient catalogoClient;

    public PedidoService(
            CarritoRepository carritoRepository,
            DetalleCarritoRepository detalleCarritoRepository,
            PedidoRepository pedidoRepository,
            DetallePedidoRepository detallePedidoRepository,
            CatalogoClient catalogoClient) {

        this.carritoRepository = carritoRepository;
        this.detalleCarritoRepository = detalleCarritoRepository;
        this.pedidoRepository = pedidoRepository;
        this.detallePedidoRepository = detallePedidoRepository;
        this.catalogoClient = catalogoClient;
    }

    // crear pedido a partir del carrito del usuario
    @Transactional
    public PedidoResponse crearPedido(String email) {

        validarEmail(email);

        Carrito carrito = carritoRepository
                .findByUsuarioEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "El usuario no tiene un carrito"
                ));

        List<DetalleCarrito> productosCarrito =
                detalleCarritoRepository.findByCarrito_IdCarrito(carrito.getIdCarrito());

        if (productosCarrito.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No se puede crear un pedido con el carrito vacio"
            );
        }

        BigDecimal total = BigDecimal.ZERO;
        List<DetallePedidoResponse> productosPedido = new ArrayList<>();

        // validar cada producto con el catalogo y calcular subtotales
        for (DetalleCarrito detalle : productosCarrito) {

            Integer productoId = detalle.getProductoId();
            Integer cantidad = detalle.getCantidad();

            if (cantidad == null || cantidad <= 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "El carrito contiene una cantidad invalida"
                );
            }

            ProductoCatalogoResponse producto = catalogoClient.obtenerProducto(productoId);

            if (!"S".equalsIgnoreCase(producto.disponibilidad())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "El producto " + productoId + " no esta disponible"
                );
            }

            if (producto.stock() == null || producto.stock() < cantidad) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Stock insuficiente para el producto " + productoId
                );
            }

            if (producto.precio() == null || producto.precio().signum() < 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "El producto tiene un precio invalido"
                );
            }

            BigDecimal subtotal = producto.precio().multiply(BigDecimal.valueOf(cantidad));

            if (subtotal.compareTo(MONTO_MAXIMO) > 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "El subtotal del producto " + productoId + " supera el monto permitido"
                );
            }

            total = total.add(subtotal);

            productosPedido.add(new DetallePedidoResponse(
                    productoId,
                    cantidad,
                    producto.precio(),
                    subtotal
            ));
        }

        // validar el limite de number seis del mer
        if (total.compareTo(MONTO_MAXIMO) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El total del pedido supera el monto permitido"
            );
        }

        // guardar el pedido
        Pedido pedido = new Pedido();
        pedido.setUsuarioEmail(email);
        pedido.setFechaPedido(LocalDate.now());
        pedido.setEstado(ESTADO_PENDIENTE);
        pedido.setTotalAPagar(total);

        pedido = pedidoRepository.save(pedido);

        // guardar el detalle del pedido
        for (DetallePedidoResponse producto : productosPedido) {

            DetallePedido detallePedido = new DetallePedido();

            detallePedido.setPedido(pedido);
            detallePedido.setProductoId(producto.productoId());
            detallePedido.setCantidad(producto.cantidad());
            detallePedido.setPrecioUnitario(producto.precioUnitario());
            detallePedido.setSubtotal(producto.subtotal());

            detallePedidoRepository.save(detallePedido);
        }

        // descontar stock en ms catalogo producto por producto
        for (DetallePedidoResponse producto : productosPedido) {
            catalogoClient.descontarStock(producto.productoId(), producto.cantidad());
        }

        // vaciar el carrito despues de crear el pedido
        detalleCarritoRepository.deleteAll(productosCarrito);

        return new PedidoResponse(
                pedido.getIdPedido(),
                pedido.getFechaPedido(),
                pedido.getEstado(),
                pedido.getTotalAPagar(),
                pedido.getUsuarioEmail(),
                productosPedido
        );
    }

    // listar los pedidos del usuario autenticado
    @Transactional(readOnly = true)
    public List<PedidoResponse> obtenerMisPedidos(String email) {

        validarEmail(email);

        return pedidoRepository
                .findByUsuarioEmailOrderByIdPedidoDesc(email)
                .stream()
                .map(this::construirRespuestaPedido)
                .toList();
    }

    // obtener un pedido propio por su id
    @Transactional(readOnly = true)
    public PedidoResponse obtenerPedidoPorId(String email, Integer idPedido) {

        validarEmail(email);

        Pedido pedido = buscarPedido(idPedido);

        // evitar que un usuario consulte pedidos ajenos
        if (!email.equalsIgnoreCase(pedido.getUsuarioEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Pedido no encontrado"
            );
        }

        return construirRespuestaPedido(pedido);
    }

    // listar todos los pedidos como administrador
    @Transactional(readOnly = true)
    public List<PedidoResponse> listarTodos() {

        return pedidoRepository
                .findAllByOrderByIdPedidoDesc()
                .stream()
                .map(this::construirRespuestaPedido)
                .toList();
    }

    // cambiar el estado de un pedido como administrador
    @Transactional
    public PedidoResponse actualizarEstado(Integer idPedido, String estado) {

        if (estado == null || estado.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe indicar un estado"
            );
        }

        String estadoNormalizado = estado.trim().toUpperCase(Locale.ROOT);

        if (!ESTADOS_VALIDOS.contains(estadoNormalizado)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El estado debe ser P, E o R"
            );
        }

        Pedido pedido = buscarPedido(idPedido);
        pedido.setEstado(estadoNormalizado);

        return construirRespuestaPedido(pedidoRepository.save(pedido));
    }

    private Pedido buscarPedido(Integer idPedido) {

        if (idPedido == null || idPedido <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El ID del pedido no es valido"
            );
        }

        return pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Pedido no encontrado"
                ));
    }

    private void validarEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Usuario no identificado"
            );
        }
    }

    // armar la respuesta del pedido con su detalle
    private PedidoResponse construirRespuestaPedido(Pedido pedido) {

        List<DetallePedidoResponse> productos =
                detallePedidoRepository
                        .findByPedido_IdPedido(pedido.getIdPedido())
                        .stream()
                        .map(detalle -> new DetallePedidoResponse(
                                detalle.getProductoId(),
                                detalle.getCantidad(),
                                detalle.getPrecioUnitario(),
                                detalle.getSubtotal()
                        ))
                        .toList();

        return new PedidoResponse(
                pedido.getIdPedido(),
                pedido.getFechaPedido(),
                pedido.getEstado(),
                pedido.getTotalAPagar(),
                pedido.getUsuarioEmail(),
                productos
        );
    }
}
