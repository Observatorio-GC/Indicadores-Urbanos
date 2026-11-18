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
contorno se retira al cerrar la ventana de información o desactivar la capa.
El botón "Activar todas las zonas" permite mostrar todas las capas; cuando
todas están activas, permite desactivarlas juntas. La carga inicial puede
demorar por la cantidad de parcelas.
Una ventana lateral muestra los atributos disponibles y los indicadores de
la parcela tanto en 2D como en 3D. No incluye el campo Altura utilizado para
la vista 3D ni muestra valores vacíos. Los archivos públicos de parcelas no
contienen padrón ni nomenclatura.

El detalle incluye los indicadores por zona y rangos de superficie
transcriptos del visor anterior (index.htm): FOS, FOT y altura máxima, junto
con los valores de mayor uso cuando estaban disponibles. Se muestran todos
los rangos originales sin elegir uno automáticamente; se debe consultar la
normativa vigente para confirmar la aplicación a cada parcela. Las zonas sin
información se identifican explícitamente. Los valores se mantienen en
js/indicadores-urbanos.js.

La superficie de las parcelas se presenta en m².

Debajo del zoom se pueden cambiar los mapas base y medir líneas o áreas.
Las mediciones pueden editarse o eliminarse con las herramientas del mapa;
no se guardan al cerrar o recargar el visor.

Los datos están en data/, la interfaz en index.html y css/indicadores.css, y
la configuración de las zonas y del mapa en js/indicadores.js. Las mediciones
están en js/mediciones.js y usan la biblioteca local Leaflet Draw. Se
conservaron los colores y el orden de las capas de la exportación original.

Las imágenes institucionales provienen del proyecto principal del Observatorio.
Los mapas base requieren conexión a internet.

El botón "Parcelario 3D" abre una vista inclinable que representa de manera esquemática
las alturas máximas del campo numérico Altura (en metros) en las zonas activas.
No representa edificaciones existentes ni reemplaza la consulta de la
normativa. Las parcelas sin altura válida se muestran planas. Se puede
seleccionar una parcela y cambiar las zonas y el mapa base en 3D.
Los bordes superiores de cada volumen indican los límites de las parcelas.
Al seleccionar una parcela con altura se resaltan en rojo las aristas del
volumen; al cerrar la ventana se quita el resaltado de las parcelas seleccionadas
con un clic.
Para inclinar o girar se arrastra con el botón derecho o se usan dos dedos;
también se puede girar arrastrando la brújula con el botón izquierdo.
el botón de orientación vuelve al norte sin cambiar la inclinación.
Al alejarse demasiado se dejan de mostrar las parcelas hasta volver a acercar.
Para medir o usar Street View, regresar al mapa 2D con el botón correspondiente.
El modo 3D utiliza la biblioteca local MapLibre GL JS y requiere WebGL.
