// Configuración de las encuestas de limpieza SJU.
// endpoint: URL que recibe cada respuesta por POST (JSON). Vacío = modo revisión, no se guarda nada.
// Backend actual: Azure Function encuestas-sju (rg-sju-cleanops, suscripción ClaudeDev). Ver azure-function/README.md.
window.SJU_CONFIG = {
  endpoint: "https://encuestas-sju.azurewebsites.net/api/respuestas",
  appVersion: "1.0"
};
