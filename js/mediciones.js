function initMeasurements(map) {
    'use strict';

    L.drawLocal.draw.toolbar.actions.title = 'Cancelar medición';
    L.drawLocal.draw.toolbar.actions.text = 'Cancelar';
    L.drawLocal.draw.toolbar.finish.title = 'Finalizar medición';
    L.drawLocal.draw.toolbar.finish.text = 'Terminar';
    L.drawLocal.draw.toolbar.undo.title = 'Eliminar el último punto';
    L.drawLocal.draw.toolbar.undo.text = 'Eliminar último punto';
    L.drawLocal.draw.toolbar.buttons.polyline = 'Medir una línea';
    L.drawLocal.draw.toolbar.buttons.polygon = 'Medir un área';
    L.drawLocal.draw.handlers.polyline.tooltip.start = 'Hacé clic para empezar a medir.';
    L.drawLocal.draw.handlers.polyline.tooltip.cont = 'Hacé clic para agregar puntos.';
    L.drawLocal.draw.handlers.polyline.tooltip.end = 'Hacé clic en el último punto para terminar.';
    L.drawLocal.draw.handlers.polygon.tooltip.start = 'Hacé clic para empezar a medir.';
    L.drawLocal.draw.handlers.polygon.tooltip.cont = 'Hacé clic para agregar puntos.';
    L.drawLocal.draw.handlers.polygon.tooltip.end = 'Hacé clic en el primer punto para cerrar el área.';
    L.drawLocal.draw.handlers.polyline.error = '<strong>Error:</strong> los bordes no pueden cruzarse.';
    L.drawLocal.edit.toolbar.actions.save.title = 'Guardar cambios';
    L.drawLocal.edit.toolbar.actions.save.text = 'Guardar';
    L.drawLocal.edit.toolbar.actions.cancel.title = 'Cancelar cambios';
    L.drawLocal.edit.toolbar.actions.cancel.text = 'Cancelar';
    L.drawLocal.edit.toolbar.actions.clearAll.title = 'Eliminar todas las mediciones';
    L.drawLocal.edit.toolbar.actions.clearAll.text = 'Eliminar todo';
    L.drawLocal.edit.toolbar.buttons.edit = 'Editar mediciones';
    L.drawLocal.edit.toolbar.buttons.editDisabled = 'No hay mediciones para editar';
    L.drawLocal.edit.toolbar.buttons.remove = 'Eliminar mediciones';
    L.drawLocal.edit.toolbar.buttons.removeDisabled = 'No hay mediciones para eliminar';
    L.drawLocal.edit.handlers.edit.tooltip.text = 'Arrastrá los puntos para editar la medición.';
    L.drawLocal.edit.handlers.edit.tooltip.subtext = 'Hacé clic en Guardar cuando termines.';
    L.drawLocal.edit.handlers.remove.tooltip.text = 'Hacé clic en una medición para eliminarla.';

    var drawnItems = new L.FeatureGroup().addTo(map);
    var measurementRenderer = L.svg({ pane: 'measurements' });
    map.addControl(new L.Control.Draw({
        position: 'topleft',
        draw: {
            polyline: {
                metric: true,
                shapeOptions: { renderer: measurementRenderer, color: '#2563eb', weight: 3, opacity: 0.8, dashArray: '5, 5' }
            },
            polygon: {
                allowIntersection: false,
                showArea: true,
                metric: true,
                shapeOptions: { renderer: measurementRenderer, color: '#dc2626', weight: 2, opacity: 0.8, fillOpacity: 0.3, dashArray: '5, 5' }
            },
            rectangle: false,
            circle: false,
            marker: false,
            circlemarker: false
        },
        edit: { featureGroup: drawnItems }
    }));

    function updateLabel(layer) {
        var points = layer.getLatLngs();
        var value;
        var position;
        if (layer instanceof L.Polygon) {
            value = L.GeometryUtil.geodesicArea(points[0]);
            position = layer.getBounds().getCenter();
            value = value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' m²';
        } else {
            var distance = 0;
            for (var i = 1; i < points.length; i++) distance += points[i - 1].distanceTo(points[i]);
            position = points[Math.floor(points.length / 2)];
            value = distance >= 1000
                ? (distance / 1000).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' km'
                : distance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' m';
        }
        layer.unbindTooltip();
        layer.bindTooltip(value, { permanent: true, direction: 'top', className: 'measurement-label' });
        layer.openTooltip(position);
    }

    map.on(L.Draw.Event.CREATED, function (event) {
        drawnItems.addLayer(event.layer);
        updateLabel(event.layer);
    });
    map.on(L.Draw.Event.EDITED, function (event) {
        event.layers.eachLayer(updateLabel);
    });
}
