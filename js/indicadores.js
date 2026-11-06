(function () {
    'use strict';

    var initialBounds = [[-32.96089421711218, -68.90957059903393], [-32.89886778177335, -68.77568557146358]];
    var map = L.map('map', {
        maxZoom: 28,
        minZoom: 1,
        preferCanvas: true
    }).fitBounds(initialBounds);

    new L.Hash(map);
    map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a> · <a href="https://qgis.org">QGIS</a> · <a href="https://github.com/qgis2web/qgis2web">qgis2web</a>');
    var baseMaps = {
        'OpenStreetMap': L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 28,
            maxNativeZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }),
        'Google Satelital': L.tileLayer('https://mt0.google.com/vt/lyrs=s&hl=es&x={x}&y={y}&z={z}', {
            maxZoom: 28,
            maxNativeZoom: 20,
            attribution: 'Google'
        }),
        'ESRI Satelital': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 28,
            maxNativeZoom: 20,
            attribution: 'Tiles &copy; Esri'
        })
    };
    baseMaps.OpenStreetMap.addTo(map);
    var baseControl = L.control.layers(baseMaps, null, { position: 'topleft' }).addTo(map);
    var baseToggle = baseControl.getContainer().querySelector('.leaflet-control-layers-toggle');
    baseToggle.title = 'Mapas base';
    baseToggle.setAttribute('aria-label', 'Mapas base');
    map.createPane('measurements');
    map.getPane('measurements').style.zIndex = 460;
    initMeasurements(map);

    var zones = [
        { name: 'Extensión industrial', color: '#7d8b8f', data: json_Extensionindustrial_12, order: 412 },
        { name: 'Industrial 1', color: '#a47158', data: json_Industrial1_11, order: 411 },
        { name: 'Industrial 2', color: '#729b6f', data: json_Industrial2_10, order: 410 },
        { name: 'Centro Cívico', color: '#8d5a99', data: json_CentroCivico_9, order: 409 },
        { name: 'Residencial R6', color: '#ff9e17', data: json_Residencialr6_8, order: 408 },
        { name: 'Comercial Mixta', color: '#e77148', data: json_ComercialMixta_7, order: 407 },
        { name: 'Comercial', color: '#becf50', data: json_Comercial_6, order: 406 },
        { name: 'Residencial Mixta 1', color: '#e5b636', data: json_ResidencialMixta1_5, order: 405 },
        { name: 'Residencial Mixta', color: '#beb297', data: json_ResidencialMixta_4, order: 404 },
        { name: 'Parque Recreación', color: '#7d8b8f', data: json_ParqueRecreacin_3, order: 403 },
        { name: 'Residencial R1-R2-R3-R4-R5', color: '#a47158', data: json_Residencialr1r2r3r4r5_2, order: 402 },
        { name: 'Ejes Residenciales Especiales', color: '#729b6f', data: json_EjesResidencialesEspeciales_1, order: 401 }
    ];

    var fields = [
        { key: 'nomenc21', label: 'Nomenclatura' },
        { key: 'barrio', label: 'Barrio' },
        { key: 'sup', label: 'Superficie m²' },
        { key: 'padron', label: 'Padrón' },
        { key: 'Altura', label: 'Altura' },
        { key: 'Tipo', label: 'Tipo' },
        { key: 'Zonific_1', label: 'Zonificación' },
        { key: 'id', label: 'ID' },
        { key: 'coor_x', label: 'Coordenada X' },
        { key: 'coor_y', label: 'Coordenada Y' }
    ];

    function createPopup(feature, zone, layer) {
        var container = document.createElement('div');
        var heading = document.createElement('h3');
        var details = document.createElement('details');
        var summary = document.createElement('summary');
        var list = document.createElement('dl');
        container.className = 'parcel-popup';
        heading.textContent = zone.name;
        container.appendChild(heading);
        appendUrbanIndicators(container, zone, layer);
        details.className = 'parcel-details';
        summary.textContent = 'Ver datos de la parcela';
        details.appendChild(summary);
        fields.forEach(function (field) {
            var value = feature.properties && feature.properties[field.key];
            if (value === null || value === undefined || value === '') return;
            var term = document.createElement('dt');
            var description = document.createElement('dd');
            term.textContent = field.label;
            description.textContent = String(value);
            list.appendChild(term);
            list.appendChild(description);
        });
        details.appendChild(list);
        details.addEventListener('toggle', function () {
            var popup = layer.getPopup();
            if (popup && popup.isOpen()) popup.update();
        });
        container.appendChild(details);
        var source = document.createElement('p');
        source.className = 'indicator-source';
        source.textContent = 'Consultá la normativa vigente para confirmar su aplicación.';
        container.appendChild(source);
        return container;
    }

    function appendUrbanIndicators(container, zone, layer) {
        var indicator = indicadoresUrbanos[zone.order];
        var section = document.createElement('details');
        var heading = document.createElement('summary');
        heading.textContent = 'Indicadores urbanos';
        section.className = 'urban-indicators';
        section.open = true;
        section.appendChild(heading);
        section.addEventListener('toggle', function () {
            var popup = layer.getPopup();
            if (popup && popup.isOpen()) popup.update();
        });

        if (!indicator || indicator.sinIndicadores) {
            var message = document.createElement('p');
            message.textContent = indicator
                ? 'No posee indicadores urbanos'
                : 'No hay indicadores disponibles para esta zona en el visor anterior.';
            section.appendChild(message);
        } else {
            indicator.rangos.forEach(function (range) {
                var rangeTitle = document.createElement('h5');
                var normal = document.createElement('p');
                var mayorUso = document.createElement('p');
                rangeTitle.textContent = range.superficie;
                normal.textContent = 'FOS máx.: ' + range.normal[0] + ' · FOT máx.: ' + range.normal[1];
                mayorUso.textContent = range.mayorUso
                    ? 'Mayor uso — FOS máx.: ' + range.mayorUso[0] + ' · FOT máx.: ' + range.mayorUso[1]
                    : 'No posee mayor uso de suelo';
                section.appendChild(rangeTitle);
                section.appendChild(normal);
                section.appendChild(mayorUso);
            });
            var heights = document.createElement('p');
            heights.className = 'indicator-heights';
            heights.textContent = 'Altura máxima: ' + indicator.altura + '. ' +
                (indicator.alturaMayorUso ? 'Mayor uso: ' + indicator.alturaMayorUso : 'No posee mayor uso de suelo') + '.';
            section.appendChild(heights);
            if (indicator.ordenanza) {
                var link = document.createElement('a');
                link.href = 'https://drive.google.com/file/d/16F_9ytsnJd-A6q7GwV9zN5EsN_7XCLMi/view?usp=sharing';
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.textContent = 'Ordenanza de mayor uso 7301/22';
                section.appendChild(link);
            }
        }
        container.appendChild(section);
    }

    map.createPane('parcel-zones');
    map.getPane('parcel-zones').style.zIndex = 412;
    var zoneRenderer = L.canvas({ pane: 'parcel-zones' });
    map.createPane('parcel-highlight');
    map.getPane('parcel-highlight').style.zIndex = 440;
    map.getPane('parcel-highlight').style.pointerEvents = 'none';
    var highlightRenderer = L.svg({ pane: 'parcel-highlight' });
    var highlightedParcel;
    var highlightedLayer;

    function clearParcelHighlight(event) {
        if (highlightedLayer !== event.target) return;
        map.removeLayer(highlightedParcel);
        highlightedParcel = null;
        highlightedLayer = null;
    }

    function highlightParcel(event) {
        if (highlightedParcel) map.removeLayer(highlightedParcel);
        highlightedLayer = event.target;
        highlightedParcel = L.geoJSON(event.target.feature, {
            renderer: highlightRenderer,
            interactive: false,
            style: { color: '#e00000', weight: 4, opacity: 1, fill: false }
        }).addTo(map);
    }

    function createLayer(zone) {
        return L.geoJSON(zone.data, {
            renderer: zoneRenderer,
            style: {
                color: '#232323',
                weight: 1,
                lineCap: 'butt',
                lineJoin: 'miter',
                fillColor: zone.color,
                fillOpacity: 1
            },
            onEachFeature: function (feature, layer) {
                var popupContent;
                layer.on('popupopen', highlightParcel);
                layer.on('popupclose remove', clearParcelHighlight);
                layer.bindPopup(function () {
                    if (!popupContent) popupContent = createPopup(feature, zone, layer);
                    return popupContent;
                }, { maxHeight: 400 });
            }
        });
    }

    var list = document.getElementById('layer-list');
    var toggleAllButton = document.getElementById('toggle-all-layers');
    var layerActionStatus = document.getElementById('layer-action-status');

    function updateToggleAllButton() {
        var allActive = zones.every(function (zone) {
            return zone.checkbox.checked;
        });
        toggleAllButton.textContent = allActive ? 'Desactivar todas las zonas' : 'Activar todas las zonas';
    }

    function setZoneVisible(zone, visible) {
        if (visible && (!zone.layer || !map.hasLayer(zone.layer))) {
            if (!zone.layer) zone.layer = createLayer(zone);
            zone.layer.addTo(map);
            zones.slice().sort(function (a, b) {
                return a.order - b.order;
            }).forEach(function (other) {
                if (other.order > zone.order && other.layer && map.hasLayer(other.layer)) {
                    other.layer.bringToFront();
                }
            });
        } else if (!visible && zone.layer && map.hasLayer(zone.layer)) {
            map.removeLayer(zone.layer);
        }
        zone.checkbox.checked = visible;
    }

    zones.forEach(function (zone) {
        var label = document.createElement('label');
        var checkbox = document.createElement('input');
        var swatch = document.createElement('span');
        var name = document.createElement('span');
        label.className = 'layer-item';
        checkbox.type = 'checkbox';
        zone.checkbox = checkbox;
        swatch.className = 'layer-swatch';
        swatch.style.backgroundColor = zone.color;
        swatch.setAttribute('aria-hidden', 'true');
        name.textContent = zone.name;
        checkbox.addEventListener('change', function () {
            setZoneVisible(zone, checkbox.checked);
            layerActionStatus.textContent = '';
            updateToggleAllButton();
        });
        label.appendChild(checkbox);
        label.appendChild(swatch);
        label.appendChild(name);
        list.appendChild(label);
    });

    toggleAllButton.addEventListener('click', function () {
        var enable = !zones.every(function (zone) { return zone.checkbox.checked; });
        var orderedZones = zones.slice().sort(function (a, b) { return a.order - b.order; });
        var index = 0;
        toggleAllButton.disabled = true;
        zones.forEach(function (zone) { zone.checkbox.disabled = true; });

        function finish(message) {
            layerActionStatus.textContent = message;
            zones.forEach(function (zone) { zone.checkbox.disabled = false; });
            toggleAllButton.disabled = false;
            updateToggleAllButton();
        }

        function updateNextZone() {
            if (index === orderedZones.length) {
                finish(enable ? 'Todas las zonas están activadas.' : 'Todas las zonas están desactivadas.');
                return;
            }
            var zone = orderedZones[index];
            layerActionStatus.textContent = (enable ? 'Activando' : 'Desactivando') + ' zonas: ' +
                (index + 1) + ' de ' + orderedZones.length + '.';
            setTimeout(function () {
                try {
                    setZoneVisible(zone, enable);
                } catch (error) {
                    console.error('No se pudo actualizar la zona ' + zone.name, error);
                    zone.checkbox.checked = !!zone.layer && map.hasLayer(zone.layer);
                    finish('No se pudo actualizar la zona ' + zone.name + '. Intentá nuevamente.');
                    return;
                }
                index++;
                updateNextZone();
            }, 0);
        }
        updateNextZone();
    });

    var searchInput = document.getElementById('parcel-search-input');
    var searchZoneFilter = document.getElementById('search-zone-filter');
    var searchResults = document.getElementById('search-results');
    var clearParcelButton = document.getElementById('clear-parcel');
    var searchTimer;
    var selectedParcel;
    zones.forEach(function (zone) {
        var option = document.createElement('option');
        option.value = String(zone.order);
        option.textContent = zone.name;
        searchZoneFilter.appendChild(option);
    });
    map.createPane('search-result');
    map.getPane('search-result').style.zIndex = 450;
    var searchRenderer = L.svg({ pane: 'search-result' });

    function searchMessage(message) {
        var element = document.createElement('p');
        element.className = 'search-message';
        element.textContent = message;
        searchResults.appendChild(element);
    }

    function showParcel(zone, feature) {
        if (selectedParcel) {
            selectedParcel.closePopup();
            map.removeLayer(selectedParcel);
        }
        selectedParcel = L.geoJSON(feature, {
            renderer: searchRenderer,
            style: { color: '#da0c81', weight: 4, fillColor: '#da0c81', fillOpacity: 0.3 }
        }).addTo(map);
        var popupContent;
        selectedParcel.bindPopup(function () {
            if (!popupContent) popupContent = createPopup(feature, zone, selectedParcel);
            return popupContent;
        }, { maxHeight: 400 });
        map.fitBounds(selectedParcel.getBounds(), { maxZoom: 19, padding: [40, 40] });
        selectedParcel.openPopup();
        clearParcelButton.hidden = false;
        searchResults.hidden = true;
    }

    clearParcelButton.addEventListener('click', function () {
        if (selectedParcel) {
            selectedParcel.closePopup();
            map.removeLayer(selectedParcel);
            selectedParcel = null;
        }
        clearParcelButton.hidden = true;
        searchInput.focus();
        searchResults.hidden = true;
    });

    function searchParcels() {
        var query = searchInput.value.trim();
        searchResults.replaceChildren();
        if (!query) {
            searchResults.hidden = true;
            return;
        }
        searchResults.hidden = false;
        if (!/^\d+$/.test(query)) {
            searchMessage('Ingresá solo números, sin puntos ni guiones.');
            return;
        }
        if (query.length < 3) {
            searchMessage('Ingresá al menos 3 números.');
            return;
        }
        var matches = [];
        zones.forEach(function (zone) {
            if (searchZoneFilter.value && searchZoneFilter.value !== String(zone.order)) return;
            zone.data.features.forEach(function (feature) {
                var properties = feature.properties || {};
                var padron = properties.padron == null ? '' : String(properties.padron);
                var nomenclature = properties.nomenc21 == null ? '' : String(properties.nomenc21);
                if (padron.indexOf(query) !== -1 || nomenclature.indexOf(query) !== -1) {
                    matches.push({ zone: zone, feature: feature, padron: padron, nomenclature: nomenclature });
                }
            });
        });
        if (!matches.length) {
            searchMessage('No se encontraron parcelas.');
            return;
        }
        matches.sort(function (a, b) {
            var aExact = a.padron === query || a.nomenclature === query;
            var bExact = b.padron === query || b.nomenclature === query;
            return Number(bExact) - Number(aExact);
        });
        matches.slice(0, 20).forEach(function (match) {
            var button = document.createElement('button');
            var details = document.createElement('span');
            button.type = 'button';
            button.className = 'search-result';
            button.textContent = 'Padrón: ' + (match.padron || 'Sin dato');
            details.textContent = 'Nomenclatura: ' + (match.nomenclature || 'Sin dato') + ' · ' + match.zone.name;
            button.appendChild(details);
            button.addEventListener('click', function () {
                showParcel(match.zone, match.feature);
            });
            searchResults.appendChild(button);
        });
        if (matches.length > 20) searchMessage('Se muestran 20 de ' + matches.length + ' resultados. Ingresá más números para acotar la búsqueda.');
    }

    searchInput.addEventListener('input', function () {
        clearTimeout(searchTimer);
        searchResults.hidden = true;
        searchTimer = setTimeout(searchParcels, 200);
    });
    searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            clearTimeout(searchTimer);
            searchResults.hidden = true;
        }
        if (event.key === 'Enter') {
            event.preventDefault();
            clearTimeout(searchTimer);
            searchParcels();
        }
    });
    searchInput.addEventListener('focus', function () {
        if (searchInput.value.trim()) searchParcels();
    });
    searchZoneFilter.addEventListener('change', function () {
        clearTimeout(searchTimer);
        searchParcels();
    });
    document.addEventListener('click', function (event) {
        if (!event.target.closest('.parcel-search')) {
            clearTimeout(searchTimer);
            searchResults.hidden = true;
        }
    });

    var panel = document.getElementById('layer-panel');
    var toggle = document.getElementById('panel-toggle');
    function setPanelOpen(open) {
        panel.hidden = !open;
        toggle.hidden = open;
        toggle.setAttribute('aria-expanded', String(open));
    }
    document.getElementById('panel-close').addEventListener('click', function () {
        setPanelOpen(false);
        toggle.focus();
    });
    toggle.addEventListener('click', function () {
        setPanelOpen(true);
        document.getElementById('panel-close').focus();
    });
    var compactLayout = window.matchMedia('(max-width: 1024px)');
    function updatePanelForLayout() {
        setPanelOpen(!compactLayout.matches);
    }
    compactLayout.addEventListener('change', updatePanelForLayout);
    updatePanelForLayout();
}());
