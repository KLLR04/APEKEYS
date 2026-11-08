import { Link } from 'react-router'
import Carrusel from '../components/Carrusel'
import type { Diapositiva } from '../components/Carrusel'
import TarjetaProducto from '../components/TarjetaProducto'
import { Cargando, ErrorApiMensaje } from '../components/MensajeEstado'
import { useCarga } from '../hooks/useCarga'
import { useTitulo } from '../hooks/useTitulo'
import { listarProductos } from '../services/productos'
import video from '../video/instrucciones-compra.mp4'
import portada from '../img/video-portada.jpg'

const STEAM = 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps'

const DIAPOSITIVAS: Diapositiva[] = [
  {
    imagen: `${STEAM}/2417610/library_hero.jpg`,
    alt: 'Escena de Metal Gear Solid Delta',
    titulo: 'Metal Gear Solid Delta',
    texto: (
      <>
        Acción y sigilo. <Link to="/ficha/2">Ver juego →</Link>
      </>
    ),
  },
  {
    imagen: `${STEAM}/1174180/library_hero.jpg`,
    alt: 'Escena de Red Dead Redemption 2',
    titulo: 'Red Dead Redemption 2',
    texto: (
      <>
        Una aventura en el lejano oeste. <Link to="/ficha/1">Ver juego →</Link>
      </>
    ),
  },
  {
    imagen: `${STEAM}/553850/library_hero.jpg`,
    alt: 'Escena de Helldivers 2',
    titulo: 'Helldivers 2',
    texto: (
      <>
        La misión se juega en equipo. <Link to="/ficha/3">Ver juego →</Link>
      </>
    ),
  },
]

export default function Inicio() {
  useTitulo('APEKEYS')
  const { datos, cargando, error } = useCarga(listarProductos)

  // Destacados: los primeros 8 productos activos por orden alfabético.
  const destacados = (datos ?? [])
    .filter((p) => p.activo)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    .slice(0, 8)

  return (
    <div className="home-layout">
      <Link className="side-banner" to="/proximamente/gta6">
        <strong>
          Grand Theft
          <br />
          Auto VI
        </strong>
        <img
          src="https://media-rockstargames-com.akamaized.net/mfe6/prod/__common/img/f7eab33a4989ce5f0cd89c70723909b3.jpg"
          alt="Grand Theft Auto VI"
          width="600"
          height="900"
        />
        <span>Próximamente</span>
      </Link>

      <div className="home-content">
        <div className="contenedor">
          <Carrusel diapositivas={DIAPOSITIVAS} />

          <section className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="h4 text-white mb-0">Juegos destacados</h2>
              <Link className="btn btn-outline-success btn-sm" to="/catalogo">
                Ver productos
              </Link>
            </div>
            {cargando && <Cargando />}
            {error && <ErrorApiMensaje mensaje={error} />}
            {datos && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {destacados.length === 0 ? (
                  <div className="col-span-full -mx-2 alert alert-light">
                    No encontramos productos con esos filtros.
                  </div>
                ) : (
                  destacados.map((p) => <TarjetaProducto key={p.id} producto={p} />)
                )}
              </div>
            )}
          </section>
        </div>

        <section className="contenedor mt-6 text-white">
          <h2 className="h4">Cómo comprar</h2>
          <p>Video de demostración del proceso de compra.</p>
          <video className="w-full" style={{ maxWidth: 720 }} controls preload="metadata" poster={portada}>
            <source src={video} type="video/mp4" />
          </video>
          <p className="small">
            La compra se simula en el navegador. No se cobran pagos ni se envían claves.
          </p>
        </section>
      </div>

      <Link className="side-banner" to="/proximamente/fc27">
        <strong>
          EA SPORTS
          <br />
          FC 27
        </strong>
        <img
          src="https://drop-assets.ea.com/images/15VqAXZo2fThrwnnfx5cX7/5e8f03989e7dd09e7a150cb0ce784bec/fc-27-ultimate-plus-key-art-16x9.jpg?im=AspectCrop=(9,16),xPosition=0.72,yPosition=0.5;Resize=(720)&q=90"
          alt="EA Sports FC 27"
          width="600"
          height="900"
        />
        <span>Próximamente</span>
      </Link>
    </div>
  )
}
