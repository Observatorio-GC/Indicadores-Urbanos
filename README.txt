# Visor de indicadores urbanos

Visor de zonificación parcelaria del Observatorio Territorial de Godoy Cruz.
Abrir index.html directamente en el navegador o publicar la carpeta completa
en un servidor web. No requiere instalar dependencias ni compilar el proyecto.

El panel "Zonificación" permite activar y desactivar cada zona. Las capas
comienzan desactivadas, como en la exportación original de qgis2web; al hacer
clic en una parcela se muestran sus atributos disponibles. El panel comienza
abierto en escritorio y cerrado en dispositivos móviles y tabletas (hasta
1024 px); en estos últimos se abre con el botón "Zonificación".
Al abrir una parcela desde una capa se resalta su contorno en rojo; el
contorno se retira al cerrar el popup o desactivar la capa.
El botón "Activar todas las zonas" permite mostrar todas las capas; cuando
todas están activas, permite desactivarlas juntas. La carga inicial puede
demorar por la cantidad de parcelas.
El popup muestra primero los indicadores en un desplegable abierto inicialmente;
el desplegable "Ver datos de la parcela" contiene los atributos disponibles,
sin los campos de nomenclatura de 16 y 20 dígitos. Los valores vacíos no se
muestran.

El detalle incluye los indicadores por zona y rangos de superficie
transcriptos del visor anterior (index.htm): FOS, FOT y altura máxima, junto
con los valores de mayor uso cuando estaban disponibles. Se muestran todos
los rangos originales sin elegir uno automáticamente; se debe consultar la
normativa vigente para confirmar la aplicación a cada parcela. Las zonas sin
información se identifican explícitamente. Los valores se mantienen en
js/indicadores-urbanos.js.

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

El botón "3D" abre una vista inclinable que representa de manera esquemática
las alturas máximas del campo numérico Altura (en metros) en las zonas activas.
No representa edificaciones existentes ni reemplaza la consulta de la
normativa. Las parcelas sin altura válida se muestran planas. Se puede
seleccionar una parcela, buscar y cambiar las zonas y el mapa base en 3D.
Los bordes superiores de cada volumen indican los límites de las parcelas.
Al seleccionar una parcela con altura se resaltan en rojo las aristas del
volumen; al cerrar el popup se quita el resaltado de las parcelas seleccionadas
con un clic. La parcela buscada se quita con su botón correspondiente.
Si se busca una parcela de una zona desactivada, su volumen se muestra
individualmente sin activar la zona; si no tiene altura, permanece plana.
Para inclinar o girar se arrastra con el botón derecho o se usan dos dedos;
también se puede girar arrastrando la brújula con el botón izquierdo.
el botón de orientación vuelve al norte sin cambiar la inclinación.
Al alejarse demasiado se dejan de mostrar las parcelas hasta volver a acercar.
Para medir o usar Street View, regresar al mapa 2D con el botón correspondiente.
El modo 3D utiliza la biblioteca local MapLibre GL JS y requiere WebGL.
