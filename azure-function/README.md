# Backend alternativo: Azure Function (sin Power Automate)

Una Azure Function recibe cada respuesta de la app y la guarda en **Azure Table Storage** (la cuenta de
almacenamiento que toda Function App ya trae, sin licencias ni permisos adicionales). Un segundo endpoint
exporta todo a CSV para abrirlo o refrescarlo desde Excel.

Endpoints:
- `POST https://<app>.azurewebsites.net/api/respuestas`  ← se pega en `config.js` como `endpoint`
- `GET  https://<app>.azurewebsites.net/api/export?code=<clave>`  ← CSV con todas las respuestas (`&survey=p` filtra por encuesta)

Costo: plan Consumo, prácticamente $0 para este volumen (miles de respuestas).

## Estado actual (25 sep 2026)
Desplegada en la suscripción **ClaudeDev** (V2A Consulting), resource group `rg-sju-cleanops`, Function App `sju-encuestas-api`,
storage `stsjuencuestas5570` (tabla `Respuestas`). Código publicado con run-from-package desde el blob `deployments/sju-function.zip`.
La clave de exportación está en Azure Portal → Function App → Functions → export → Function Keys (no se guarda en este repo).

## Despliegue desde cero (portal de Azure, ~10 minutos, sin instalar nada)

1. **Crear la Function App**: portal.azure.com → Create a resource → Function App → *Consumption*.
   - Name: `sju-encuestas-api` (si está tomado, use otro y cámbielo en `.github/workflows/azure-function.yml`)
   - Runtime stack: **Node.js**, versión **22** · OS: Linux · Region: East US (o la más cercana)
   - Storage: deje que cree una cuenta nueva. Create.
2. **Publish profile**: en la Function App → Overview → *Get publish profile* (descarga un archivo `.PublishSettings`). Abra el archivo y copie todo su contenido.
3. **Secreto en GitHub**: repo `Mrivera1010/sju-encuestas-limpieza` → Settings → Secrets and variables → Actions → New repository secret.
   - Name: `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` · Value: el contenido copiado.
4. **Desplegar**: repo → Actions → *Deploy Azure Function* → Run workflow. En ~2 minutos la función queda publicada.
   (A partir de ahí, cualquier cambio en `azure-function/` se despliega solo.)
5. **Clave de exportación**: Function App → Functions → `export` → Function Keys → copie `default`.
   La URL de exportación es `https://sju-encuestas-api.azurewebsites.net/api/export?code=<clave>`.
6. Avísele a Claude (o edite `config.js`): `endpoint: "https://sju-encuestas-api.azurewebsites.net/api/respuestas"`.

## Prueba
```
curl -X POST https://sju-encuestas-api.azurewebsites.net/api/respuestas -H "Content-Type: text/plain" \
  -d '{"survey":"p","row":{"Fecha":"2026-09-25T18:00:00Z","Encuesta":"P1 / P2","Audiencia":"Pasajeros","Ubicacion":"Prueba","Idioma":"es","App":"1.0","Q1":"5","Q2":"4","Q3":"Baños limpios"},"answers":[]}'
```
Debe responder `{"ok":true}` y la fila aparece en el CSV de exportación.

## Ver los datos en Excel
Excel → Data → From Web → pegue la URL de exportación (con la clave). Data → Refresh All trae las respuestas nuevas.
Alternativa: Azure Portal → Storage account → Storage browser → Tables → `Respuestas`.

## Notas
- CORS se maneja en el código (`ALLOWED_ORIGIN`, por defecto `*`). Para restringirlo, en la Function App → Settings →
  Environment variables agregue `ALLOWED_ORIGIN = https://mrivera1010.github.io`.
- Cada respuesta guarda las 14 columnas de la tabla más el JSON completo de `answers`.
