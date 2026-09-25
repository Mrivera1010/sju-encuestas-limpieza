# Flujo de Power Automate: captura de respuestas

Objetivo: cada envío de la app llega por HTTP y se agrega como fila a la tabla `Respuestas` del archivo
`Respuestas Encuestas Limpieza SJU.xlsx`, que está en el OneDrive de Mariam: `OneDrive - V2A Consulting / Aerostar - Encuestas SJU /`.
(Si prefieren tenerlo en el sitio de Aerostar, muévanlo a 04-Interviews/Surveys y ajusten el paso 3.)

Requisito: el trigger "When an HTTP request is received" es un conector premium. Si la cuenta no lo tiene,
la alternativa gratuita es una Azure Function (consumo) con la misma lógica; avíseme y la preparo.

## Pasos (Power Automate → Create → Instant cloud flow)

1. **Trigger: When an HTTP request is received**
   - Who can trigger: *Anyone*
   - Method: POST
   - Request Body JSON Schema:
```json
{
  "type": "object",
  "properties": {
    "survey": {"type": "string"}, "surveyName": {"type": "string"}, "location": {"type": "string"},
    "lang": {"type": "string"}, "submittedAt": {"type": "string"}, "app": {"type": "string"},
    "row": {"type": "object", "properties": {
      "Fecha": {"type": "string"}, "Encuesta": {"type": "string"}, "Audiencia": {"type": "string"},
      "Ubicacion": {"type": "string"}, "Idioma": {"type": "string"}, "App": {"type": "string"},
      "Q1": {"type": "string"}, "Q2": {"type": "string"}, "Q3": {"type": "string"}, "Q4": {"type": "string"},
      "Q5": {"type": "string"}, "Q5B": {"type": "string"}, "Q6": {"type": "string"}, "Q7": {"type": "string"}
    }},
    "answers": {"type": "array"}
  }
}
```
   La app envía el cuerpo como `text/plain` para evitar el preflight CORS. Por eso agregue después del trigger:

2. **Compose** (nombre: `Body`) → Inputs: `json(string(triggerBody()))`

3. **Excel Online (Business) → Add a row into a table**
   - Location: *OneDrive for Business* · Document Library: *OneDrive*
   - File: `/Aerostar - Encuestas SJU/Respuestas Encuestas Limpieza SJU.xlsx` · Table: `Respuestas`
   - Cada columna con la expresión `outputs('Body')?['row']?['<Columna>']`, por ejemplo
     Fecha → `outputs('Body')?['row']?['Fecha']`, Q5B → `outputs('Body')?['row']?['Q5B']`.

4. **Response**
   - Status code: 200
   - Headers: `Access-Control-Allow-Origin` = `*`
   - Body: `{"ok":true}`
   (sin esta cabecera el navegador rechaza la respuesta y la app muestra el mensaje de error aunque la fila se haya guardado)

5. Guarde el flujo. Copie la **HTTP POST URL** que aparece en el trigger y péguela en `config.js`:
```js
window.SJU_CONFIG = { endpoint: "https://prod-xx.westus.logic.azure.com:443/workflows/...", appVersion: "1.0" };
```
   Haga commit y push; GitHub Pages publica el cambio en un minuto.

## Prueba
Abra `index.html?s=p&loc=Prueba`, conteste y envíe. Debe aparecer la fila en la tabla y el mensaje "¡Gracias por su opinión!".
Borre después la fila de ejemplo y la de prueba.
