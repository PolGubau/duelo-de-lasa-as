# Duelo de Lasañas

Juego de cartas multijugador online por salas.

## Desarrollo online local

Instala las dependencias y arranca a la vez el servidor de salas (`party`, puerto 8787) y la web:

```bash
pnpm install
pnpm dev
```

Si "No se pudo conectar con el servidor de salas" aparece en la web, es que el servidor `party` no está corriendo: comprueba en la terminal que ambos procesos (`party#dev` y `web#dev`) se hayan iniciado sin errores.

Para arrancar solo uno de los dos, o apuntar la web a un servidor de salas ya desplegado:

```bash
pnpm --filter party dev -- --port 8787
```

En otra terminal:

```bash
set VITE_PARTY_URL=ws://localhost:8787
vp run web#dev
```

En PowerShell usa `$env:VITE_PARTY_URL="ws://localhost:8787"`.

La web crea una sala con un código de cuatro caracteres o se une a una existente. El servidor es la autoridad: el navegador solo envía intenciones y recibe estados sincronizados; las manos ajenas y el mazo permanecen ocultos.

## Despliegue del servidor

El servidor de salas vive en `apps/party` como Durable Object de Cloudflare. Para desplegarlo hace falta iniciar sesión en una cuenta Cloudflare:

```bash
pnpm install
pnpm --filter party exec wrangler login
pnpm --filter party run deploy
```

Después configura la URL WebSocket desplegada para la web:

```bash
VITE_PARTY_URL=wss://tu-worker.tu-subdominio.workers.dev vp run web#build
```
