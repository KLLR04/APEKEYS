package com.example.ms_catalogo.config;

import com.example.ms_catalogo.model.Categoria;
import com.example.ms_catalogo.model.Producto;
import com.example.ms_catalogo.repository.CategoriaRepository;
import com.example.ms_catalogo.repository.ProductoRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final String STEAM = "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/";

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;

    public DataInitializer(
            CategoriaRepository categoriaRepository,
            ProductoRepository productoRepository) {

        this.categoriaRepository = categoriaRepository;
        this.productoRepository = productoRepository;
    }

    // cargar el catalogo de ejemplo del frontend solo si la base esta vacia
    @Override
    public void run(String... args) {

        if (productoRepository.count() > 0 || categoriaRepository.count() > 0) {
            return;
        }

        Map<String, Categoria> categorias = new HashMap<>();
        categorias.put("Mundo Abierto", categoria("Mundo Abierto", "Mundos grandes para explorar libremente"));
        categorias.put("Acción", categoria("Acción", "Combate y reflejos"));
        categorias.put("Plataformas", categoria("Plataformas", "Saltos, precision y exploracion"));
        categorias.put("Terror", categoria("Terror", "Supervivencia y suspenso"));
        categorias.put("Software", categoria("Software", "Programas y licencias"));

        producto("GAM-001", "Red Dead Redemption 2", categorias.get("Mundo Abierto"), 29990, 19990, 45,
                "Aventura de acción ambientada en el lejano oeste.", STEAM + "1174180/header.jpg");
        producto("GAM-002", "Metal Gear Solid Delta", categorias.get("Acción"), 49990, null, 12,
                "Juego de acción y sigilo de la saga Metal Gear.", STEAM + "2417610/header.jpg");
        producto("GAM-003", "Helldivers 2", categorias.get("Acción"), 39990, 29990, 20,
                "Juego cooperativo de acción para hasta cuatro jugadores.", STEAM + "553850/header.jpg");
        producto("GAM-004", "Hollow Knight", categorias.get("Plataformas"), 9990, null, 30,
                "Aventura de acción en un reino subterráneo.", STEAM + "367520/header.jpg");
        producto("GAM-005", "Resident Evil 4 Remake", categorias.get("Terror"), 39990, null, 8,
                "Juego de acción y supervivencia contra criaturas infectadas.", STEAM + "2050650/header.jpg");
    }

    private Categoria categoria(String nombre, String descripcion) {

        Categoria categoria = new Categoria();
        categoria.setNombre(nombre);
        categoria.setDescripcion(descripcion);

        return categoriaRepository.save(categoria);
    }

    private void producto(String codigo, String nombre, Categoria categoria, int precio,
                          Integer precioOferta, int stock, String descripcion, String imagen) {

        Producto producto = new Producto();
        producto.setCodigo(codigo);
        producto.setNombre(nombre);
        producto.setCategoria(categoria);
        producto.setPlataforma("Steam");
        producto.setPrecio(BigDecimal.valueOf(precio));
        producto.setPrecioOferta(precioOferta == null ? null : BigDecimal.valueOf(precioOferta));
        producto.setStock(stock);
        producto.setStockCritico(5);
        producto.setDescripcion(descripcion);
        producto.setImagen(imagen);
        producto.setDisponibilidad("S");

        productoRepository.save(producto);
    }
}
