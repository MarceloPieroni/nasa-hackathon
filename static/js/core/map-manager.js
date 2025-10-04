/**
 * Map Manager - Gerenciador do Mapa
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
        console.log('🗺️ Mapa inicializado com sucesso');
    }

    /**
     * Adiciona marcadores ao mapa baseado no perfil do usuário
     */
    addZonesToMap(zonesData) {
        if (!this.map) {
            this.initMap();
        }

        // Limpa marcadores existentes
        this.clearMarkers();

        zonesData.forEach(zone => {
            const marker = this.createMarker(zone);
            this.markers.push(marker);
        });

        console.log(`📍 ${this.markers.length} marcadores adicionados ao mapa`);
    }

    /**
     * Cria um marcador para uma zona
     */
    createMarker(zone) {
        const marker = L.circleMarker([zone.latitude, zone.longitude], {
            color: zone.cor,
            fillColor: zone.cor,
            fillOpacity: 0.7,
            radius: 8,
            weight: 2
        });

        // Adiciona popup baseado no perfil
        const popupContent = this.createPopupContent(zone);
        marker.bindPopup(popupContent);

        // Adiciona evento de clique
        marker.on('click', () => {
            this.onZoneClick(zone);
        });

        marker.addTo(this.map);
        return marker;
    }

    /**
     * Cria conteúdo do popup baseado no perfil
     */
    createPopupContent(zone) {
        if (this.currentProfile === 'civil') {
            return this.createCivilPopup(zone);
        } else {
            return this.createGestorPopup(zone);
        }
    }

    /**
     * Cria popup para perfil civil
     */
    createCivilPopup(zone) {
        return `
            <div class="civil-popup">
                <h6 class="popup-title">${zone.nome}</h6>
                <p><strong>Região:</strong> ${zone.regiao || 'São Paulo'}</p>
                <p><strong>Temperatura:</strong> ${zone.temperatura.toFixed(1)}°C</p>
                <p><strong>Status:</strong> 
                    <span class="badge ${zone.classificacao.toLowerCase()}">${zone.classificacao}</span>
                </p>
                ${zone.classificacao === 'Crítica' ? 
                    '<div class="alert alert-danger mt-2 mb-0"><small>Esta zona precisa de ajuda!</small></div>' : 
                    ''
                }
            </div>
        `;
    }

    /**
     * Cria popup para perfil gestor
     */
    createGestorPopup(zone) {
        return `
            <div class="gestor-popup">
                <h6 class="popup-title">${zone.nome}</h6>
                <p><strong>Região:</strong> ${zone.regiao || 'São Paulo'}</p>
                <p><strong>Temperatura:</strong> ${zone.temperatura.toFixed(1)}°C</p>
                <p><strong>NDVI:</strong> ${zone.ndvi.toFixed(2)}</p>
                <p><strong>Densidade:</strong> ${zone.densidade_populacional.toLocaleString()} hab/km²</p>
                <p><strong>Criticidade:</strong> ${zone.indice_criticidade.toFixed(1)}</p>
                <p><strong>Classificação:</strong> 
                    <span class="badge ${zone.classificacao.toLowerCase()}">${zone.classificacao}</span>
                </p>
            </div>
        `;
    }

    /**
     * Manipula clique em uma zona
     */
    onZoneClick(zone) {
        console.log('📍 Zona clicada:', zone.nome);
        
        if (this.currentProfile === 'civil') {
            this.showCivilModal(zone);
        } else {
            this.showZoneDetails(zone);
        }
    }

    /**
     * Mostra modal para perfil civil
     */
    showCivilModal(zone) {
        if (window.CivilManager) {
            window.CivilManager.showCivilModal(zone);
        }
    }

    /**
     * Mostra detalhes da zona para perfil gestor
     */
    showZoneDetails(zone) {
        const detailsCard = document.getElementById('zone-details-card');
        const detailsContent = document.getElementById('zone-details-content');
        
        if (detailsCard && detailsContent) {
            detailsContent.innerHTML = `
                <h6>${zone.nome}</h6>
                <p><strong>Região:</strong> ${zone.regiao || 'São Paulo'}</p>
                <p><strong>Temperatura:</strong> ${zone.temperatura.toFixed(1)}°C</p>
                <p><strong>NDVI:</strong> ${zone.ndvi.toFixed(2)}</p>
                <p><strong>Densidade:</strong> ${zone.densidade_populacional.toLocaleString()} hab/km²</p>
                <p><strong>Criticidade:</strong> ${zone.indice_criticidade.toFixed(1)}</p>
                <p><strong>Classificação:</strong> 
                    <span class="badge ${zone.classificacao.toLowerCase()}">${zone.classificacao}</span>
                </p>
            `;
            detailsCard.style.display = 'block';
        }
    }

    /**
     * Limpa todos os marcadores
     */
    clearMarkers() {
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers = [];
    }

    /**
     * Define o perfil atual
     */
    setProfile(profile) {
        this.currentProfile = profile;
    }
}

// Instância global do MapManager
window.MapManager = new MapManager();