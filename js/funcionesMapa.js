/* L.CONTROL.LAYERS(baseMaps, overlayMaps).addTo(map) */
L.control.groupedLayers(baseMaps, groupedOverlays, opciones_groupedlayers).addTo(map);
map.on('overlayadd', onOverlayAdd);
map.on('overlayremove', onOverlayRemove);
/* L.control.scale().addTo(map); */
/* L.control.polylineMeasure().addTo(map); */



/* COORDENADAS CLICK MOUSE */
  var c = new L.Control.Coordinates();
c.addTo(map);
    function onMapClick(e) {
       c.setCoordinates(e);
    }map.on('click', onMapClick);



/* TEXTOS CICLOVIAS */
function onOverlayAdd(e) {
    idlayer = "";
    if (e.name == "Residencial r1 r2 r3 r4 r5") {
        idlayer = "zona14"
    }  else if (e.name == "Residencial r6") {
        idlayer = "zona13";
    } else if (e.name == "Residencial Mixta") {
        idlayer = "zona11";
    } else if (e.name == "Comercial Mixta") {
        idlayer = "zona3";
    } else if (e.name == "Comercial") {
        idlayer = "zona4";
    }  else if (e.name == "Ejes Residenciales Especiales") {
        idlayer = "zona6";
    } else if (e.name == "Residencial Mixta 1") {
        idlayer = "zona12";
    } else if (e.name == "Centro Civico") {
        idlayer = "zona2";
    } else if (e.name == "Industrial 1") {
        idlayer = "zona8";
    } else if (e.name == "Industrial 2") {
        idlayer = "zona9";
    } else if (e.name == "Extensión Industrial") {
        idlayer = "zona7";
    }
    document.getElementById("ref_" + idlayer).style.display = 'block';
}

function onOverlayRemove(e) {
    idlayer = "";
    if (e.name == "Residencial r1 r2 r3 r4 r5") {
        idlayer = "zona14"
    }  else if (e.name == "Residencial r6") {
        idlayer = "zona13";
    } else if (e.name == "Residencial Mixta") {
        idlayer = "zona11";
    } else if (e.name == "Comercial Mixta") {
        idlayer = "zona3";
    } else if (e.name == "Comercial") {
        idlayer = "zona4";
    } else if (e.name == "Ejes Residenciales Especiales") {
        idlayer = "zona6";
    } else if (e.name == "Residencial Mixta 1") {
        idlayer = "zona12";
    } else if (e.name == "Centro Civico") {
        idlayer = "zona2";
    } else if (e.name == "Industrial 1") {
        idlayer = "zona8";
    } else if (e.name == "Industrial 2") {
        idlayer = "zona9";
    } else if (e.name == "Extensión Industrial") {
        idlayer = "zona7";
    }
    document.getElementById("ref_" + idlayer).style.display = 'none';
}
include('logger.php');