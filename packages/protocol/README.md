# @lasana/protocol

Mensajes versionados del protocolo cliente↔servidor del juego **Lasaña!**. Define el contrato de comunicación entre la web (`apps/web`) y el servidor de salas (`apps/party`), y depende de `@lasana/engine` solo para tipar el `GameState` que viaja en los mensajes.

## Por qué existe

El servidor es la única fuente de verdad: los clientes envían **intenciones** (`ClientMessage`) y el servidor responde con **estado sincronizado** (`ServerMessage`). Este paquete centraliza esos tipos y su parseo/validación para que servidor y cliente nunca se desincronicen.

## Contenido

- **`PROTOCOL_VERSION`** — Versión numérica del protocolo. El cliente la envía al unirse (`join`) para que el servidor pueda rechazar clientes incompatibles.
- **`RoomPlayer` / `RoomSnapshot`** — Estado de la sala (jugadores, host, `"lobby" | "playing"`) que ve el cliente antes/entre partidas.
- **`ServerEvent`** — Evento informativo que acompaña una actualización de estado (`joined`, `play`, `attack`, `turn`, `score`, `error`, etc.), útil para mostrar feedback puntual en la UI.
- **`ClientMessage`** — Unión de todo lo que el cliente puede enviar: `join`, `ready`, `start`, `action` (con las acciones del engine: `playIngredient`, `discardAndDraw`, `playCondiment`, `endTurn`, `drawChef`, `proposeTrade`, `acceptTrade`, `rejectTrade`, `finishTrading`, `finishScoring`) y `leave`.
- **`ServerMessage`** — Unión de todo lo que el servidor puede enviar: `joined`, `room`, `stateSync` (incluye el `GameState` completo y un `ServerEvent` opcional), `rejected`, `error`.
- **`parseClientMessage(value: unknown): ClientMessage | null`** — Valida y normaliza un payload arbitrario (típicamente `JSON.parse` de un mensaje WebSocket) devolviendo un `ClientMessage` tipado o `null` si es inválido. Es la única puerta de entrada segura para mensajes entrantes en el servidor.

## Uso típico

```ts
import { parseClientMessage, PROTOCOL_VERSION } from "@lasana/protocol";
import type { ServerMessage } from "@lasana/protocol";

// Servidor: al recibir un mensaje WebSocket
const message = parseClientMessage(JSON.parse(raw));
if (!message) return; // payload inválido, se ignora

// Cliente: al conectar
socket.send(JSON.stringify({ type: "join", protocolVersion: PROTOCOL_VERSION, name }));
```

## Desarrollo

Este paquete no compila a `dist`: se consume directamente como TypeScript vía `"exports": { ".": "./src/index.ts" }`, igual que el resto del monorepo con `moduleResolution: "Bundler"`.
