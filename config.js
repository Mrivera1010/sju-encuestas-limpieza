// Configuración de las encuestas de limpieza SJU.
// endpoint: URL que recibe cada respuesta por POST (JSON). Vacío = modo revisión, no se guarda nada.
// Backend actual: Azure Function sju-encuestas-api (rg-sju-cleanops, suscripción ClaudeDev). Ver azure-function/README.md.
window.SJU_CONFIG = {
  endpoint: "https://sju-encuestas-api.azurewebsites.net/api/respuestas",
  appVersion: "1.0"
};
