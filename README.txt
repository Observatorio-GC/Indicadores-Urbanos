# Visor de indicadores urbanos

Visor de zonificación parcelaria del Observatorio Territorial de Godoy Cruz.
Abrir index.html directamente en el navegador o publicar la carpeta completa
en un servidor web. No requiere instalar dependencias ni compilar el proyecto.

El panel "Zonificación" permite activar y desactivar cada zona. Las capas
comienzan desactivadas, como en la exportación original de qgis2web; al hacer
clic en una parcela se muestran sus atributos disponibles. El panel comienza
abierto en escritorio y cerrado en dispositivos móviles y tabletas (hasta
1024 px); en estos últimos se abre con el botón "Zonificación".
El detalle de cada parcela muestra los campos disponibles de sus datos;
los valores vacíos no se muestran.

El buscador superior consulta padrón y nomenclatura, incluyendo zonas que no
estén activadas. Es posible ingresar una coincidencia parcial de al menos tres
dígitos o el número completo; seleccionar un resultado acerca y resalta la
parcela. La lista muestra hasta 20 resultados y prioriza coincidencias exactas.
El selector junto al buscador permite buscar en todas las zonas o limitar la
búsqueda a una zona, independientemente de las capas visibles en el mapa.
El botón "Quitar parcela buscada" retira el resaltado sin modificar los datos
ni las zonas activas. La superficie de las parcelas se presenta en m².

Debajo del zoom se pueden cambiar los mapas base y medir líneas o áreas.
Las mediciones pueden editarse o eliminarse con las herramientas del mapa;
no se guardan al cerrar o recargar el visor.

Los datos están en data/, la interfaz en index.html y css/indicadores.css, y
la configuración de las zonas y del mapa en js/indicadores.js. Las mediciones
están en js/mediciones.js y usan la biblioteca local Leaflet Draw. Se
conservaron los colores y el orden de las capas de la exportación original.

Las imágenes institucionales provienen del proyecto principal del Observatorio.
Los mapas base requieren conexión a internet.
