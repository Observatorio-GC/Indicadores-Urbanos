
/* POPUPS */
			
			function agregarPopupparcelas(feature, layer) { 
				if (feature.properties && feature.properties.ZONIFIC) { 
						layer.bindPopup("<strong>" +  "Ordenanza 7301/2022: " + "'<a href=https://drive.google.com/file/d/16F_9ytsnJd-A6q7GwV9zN5EsN_7XCLMi/view?usp=sharing + target='_blank'>Acceder</a>'" + "</strong><br /><iframe src='" + feature.properties.ENLACE + "' style='width: 301px; height: 480px; border: 2px solid #888888; margin-top:10px' scrolling='yes'></iframe><br /><a href='" + feature.properties.ENLACE + "' target='_blank'>Abrir en otra pestaña</a>");
				} 
			}

			function agregarPopupComercial(feature, layer) { 
				if (feature.properties && feature.properties.QC_ID) { 
						layer.bindPopup("<strong>" +  "Ordenanza 7301/2022: " + "'<a href=https://drive.google.com/file/d/16F_9ytsnJd-A6q7GwV9zN5EsN_7XCLMi/view?usp=sharing + target='_blank'>Acceder</a>'"+ "</strong><br /><iframe src='" + feature.properties.ENLACE + "' style='width: 301px; height: 480px; border: 2px solid #888888; margin-top:10px' scrolling='yes'></iframe><br /><a href='" + feature.properties.ENLACE + "' target='_blank'>Abrir en otra pestaña</a>");
				} 
			}

			function agregarPopupZonanificacion(feature, layer) {
				if (feature.properties && feature.properties.QC_ID) {
					if (feature.properties.ENLACE) {
					layer.bindPopup("<strong>" +  "Ordenanza 7301/2022: " + "'<a href=https://drive.google.com/file/d/16F_9ytsnJd-A6q7GwV9zN5EsN_7XCLMi/view?usp=sharing + target='_blank'>Acceder</a>'"+ "</strong><br /><iframe src='" + feature.properties.ENLACE + "' style='width: 301px; height: 515px; border: 2px solid #888888; margin-top:10px' scrolling='no'></iframe><br /><a href='" + feature.properties.ENLACE + "' target='_blank'>Abrir en otra pestaña</a>");
					} else {
					layer.bindPopup("<strong>" + feature.properties.QC_ID + "</strong>");
					}
				}
			}
			
			