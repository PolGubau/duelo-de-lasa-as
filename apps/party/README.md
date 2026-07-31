# party

Servidor de salas del juego **Lasaña!**: un [Cloudflare Worker](https://developers.cloudflare.com/workers/) con un [Durable Object](https://developers.cloudflare.com/durable-objects/) por sala. Es la única autoridad de la partida — los clientes (`apps/web`, y en el futuro una app nativa) solo envían intenciones por WebSocket y reciben de vuelta el estado sincronizado.

## Por qué existe

`@lasana/engine` es lógica pura sin red; alguien tiene que aplicar sus transiciones a partir de mensajes reales de jugadores, guardarlas y repartirlas a todos los conectados sin filtrar información que no deberían ver (mano ajena, mazo, capas rivales en salas secretas). Ese "alguien" es `LasanaRoom`, definido en `src/index.ts`.

## Cómo se conecta un cliente

```
GET /room/ABCD   (código de 4 caracteres [A-Z0-9], con Upgrade: websocket)
```

El `fetch` handler del Worker valida el formato del código y delega en el Durable Object correspondiente (`env.LASANA_ROOMS.idFromName(code)`), que acepta el WebSocket y gestiona la sesión.

## `LasanaRoom` (Durable Object)

Estado en memoria, respaldado en `ctx.storage` (SQLite del propio DO) tras cada cambio:

- `code`, `players` (`Map<string, RoomPlayer>`), `state` (`GameState | null` de `@lasana/engine`), `options` (`RoomOptions`, p. ej. `visibility: "public" | "secret"`).
- `ensureLoaded()` / `persist()` cargan y guardan ese estado, para sobrevivir hibernación/reinicios del DO.

Mensajes de cliente (tipados y validados con `parseClientMessage` de `@lasana/protocol`):

| Mensaje             | Efecto                                                                                                                                                                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `join`              | Entra o reconecta (`sessionId`) a la sala. Rechaza versión de protocolo incompatible, sala llena o partida ya empezada.                                                                                                       |
| `ready` / `options` | Marca disponibilidad o cambia las reglas (solo el anfitrión, solo en el lobby).                                                                                                                                               |
| `chat`              | Emoji rápido del lobby, se difunde a todos.                                                                                                                                                                                   |
| `start`             | El anfitrión arranca `createGame(...)` con una semilla determinista (`seed: code`).                                                                                                                                           |
| `action`            | Reenvía la intención a la transición correspondiente del engine (`playIngredient`, `discardAndDraw`, `playCondiment`, `endTurn`, `drawChef`, `proposeTrade`, `acceptTrade`, `rejectTrade`, `finishTrading`, `finishScoring`). |
| `leave`             | Marca al jugador como desconectado (no lo elimina, para permitir reconexión).                                                                                                                                                 |

Cada acción válida actualiza `this.state`, persiste y difunde un `stateSync` con un `ServerEvent` descriptivo (`eventFor`). Las acciones inválidas responden solo al emisor con `{ type: "rejected", reason }`.

## Vista por jugador (`redact`)

Antes de enviar el `GameState` a cada sesión, `redact()` oculta:

- El mazo, la pila de descarte y el mazo de chefs (`deck`, `discard`, `chefDeck` → `[]`).
- Las manos ajenas (sustituidas por ids `hidden_${index}`).
- En salas con `visibility: "secret"`, las capas de lasaña rivales durante `playing`/`chefDraw`/`trading` (sustituidas por `HIDDEN_LAYER`); se revelan al llegar a `scoring`/`finished`.

Así, ningún cliente puede inferir cartas ajenas inspeccionando el estado recibido.

## Desarrollo

```bash
pnpm install
pnpm --filter party dev -- --port 8787
```

Esto expone el servidor en `ws://localhost:8787`; la web lo consume vía `VITE_PARTY_URL` (ver el README raíz).

## Despliegue

```bash
pnpm --filter party exec wrangler login
pnpm --filter party run deploy
```

La configuración vive en `wrangler.toml`: nombre del Worker, el binding del Durable Object `LASANA_ROOMS` (clase `LasanaRoom`) y la migración `new_sqlite_classes` que habilita almacenamiento SQLite por instancia.
