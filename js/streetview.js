function initStreetView(map) {
    'use strict';

    var active = false;
    var drawing = false;
    var marker = null;
    var container = map.getContainer();
    var hint = document.createElement('div');
    hint.className = 'streetview-hint';
    hint.innerHTML = '<strong>Modo Street View activo</strong><br>Hacé clic en el mapa para elegir la posición';
    container.appendChild(hint);

    var pegman = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
        '<circle cx="12" cy="4.5" r="3.2" fill="#fbbc04" stroke="#b37d00" stroke-width="1"/>' +
        '<path d="M12 8.5c-3.2 0-5.2 1.6-5.2 3.8v4l2.2.6V22h2.2v-4.8h1.6V22H15v-5.1l2.2-.6v-4c0-2.2-2-3.8-5.2-3.8z" ' +
        'fill="#fbbc04" stroke="#b37d00" stroke-width="1" stroke-linejoin="round"/></svg>';

    var icon = L.divIcon({
        className: 'streetview-pin',
        html: '<span>' + pegman + '</span>',
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34]
    });

    function streetViewUrl(latlng) {
        return 'https://www.google.com/maps?layer=c&cbll=' +
            L.Util.formatNum(latlng.lat, 6) + ',' + L.Util.formatNum(latlng.lng, 6);
    }

    function popupContent(latlng) {
        var wrapper = L.DomUtil.create('div', 'streetview-popup');
        var title = L.DomUtil.create('strong', '', wrapper);
        title.textContent = 'Street View';
        var coords = L.DomUtil.create('p', '', wrapper);
        coords.textContent = L.Util.formatNum(latlng.lat, 6) + ', ' + L.Util.formatNum(latlng.lng, 6);
        var open = L.DomUtil.create('a', 'streetview-open', wrapper);
        open.href = streetViewUrl(latlng);
        open.target = '_blank';
        open.rel = 'noopener noreferrer';
        open.textContent = 'Abrir en Google Street View';
        var remove = L.DomUtil.create('button', 'streetview-remove', wrapper);
        remove.type = 'button';
        remove.textContent = 'Quitar marcador';
        L.DomEvent.on(remove, 'click', removeMarker);
        return wrapper;
    }

    function removeMarker() {
        if (marker) map.removeLayer(marker);
        marker = null;
    }

    function showMarker(latlng) {
        if (!marker) {
            marker = L.marker(latlng, { icon: icon, draggable: true, title: 'Arrastrá para mover' }).addTo(map);
            marker.on('dragend', function () {
                marker.setPopupContent(popupContent(marker.getLatLng())).openPopup();
            });
            marker.bindPopup(popupContent(latlng));
        } else {
            marker.setLatLng(latlng);
            marker.setPopupContent(popupContent(latlng));
        }
        marker.openPopup();
    }

    var StreetViewControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: function () {
            var bar = L.DomUtil.create('div', 'leaflet-bar leaflet-control streetview-control');
            var button = L.DomUtil.create('a', 'streetview-toggle', bar);
            button.href = '#';
            button.title = 'Street View';
            button.setAttribute('role', 'button');
            button.setAttribute('aria-label', 'Street View');
            button.setAttribute('aria-pressed', 'false');
            button.innerHTML = pegman;
            L.DomEvent.disableClickPropagation(bar);
            L.DomEvent.on(button, 'click', function (event) {
                L.DomEvent.preventDefault(event);
                active = !active;
                button.classList.toggle('active', active);
                button.setAttribute('aria-pressed', String(active));
                container.classList.toggle('streetview-mode', active);
                hint.classList.toggle('active', active);
                if (!active) removeMarker();
            });
            return bar;
        }
    });
    map.addControl(new StreetViewControl());

    map.on(L.Draw.Event.DRAWSTART, function () { drawing = true; });
    map.on(L.Draw.Event.DRAWSTOP, function () { drawing = false; });
    map.on(L.Draw.Event.EDITSTART + ' ' + L.Draw.Event.DELETESTART, function () { drawing = true; });
    map.on(L.Draw.Event.EDITSTOP + ' ' + L.Draw.Event.DELETESTOP, function () { drawing = false; });

    map.on('click', function (event) {
        if (active && !drawing) showMarker(event.latlng);
    });
}
