
/* POPUPS */
			
			function agregarPopupparcelas(feature, layer) { 
				if (feature.properties && feature.properties.ZONIFIC) { 
						layer.bindPopup( "</strong><br /><iframe src='" + feature.properties.ENLACE + "' style='width: 301px; height: 480px; border: 2px solid #888888; margin-top:10px' scrolling='yes'></iframe><br /><a href='" + feature.properties.ENLACE + "' target='_blank'>Abrir en otra pestaña</a>");
				} 
			}

			function agregarPopupComercial(feature, layer) { 
				if (feature.properties && feature.properties.QC_ID) { 
						layer.bindPopup( "</strong><br /><iframe src='" + feature.properties.ENLACE + "' style='width: 301px; height: 480px; border: 2px solid #888888; margin-top:10px' scrolling='yes'></iframe><br /><a href='" + feature.properties.ENLACE + "' target='_blank'>Abrir en otra pestaña</a>");
				} 
			}
			