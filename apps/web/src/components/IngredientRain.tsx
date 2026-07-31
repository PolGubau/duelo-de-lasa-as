import { useMemo, type CSSProperties } from "react";

const ICONS = [
  "/assets/cards/ingredients/card_fill_tomato_sauce.png",
  "/assets/cards/condiments/card_cond_basil.png",
  "/assets/cards/ingredients/card_pasta_fresh.png",
  "/assets/cards/ingredients/card_bechamel_smooth.png",
  "/assets/cards/condiments/card_cond_oregano.png",
  "/assets/cards/ingredients/card_fill_zucchini.png",
  "/assets/cards/condiments/card_cond_cinnamon.png",
  "/assets/cards/ingredients/card_fill_tuna.png",
];

const ITEM_COUNT = 14;

interface RainItem {
  icon: string;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  rotate: number;
}

/** Estilo CSS con las variables personalizadas que usa la animación de caída. */
function itemStyle(item: RainItem): CSSProperties {
  return {
    left: `${item.left}%`,
    width: item.size,
    height: item.size,
    "--duration": `${item.duration}s`,
    "--delay": `${item.delay}s`,
    "--drift": `${item.drift}px`,
    "--rotate": `${item.rotate}deg`,
  } as CSSProperties;
}

/**
 * Lluvia sutil de "pegatinas" de ingredientes cayendo lentamente por detrás
 * del contenido del menú, sobre un fondo liso. Los retrasos negativos hacen
 * que, al cargar, ya estén repartidos por toda la caída en vez de empezar
 * todos arriba a la vez.
 */
export function IngredientRain() {
  const items = useMemo<RainItem[]>(
    () =>
      Array.from({ length: ITEM_COUNT }, (_, index) => {
        const duration = 11 + Math.random() * 7;
        return {
          icon: ICONS[index % ICONS.length]!,
          left: Math.random() * 100,
          size: 26 + Math.random() * 18,
          duration,
          delay: -Math.random() * duration,
          drift: Math.random() * 50 - 25,
          rotate: Math.random() * 50 - 25,
        };
      }),
    [],
  );

  return (
    <div className="ingredient-rain" aria-hidden="true">
      {items.map((item, index) => (
        <img
          key={index}
          src={item.icon}
          alt=""
          className="ingredient-rain-item"
          style={itemStyle(item)}
        />
      ))}
    </div>
  );
}
