// Configuración de las encuestas de limpieza SJU.
// endpoint: URL que recibe cada respuesta por POST (JSON). Vacío = modo revisión, no se guarda nada.
// Ejemplo: un flujo de Power Automate "When an HTTP request is received" que escribe en una lista de SharePoint.
window.SJU_CONFIG = {
  endpoint: "",
  appVersion: "1.0"
};
