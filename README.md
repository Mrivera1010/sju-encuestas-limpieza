# Encuestas de Limpieza SJU (static web app)

**Enlace para el cliente: https://encuestas-sju.azurewebsites.net/encuestas** (la Function App sirve el sitio y la API desde el mismo host).
La copia en GitHub Pages (https://mrivera1010.github.io/sju-encuestas-limpieza/) sigue funcionando y usa la misma API.

Aplicación estática (HTML/CSS/JS, sin backend propio) con las cuatro encuestas de percepción de limpieza para SJU:
P1/P2 pasajeros, B1 socios comerciales, E1 personal del aeropuerto, E2 personal de limpieza. Español / inglés.

## Archivos
- `index.html`  la app completa (encuestas, logo y letrero QR embebidos).
- `config.js`   único archivo que se edita para activar la captura de respuestas.
- `staticwebapp.config.json`  configuración para Azure Static Web Apps (opcional; Netlify o GitHub Pages no lo necesitan).

## Enlaces
- `index.html`                         página de revisión con las cuatro encuestas.
- `index.html?s=p&loc=Concourse B · Baños`  encuesta de pasajeros; `loc` se guarda con cada respuesta (uno por QR).
- `index.html?s=b`, `?s=e1`, `?s=e2`     socios, personal del aeropuerto, personal de limpieza.
- Agregue `&lang=en` para abrir en inglés.

## Captura de respuestas
Dos opciones de backend (elija una):
- **Power Automate** (`FLOW.md`): flujo HTTP → fila en Excel de OneDrive. Requiere el conector premium HTTP.
- **Azure Function** (`azure-function/README.md`): función que guarda en Azure Table Storage y exporta CSV. Solo requiere una suscripción de Azure.

Con `endpoint` vacío la app está en modo revisión: muestra "gracias" pero no guarda nada.
Para capturar, ponga en `config.js` la URL de un endpoint que acepte `POST` JSON con CORS abierto, por ejemplo
un flujo de Power Automate "When an HTTP request is received" que agregue una fila a una lista de SharePoint o a Excel.

Cada envío tiene esta forma:
```json
{
  "survey": "p", "surveyName": "Pasajeros", "location": "Concourse B · Baños", "lang": "es",
  "submittedAt": "2026-09-25T18:00:00.000Z", "app": "1.0",
  "answers": [
    {"id": "q1", "type": "rating", "question": "Califique la limpieza general de esta área", "value": 4, "label": 4},
    {"id": "q3", "type": "single", "question": "¿Qué es lo más importante...", "value": 0, "label": "Baños limpios"}
  ]
}
```
`value` es el índice (opciones) o el número (escala 1-5, o "na"); `label` es el texto en español.

## Publicar
Suba la carpeta tal cual a Azure Static Web Apps, Netlify, GitHub Pages o cualquier hosting estático.
SharePoint no sirve para esto porque no ejecuta archivos HTML.

## Enlaces amigables (para QR y correos)
`404.html` traduce rutas cortas a la encuesta correcta:
- `/pasajeros/b-banos` → Pasajeros, ubicación "Concourse B · Baños" · `/pasajeros/curbside` → "Curbside"
  Zonas: `a`, `b`, `c`, `d`, `terminal`, `publica`, `esteril` · Áreas: `banos`, `puertas`, `food-court`, `counters`, `equipaje`, `curbside`, `estacionamiento`, `pasillos`, `salas`
  Cualquier otro slug se convierte en texto (`/pasajeros/torre-norte` → "Torre Norte").
- `/encuestas` → página inicial con las cuatro encuestas (para enviar al roster)
- `/socios` · `/personal` · `/limpieza` → socios comerciales, personal del aeropuerto, personal de limpieza
- Agregue `/en` al final para abrir en inglés: `/socios/en`, `/pasajeros/b-banos/en`

Dominio propio: agregue un CNAME `encuestas.v2aconsulting.com → mrivera1010.github.io` en el DNS de V2A y
configure ese dominio en GitHub → Settings → Pages → Custom domain. Los enlaces quedan como
`https://encuestas.v2aconsulting.com/pasajeros/b-banos`.
