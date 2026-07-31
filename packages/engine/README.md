# @lasana/engine

Lógica pura del juego **Lasaña!**: reglas, PRNG determinista, validación de acciones y puntuación. Cero dependencias de UI, red o plataforma — se puede usar igual desde el servidor (`apps/party`), la web (`apps/web`) o una futura app nativa.

## Principio

El engine no conoce sockets ni React. Recibe un `GameState` y una intención, y devuelve un nuevo `GameState` (inmutable) junto con un resultado de éxito/fallo. Quien lo use decide qué hacer con el resultado (difundirlo, renderizarlo, etc.).

## Módulos

- **`types.ts`** — Tipos del dominio: `Card` (`IngredientCard` | `CondimentCard` | `ChefCard`), `PlayerState`, `GameState`, `GameConfig`, `ActionResult`, `PlayerScore`, etc.
- **`cards.ts`** — Catálogo declarativo de cartas (`INGREDIENTS`, `CONDIMENTS`, `CHEFS`) y helpers de acceso (`getCard`, `getIngredient`, `getCondiment`, `getChef`, `buildMainDeck`, `buildChefDeck`).
- **`prng.ts`** — PRNG determinista (`mulberry32`) y utilidades derivadas (`seedFromString`, `randomInt`, `shuffle`). **Prohibido usar `Math.random()`** en el resto del engine: todo debe ser reproducible a partir de una semilla.
- **`game.ts`** — Máquina de estados de la partida: `createGame`, y las transiciones `playIngredient`, `discardAndDraw`, `playCondiment`, `endTurn`, `drawChef`, `proposeTrade`, `acceptTrade`, `rejectTrade`, `finishTrading`, `finishScoring`. Cada transición valida la acción y devuelve `ActionResult` (`{ ok: true, state }` o `{ ok: false, state, reason }`).
- **`scoring.ts`** — Cálculo de puntuación (`scorePlayer`, `scoreGame`, `winnerOf`), aplicando las capas de la lasaña de abajo hacia arriba y el efecto del chef al final.

## Flujo de una partida

1. `createGame(players, { seed, config })` reparte mano inicial y baraja el mazo con una semilla.
2. Fase **playing**: los jugadores turnan por fases (`relleno` → `bechamel` → `pasta`, ver `PHASE_ORDER`) jugando ingredientes, condimentos o descartando.
3. Al agotar las rondas, se pasa a **chefDraw** (`drawChef`) y luego **trading** (propuestas de trueque de chef).
4. **scoring** calcula puntuaciones (`finishScoring`) y la partida termina en **finished** con un `winnerId`.

## Desarrollo

- Instalar dependencias: `vp install`
- Tests unitarios: `vp test`
- Comprobar tipos/lint/formato: `vp check`
- Compilar la librería: `vp pack`
