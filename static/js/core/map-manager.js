/**
 * Map Manager - Gerenciador do Mapa Interativo
 * Sistema Cidades Frias, Corações Quentes
 */

class MapManager {
    constructor() {
        this.map = null;
        this.markers = [];
        this.currentProfile = window.userProfile || 'gestor';
        this.initialized = false;
    }

    /**
     * Inicializa o mapa Leaflet
     */
    initMap(centerLat = -23.5505, centerLng = -46.6333, zoom = 11) {
        if (this.initialized) return;

        this.map = L.map('map').setView([centerLat, centerLng], zoom);
        
        // Adiciona tiles do OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.map);
        
        this.initialized = true;
        console.log('Mapa inicializado com sucesso');
    }

    /**
     * Adiciona marcadores ao mapa baseado no perfil do usuário
     */
    addZonesToMap(zonesData) {
        if (!this.map) {
            console.error('Mapa não inicializado');
            return;
        }

        // Remove marcadores existentes
        this.clearMarkers();

        zonesData.forEach(zone => {
            const marker = this.createZoneMarker(zone);
            this.markers.push(marker);
        });

        console.log(`${this.markers.length} zonas adicionadas ao mapa`);
    }

    /**
     * Cria um marcador para uma zona específica
     */
    createZoneMarker(zone) {
        const marker = L.circleMarker([zone.latitude, zone.longitude], {
            radius: this.getMarkerSize(zone),
            fillColor: zone.cor,
            color: 'white',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.8,
            className: 'zone-marker'
        }).addTo(this.map);

        // Adiciona popup baseado no perfil
        const popupContent = this.createPopupContent(zone);
        marker.bindPopup(popupContent);

        // Adiciona eventos de clique
        marker.on('click', () => {
            this.onZoneClick(zone);
        });

        // Efeitos hover
        marker.on('mouseover', () => {
            marker.setStyle({
                radius: this.getMarkerSize(zone) + 3,
                weight: 4
            });
        });

        marker.on('mouseout', () => {
            marker.setStyle({
                radius: this.getMarkerSize(zone),
                weight: 3
            });
        });

        return marker;
    }

    /**
     * Determina o tamanho do marcador baseado na criticidade
     */
    getMarkerSize(zone) {
        switch (zone.classificacao) {
            case 'Crítica': return 15;
            case 'Média': return 12;
            case 'Segura': return 10;
            default: return 12;
        }
    }

    /**
     * Cria conteúdo do popup baseado no perfil do usuário
     */
    createPopupContent(zone) {
        if (this.currentProfile === 'gestor') {
            return this.createGestorPopup(zone);
        } else {
            return this.createCivilPopup(zone);
        }
    }

    /**
     * Popup detalhado para gestores
     */
    createGestorPopup(zone) {
        return `
            <div class="popup-content gestor-popup">
                <div class="popup-title">
                    <i class="fas fa-map-marker-alt"></i>
                    ${zone.nome}
                </div>
                <div class="popup-data">
                    <div class="data-row">
                        <strong>Região:</strong> ${zone.regiao}
                    </div>
                    <div class="data-row">
                        <strong>Temperatura:</strong> ${zone.temperatura}°C
                    </div>
                    <div class="data-row">
                        <strong>NDVI:</strong> ${zone.ndvi.toFixed(2)}
                    </div>
                    <div class="data-row">
                        <strong>Densidade:</strong> ${zone.densidade_populacional.toLocaleString()} hab/km²
                    </div>
                    <div class="data-row">
                        <strong>Índice:</strong> ${zone.indice_criticidade.toFixed(1)}
                    </div>
                    <div class="data-row">
                        <strong>Status:</strong> 
                        <span class="status-badge ${zone.classificacao.toLowerCase()}">${zone.classificacao}</span>
                    </div>
                </div>
                <div class="popup-action">
                    <small>Clique para ver detalhes completos e relatório</small>
                </div>
            </div>
        `;
    }

    /**
     * Popup simplificado para civis
     */
    createCivilPopup(zone) {
        const needsHelp = zone.classificacao !== 'Segura';
        const helpIcon = needsHelp ? '🌳' : '✅';
        const helpText = needsHelp ? 'Precisa de Ajuda' : 'Bem Cuidada';

        return `
            <div class="popup-content civil-popup">
                <div class="popup-title">
                    ${helpIcon} ${zone.nome}
                </div>
                <div class="popup-data">
                    <div class="data-row">
                        <strong>Região:</strong> ${zone.regiao}
                    </div>
                    <div class="data-row">
                        <strong>Status:</strong> 
                        <span class="status-badge ${zone.classificacao.toLowerCase()}">${helpText}</span>
                    </div>
                </div>
                <div class="popup-action">
                    <small>Clique para ver como você pode ajudar</small>
                </div>
            </div>
        `;
    }

    /**
     * Manipula clique em uma zona
     */
    onZoneClick(zone) {
        if (this.currentProfile === 'gestor') {
            this.showGestorModal(zone);
        } else {
            this.showCivilModal(zone);
        }
    }

    /**
     * Mostra modal detalhado para gestores
     */
    showGestorModal(zone) {
        // Implementação será feita no arquivo gestor.js
        if (window.GestorManager) {
            window.GestorManager.showZoneDetails(zone);
        }
    }

    /**
     * Mostra modal simplificado para civis
     */
    showCivilModal(zone) {
        // Implementação será feita no arquivo civil.js
        if (window.CivilManager) {
            window.CivilManager.showZoneDetails(zone);
        }
    }

    /**
     * Remove todos os marcadores do mapa
     */
    clearMarkers() {
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers = [];
    }

    /**
     * Filtra marcadores por classificação
     */
    filterMarkers(classification) {
        this.markers.forEach(marker => {
            const zone = marker.zone;
            if (!classification || zone.classificacao === classification) {
                marker.setOpacity(1);
                marker.setFillOpacity(0.8);
            } else {
                marker.setOpacity(0.3);
                marker.setFillOpacity(0.2);
            }
        });
    }

    /**
     * Atualiza perfil do usuário
     */
    setProfile(profile) {
        this.currentProfile = profile;
        // Recarrega marcadores com novo perfil
        if (this.markers.length > 0) {
            this.refreshMarkers();
        }
    }

    /**
     * Atualiza marcadores com novo perfil
     */
    refreshMarkers() {
        this.markers.forEach(marker => {
            const zone = marker.zone;
            const popupContent = this.createPopupContent(zone);
            marker.setPopupContent(popupContent);
        });
    }

    /**
     * Destroi o mapa
     */
    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        this.markers = [];
        this.initialized = false;
    }
}

// Instância global do MapManager
window.MapManager = new MapManager();

