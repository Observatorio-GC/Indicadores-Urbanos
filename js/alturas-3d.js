function initHeightView(map, zones, baseMaps, createPopup) {
    'use strict';

    var container = document.getElementById('map-3d');
    var status = document.getElementById('height-3d-status');
    var baseSelect = document.getElementById('height-base-map');
    var button;
    var view;
    var outlines;
    var outlineError = false;
    var ready = false;
    var active = false;
    var popup;
    var pendingParcel;
    var clickedZone;
    var selectedFeature;
    var selectedZone;
    var selectedIsSearch = false;
    var searchedFeature;
    var searchedZone;
    var sources = {
        'OpenStreetMap': {
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            maxzoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        },
        'Google Satelital': {
            tiles: ['https://mt0.google.com/vt/lyrs=s&hl=es&x={x}&y={y}&z={z}'],
            maxzoom: 20,
            attribution: '&copy; Google'
        },
        'ESRI Satelital': {
            tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
            maxzoom: 20,
            attribution: '&copy; Esri'
        }
    };

    function emptyCollection() {
        return { type: 'FeatureCollection', features: [] };
    }

    function parcelHeight(feature) {
        var height = feature && feature.properties && feature.properties.Altura;
        return typeof height === 'number' && isFinite(height) && height > 0 ? height : 0;
    }

    function zoneFeatures(zone) {
        if (zone.heightViewFeatures) return zone.heightViewFeatures;
        zone.heightViewFeatures = [];
        zone.data.features.forEach(function (feature, index) {
            var geometry = feature.geometry;
            if (!geometry || (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon')) return;
            var bounds = L.latLngBounds();
            var polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
            polygons.forEach(function (polygon) {
                polygon.forEach(function (ring) {
                    ring.forEach(function (point) { bounds.extend([point[1], point[0]]); });
                });
            });
            if (!bounds.isValid()) return;
            var height = parcelHeight(feature);
            zone.heightViewFeatures.push({
                bounds: bounds,
                feature: {
                    type: 'Feature',
                    id: 'zone-' + zone.order + '-feature-' + index,
                    properties: {
                        zone: zone.order,
                        index: index,
                        height: height,
                        color: zone.color
                    },
                    geometry: geometry
                }
            });
        });
        return zone.heightViewFeatures;
    }

    function refresh() {
        if (!active || !ready) return;
        var bounds = view.getBounds();
        var visibleBounds = L.latLngBounds(
            [bounds.getSouth(), bounds.getWest()], [bounds.getNorth(), bounds.getEast()]
        ).pad(0.25);
        var visible = zones.filter(function (zone) { return zone.checkbox.checked; });
        if (clickedZone && !clickedZone.checkbox.checked) clearSelection();
        var features = [];
        if (view.getZoom() >= 14) {
            visible.forEach(function (zone) {
                zoneFeatures(zone).forEach(function (item) {
                    if (visibleBounds.intersects(item.bounds)) features.push(item.feature);
                });
            });
        }
        view.getSource('parcels').setData({ type: 'FeatureCollection', features: features });
        updateSearchVolume();
        if (outlines) outlines.setFeatures(features);
        updateSelectedOutline();
        if (!visible.length && !searchedFeature) {
            status.textContent = 'Activá una zona para ver sus alturas.';
        } else if (view.getZoom() < 14) {
            status.textContent = 'Acercá el mapa para ver las parcelas y sus alturas.';
        } else {
            status.textContent = 'Alturas máximas permitidas, no edificaciones existentes. Las parcelas sin altura se muestran planas.';
        }
        if (outlineError) status.textContent += ' No se pudieron mostrar los contornos de las parcelas.';
    }

    function selectBase(name) {
        if (!ready) return;
        Object.keys(sources).forEach(function (key) {
            view.setLayoutProperty('base-' + key, 'visibility', key === name ? 'visible' : 'none');
        });
    }

    function updateSelectedOutline() {
        if (!outlines) return;
        var height = parcelHeight(selectedFeature);
        if (!selectedZone || (!selectedIsSearch && !selectedZone.checkbox.checked)) height = 0;
        outlines.setSelected(selectedFeature, height);
    }

    function updateSearchVolume() {
        if (!ready) return;
        var source = view.getSource('searched-volume');
        if (!searchedFeature || searchedZone.checkbox.checked || !parcelHeight(searchedFeature)) {
            source.setData(emptyCollection());
            return;
        }
        source.setData({
            type: 'Feature',
            properties: { height: parcelHeight(searchedFeature), color: searchedZone.color },
            geometry: searchedFeature.geometry
        });
    }

    function setSelected(zone, feature, isSearch) {
        selectedZone = zone;
        selectedFeature = feature;
        selectedIsSearch = !!isSearch;
        view.getSource('selected').setData(feature);
        updateSelectedOutline();
    }

    function clearSelection() {
        clickedZone = null;
        selectedZone = null;
        selectedFeature = null;
        selectedIsSearch = false;
        if (!ready) return;
        view.getSource('selected').setData(emptyCollection());
        updateSelectedOutline();
        if (popup) popup.remove();
    }

    function showPopup(zone, feature, point, isSearch) {
        if (popup) popup.remove();
        popup = new maplibregl.Popup({ maxWidth: Math.min(300, window.innerWidth - 40) + 'px',
            className: 'parcel-popup-3d' }).setLngLat(point);
        var currentPopup = popup;
        popup.on('close', function () {
            if (popup === currentPopup) {
                popup = null;
                if (!isSearch) {
                    clickedZone = null;
                    selectedZone = null;
                    selectedFeature = null;
                    selectedIsSearch = false;
                    view.getSource('selected').setData(emptyCollection());
                    updateSelectedOutline();
                }
            }
        });
        var adapter = {
            getPopup: function () {
                return { isOpen: function () { return currentPopup.isOpen(); }, update: function () {} };
            }
        };
        popup.setDOMContent(createPopup(feature, zone, adapter)).addTo(view);
    }

    function showParcel(zone, feature) {
        searchedZone = zone;
        searchedFeature = feature;
        if (!active) return;
        if (!ready) {
            pendingParcel = { zone: zone, feature: feature };
            return;
        }
        clickedZone = null;
        updateSearchVolume();
        var bounds = L.geoJSON(feature).getBounds();
        if (!bounds.isValid()) return;
        view.fitBounds([
            [bounds.getWest(), bounds.getSouth()], [bounds.getEast(), bounds.getNorth()]
        ], { maxZoom: 18, padding: 80 });
        showPopup(zone, feature, [bounds.getCenter().lng, bounds.getCenter().lat], true);
        setSelected(zone, feature, true);
    }

    function clearParcel() {
        pendingParcel = null;
        searchedFeature = null;
        searchedZone = null;
        if (!ready) return;
        updateSearchVolume();
        if (selectedIsSearch) {
            clearSelection();
        }
    }

    function createView() {
        var style = {
            version: 8,
            sources: {},
            layers: []
        };
        Object.keys(sources).forEach(function (name) {
            style.sources[name] = {
                type: 'raster',
                tiles: sources[name].tiles,
                tileSize: 256,
                maxzoom: sources[name].maxzoom,
                attribution: sources[name].attribution
            };
            style.layers.push({
                id: 'base-' + name,
                type: 'raster',
                source: name,
                layout: { visibility: name === baseSelect.value ? 'visible' : 'none' }
            });
        });
        style.sources.parcels = { type: 'geojson', data: emptyCollection(), maxzoom: 22, buffer: 256, tolerance: 0 };
        style.sources.selected = { type: 'geojson', data: emptyCollection() };
        style.sources['searched-volume'] = { type: 'geojson', data: emptyCollection(), maxzoom: 22, tolerance: 0 };
        style.layers.push(
            {
                id: 'flat-parcels', type: 'fill', source: 'parcels',
                filter: ['==', ['get', 'height'], 0],
                paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.5, 'fill-outline-color': '#333333' }
            },
            {
                id: 'height-parcels', type: 'fill-extrusion', source: 'parcels',
                filter: ['>', ['get', 'height'], 0],
                paint: { 'fill-extrusion-color': ['get', 'color'], 'fill-extrusion-height': ['get', 'height'], 'fill-extrusion-opacity': 0.9 }
            },
            {
                id: 'searched-height', type: 'fill-extrusion', source: 'searched-volume',
                paint: { 'fill-extrusion-color': ['get', 'color'], 'fill-extrusion-height': ['get', 'height'], 'fill-extrusion-opacity': 0.9 }
            },
            {
                id: 'selected-parcel', type: 'line', source: 'selected',
                paint: { 'line-color': '#e00000', 'line-width': 4 }
            }
        );
        var center = map.getCenter();
        view = new maplibregl.Map({
            container: 'map-3d-canvas', style: style,
            center: [center.lng, center.lat], zoom: Math.max(0, map.getZoom() - 1),
            pitch: 60, maxPitch: 80, bearing: 0, maxZoom: 22, attributionControl: false,
            locale: {
                'NavigationControl.ZoomIn': 'Acercar',
                'NavigationControl.ZoomOut': 'Alejar',
                'NavigationControl.ResetBearing': 'Orientar hacia el norte'
            }
        });
        view.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), 'top-left');
        view.addControl(new maplibregl.AttributionControl({ compact: false,
            customAttribution: 'Secretaría de Ambiente, Obras y Servicios Públicos' }), 'bottom-left');
        view.on('load', function () {
            try {
                outlines = createHeightOutlineLayer(view.getCenter());
                view.addLayer(outlines, 'selected-parcel');
            } catch (error) {
                console.error('No se pudieron iniciar los contornos 3D:', error);
                outlines = null;
                outlineError = true;
            }
            ready = true;
            selectBase(baseSelect.value);
            refresh();
            if (pendingParcel) {
                var parcel = pendingParcel;
                pendingParcel = null;
                showParcel(parcel.zone, parcel.feature);
            }
        });
        view.on('moveend', refresh);
        view.on('error', function (event) {
            console.error('Error en la vista 3D:', event.error);
            status.textContent = 'No se pudo cargar parte de la vista 3D. Revisá la conexión o volvé al mapa 2D.';
        });
        view.on('click', function (event) {
            var hits = view.queryRenderedFeatures(event.point, { layers: ['height-parcels', 'flat-parcels', 'searched-height'] });
            if (!hits.length) return;
            if (hits[0].layer.id === 'searched-height' && searchedFeature) {
                showPopup(searchedZone, searchedFeature, event.lngLat, true);
                clickedZone = null;
                setSelected(searchedZone, searchedFeature, true);
                return;
            }
            var properties = hits[0].properties;
            var zone = zones.find(function (item) { return item.order === properties.zone; });
            if (!zone || !zone.data.features[properties.index]) return;
            showPopup(zone, zone.data.features[properties.index], event.lngLat);
            clickedZone = zone;
            setSelected(zone, zone.data.features[properties.index]);
        });
    }

    function close() {
        if (!active) return;
        var center = view.getCenter();
        active = false;
        view.stop();
        pendingParcel = null;
        container.hidden = true;
        map.getContainer().removeAttribute('inert');
        map.getContainer().removeAttribute('aria-hidden');
        button.setAttribute('aria-pressed', 'false');
        map.setView([center.lat, center.lng], view.getZoom() + 1, { animate: false });
        map.invalidateSize();
        button.focus();
    }

    var HeightControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: function () {
            var control = L.DomUtil.create('div', 'height-control leaflet-control');
            button = L.DomUtil.create('button', 'height-toggle', control);
            button.type = 'button';
            button.textContent = '3D';
            button.title = 'Ver alturas máximas en 3D';
            button.setAttribute('aria-label', 'Ver alturas máximas en 3D');
            button.setAttribute('aria-pressed', 'false');
            L.DomEvent.disableClickPropagation(control);
            L.DomEvent.on(button, 'click', function () {
                var testCanvas = document.createElement('canvas');
                if (!testCanvas.getContext('webgl2') && !testCanvas.getContext('webgl')) {
                    alert('La vista 3D requiere un navegador con WebGL habilitado.');
                    return;
                }
                Object.keys(baseMaps).forEach(function (name) {
                    if (map.hasLayer(baseMaps[name])) baseSelect.value = name;
                });
                container.hidden = false;
                active = true;
                map.getContainer().setAttribute('inert', '');
                map.getContainer().setAttribute('aria-hidden', 'true');
                status.textContent = 'Cargando vista 3D...';
                button.setAttribute('aria-pressed', 'true');
                if (!view) {
                    try {
                        createView();
                    } catch (error) {
                        console.error('No se pudo iniciar la vista 3D:', error);
                        active = false;
                        container.hidden = true;
                        map.getContainer().removeAttribute('inert');
                        map.getContainer().removeAttribute('aria-hidden');
                        button.setAttribute('aria-pressed', 'false');
                        alert('No se pudo iniciar la vista 3D. Revisá que WebGL esté habilitado.');
                    }
                } else {
                    var center = map.getCenter();
                    view.jumpTo({ center: [center.lng, center.lat], zoom: map.getZoom() - 1,
                        pitch: view.getPitch() === 0 ? 60 : view.getPitch() });
                    view.resize();
                    selectBase(baseSelect.value);
                    refresh();
                    if (searchedFeature) showParcel(searchedZone, searchedFeature);
                }
                if (!ready && searchedFeature) pendingParcel = { zone: searchedZone, feature: searchedFeature };
            });
            return control;
        }
    });

    document.getElementById('height-3d-close').addEventListener('click', close);
    baseSelect.addEventListener('change', function () {
        Object.keys(baseMaps).forEach(function (name) {
            if (map.hasLayer(baseMaps[name])) map.removeLayer(baseMaps[name]);
        });
        baseMaps[baseSelect.value].addTo(map);
        selectBase(baseSelect.value);
    });
    map.addControl(new HeightControl());
    return { refresh: refresh, showParcel: showParcel, clearParcel: clearParcel };
}
