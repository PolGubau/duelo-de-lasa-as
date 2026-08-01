# GAME BRANDING, DESIGN SYSTEM & VOICE GUIDE: "DUELO DE LASAÑAS"

Este documento define la identidad visual, la voz del producto, los tokens de diseño (configurados para Tailwind CSS v4) y la lista de assets necesarios para el desarrollo de la interfaz de "Duelo de Lasañas". Ninguna decisión estética o de copy debe tomarse fuera de los márgenes aquí estipulados.

---

## 1. IDENTIDAD Y TONO DE VOZ (GAME VOICE)

- **Nombre Oficial**: `Duelo de Lasañas`.
- **Tagline**: _"Construye la capa perfecta. Arruina la de tus amigos."_
- **Personalidad del Juego**: Divertido, competitivo, caótico, gastronómico y vibrante. Inspirado en el ritmo frenético de _Balatro_, el caos de _Overcooked_ y la picaresca de _Virus!_.
- **Tono del Copy (Textos en la App)**:
  - **Cercano y gamberro**: _"¡Te han echado azúcar en la boloñesa!"_, _"Menu de la casa"_, _"Marchando una de puntos"_.
  - **Mensajes de Interfaz Directos**: Evitar términos aburridos de software.
    - _En lugar de "Cargando juego..."_ $\rightarrow$ _"Precalentando el horno..."_
    - _En lugar de "Buscando partida..."_ $\rightarrow$ _"Buscando comensales..."_
    - _En lugar de "Error de conexión"_ $\rightarrow$ _"Se ha quemado la cocina (Reconectando)"_

---

## 2. DESIGN TOKENS (TAILWIND CSS v4)

Utilizaremos el nuevo sistema de tokens `@theme` directo de **Tailwind CSS v4**. La estética debe ser saturada, con alto contraste y sombras con relieve de carta física.

```css
/* src/styles/theme.css */
@import "tailwindcss";

@theme {
  /* Paleta Gastronómica Saturada */
  --color-brand-tomato: #E63946;    /* Rojo Tomate: Botones primarios, Rellenos, Peligro */
  --color-brand-sauce: #F4A261;     /* Naranja Salsa: Acentos, Notificaciones */
  --color-brand-cheese: #FFB703;    /* Amarillo Queso: Puntuación, Multiplicadores, Wins */
  --color-brand-bechamel: #F8F9FA;  /* Blanco Bechamel: Cartas, Textos destacados */
  --color-brand-basil: #2A9D8F;     /* Verde Albahaca: Confirmaciones, Éxito, Ready */
  --color-brand-table: #1D3557;     /* Azul Tapete: Fondo principal del juego */
  --color-brand-crust: #4A2810;     /* Marrón Tostado: Bordes de cartas, Sombras oscuras */

  /* Tipografías con personalidad */
  --font-display: 'Fredoka', 'Lilita One', cursive, sans-serif; /* Títulos, Números pop, Botones */
  --font-body: 'Plus Jakarta Sans', system-ui, sans-serif;      /* Textos descriptivos, UI secundaria */

  /* Sombras Físicas / Neumorfismo Pop (Efecto Balatro) */
  --shadow-card: 0 8px 0 var(--color-brand-crust), 0 15px 20px rgba(0, 0, 0, 0.3);
  --shadow-card-hover: 0 12px 0 var(--color-brand-crust), 0 20px 25px rgba(0, 0, 0, 0.4);
  --shadow-button: 0 6px 0 var(--color-brand-crust);
  --shadow-button-active: 0 2px 0 var(--color-brand-crust);

  /* Animaciones Pop */
  --ease-pop: cubic-bezier(0.175, 0.885, 0.32, 1.275);
}


3. UI COMPONENTS & ESTILOS VISUALES
A. Cartas (<Card />)

    Bordes: Esquinas muy redondeadas (rounded-2xl), borde sólido de 3px (border-3 border-brand-crust).

    Micro-interacciones:

        Al hacer hover o arrastrar, la carta escala scale-105, rota levemente (rotate-2 o -rotate-2) y eleva su sombra (shadow-card-hover).

        Las cartas inactivas en la mano (que no corresponden a la fase actual) se oscurecen (brightness-50 grayscale-25) y bajan su posición vertical.

        Las cartas válidas para la fase emiten un pulso brillante (animate-pulse ring-4 ring-brand-cheese).

B. Números y Puntuaciones ("Juice")

    Todos los números de puntos usan --font-display con un leve borde de texto (text stroke de 2px en negro/crust).

    Cuando una carta añade puntos: el número "salta" desde la carta hacia el contador global con un efecto de partícula.

    Cuando entra un Multiplicador: la pantalla tiembla levemente (shake), el multiplicador parpadea en --color-brand-cheese y emite un sonido con tono ascendente.

C. Botones e Interfaz

    Estilo chunky/arcade con sombra inferior sólida (shadow-button). Al pulsar (:active), el botón se desplaza hacia abajo 4px reduciendo su sombra (shadow-button-active) para dar una sensación física táctil real en el móvil.

4. SISTEMA DE ICONOS Y ASSETS LIST

Para evitar incoherencias visuales, todos los iconos del sistema de interfaz (UI) usarán la librería Lucide Icons (lucide-react / lucide-vue).
A. Iconos de UI (Lucide)

    Volume2 / VolumeX: Control de audio.

    Play: Jugar.

    Users: Sala / Lobbys.

    BookOpen: Tutorial.

    Trophy: Podio / Ganador.

    Flame: Fase activa / En racha.

    HelpCircle: Ayuda / Info de carta.

    Download: Banner de instalación PWA.

## 5. LOGOTIPO

Las variantes raster del logotipo viven en `apps/web/public/assets/ui/`:

- `logo_lasana_game.png`: logotipo principal horizontal para la portada.
- `logo_lasana_game_compact.png`: composición apilada para cabeceras y pantallas estrechas.
- `logo_lasana_game_light.png`: variante de alto contraste para fondos oscuros o superposiciones.
- `logo_duelo_lasanas_splash.png`: variante grande con el nombre completo para la splash screen.
- `icon_duelo_lasanas.png`: icono cuadrado de la lasaña en capas para favicon y aplicaciones instaladas.

Las variantes reducidas comparten el lenguaje material de la splash: pasta horneada, bechamel cremosa, capas de tomate y bordes tostados. Los fondos y superficies de la interfaz deben sugerir esas capas con bandas horizontales suaves, sin convertir la pantalla en una textura ruidosa.
```
