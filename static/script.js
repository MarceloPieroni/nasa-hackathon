// Heat Island Detection System - Frontend JavaScript

let map;
let markers = [];
let zonesData = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    loadZonesData();
});

function initializeMap() {
    // Initialize map centered on Rio de Janeiro
    map = L.map('map').setView([-22.9068, -43.1729], 11);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);
    
    // Hide loading overlay
    document.getElementById('loading').style.display = 'none';
}

async function loadZonesData() {
    try {
        const response = await fetch('/api/zones');
        zonesData = await response.json();
        
        addMarkersToMap();
        updateStatistics();
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showError('Erro ao carregar dados das zonas');
    }
}

function addMarkersToMap() {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    zonesData.forEach(zone => {
        // Create custom marker with zone data
        const marker = L.circleMarker([zone.latitude, zone.longitude], {
            radius: 12,
            fillColor: zone.cor,
            color: 'white',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.8,
            className: 'custom-marker'
        }).addTo(map);
        
        // Add popup with zone information
        const popupContent = createPopupContent(zone);
        marker.bindPopup(popupContent);
        
        // Add click event for detailed view
        marker.on('click', function() {
            showZoneDetails(zone.id);
        });
        
        // Add hover effect
        marker.on('mouseover', function() {
            this.setStyle({
                radius: 15,
                weight: 4
            });
        });
        
        marker.on('mouseout', function() {
            this.setStyle({
                radius: 12,
                weight: 3
            });
        });
        
        markers.push(marker);
    });
}

function createPopupContent(zone) {
    return `
        <div class="popup-content">
            <div class="popup-title">${zone.nome}</div>
            <div class="popup-data">
                <strong>Temperatura:</strong> ${zone.temperatura}°C<br>
                <strong>NDVI:</strong> ${zone.ndvi}<br>
                <strong>Densidade:</strong> ${zone.densidade_populacional} hab/km²<br>
                <strong>Índice:</strong> ${zone.indice_criticidade}<br>
                <strong>Status:</strong> <span style="color: ${zone.cor}; font-weight: bold;">${zone.classificacao}</span>
            </div>
            <div class="popup-action">
                <h6>Clique para mais detalhes</h6>
                <small>Ver ações recomendadas e custos estimados</small>
            </div>
        </div>
    `;
}

async function showZoneDetails(zoneId) {
    try {
        const response = await fetch(`/api/zone/${zoneId}`);
        const zoneData = await response.json();
        
        if (zoneData.error) {
            showError(zoneData.error);
            return;
        }
        
        displayZoneModal(zoneData);
        
    } catch (error) {
        console.error('Erro ao carregar detalhes da zona:', error);
        showError('Erro ao carregar detalhes da zona');
    }
}

function displayZoneModal(zoneData) {
    const modalTitle = document.getElementById('zoneModalTitle');
    const modalBody = document.getElementById('zoneModalBody');
    
    modalTitle.textContent = zoneData.nome;
    
    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6>Dados Técnicos</h6>
                <div class="zone-detail-item">
                    <span class="zone-detail-label">Temperatura:</span>
                    <span class="zone-detail-value">${zoneData.temperatura}°C</span>
                </div>
                <div class="zone-detail-item">
                    <span class="zone-detail-label">NDVI:</span>
                    <span class="zone-detail-value">${zoneData.ndvi}</span>
                </div>
                <div class="zone-detail-item">
                    <span class="zone-detail-label">Densidade Populacional:</span>
                    <span class="zone-detail-value">${zoneData.densidade_populacional} hab/km²</span>
                </div>
                <div class="zone-detail-item">
                    <span class="zone-detail-label">Índice de Criticidade:</span>
                    <span class="zone-detail-value">${zoneData.indice_criticidade}</span>
                </div>
                <div class="zone-detail-item">
                    <span class="zone-detail-label">Classificação:</span>
                    <span class="zone-detail-value" style="color: ${getColorForClassification(zoneData.classificacao)}; font-weight: bold;">${zoneData.classificacao}</span>
                </div>
            </div>
            <div class="col-md-6">
                <h6>Análise e Recomendações</h6>
                <div class="action-card">
                    <h6><i class="fas fa-exclamation-triangle"></i> Ação Recomendada</h6>
                    <p>${zoneData.acao_sugerida}</p>
                </div>
                <div class="mt-3">
                    <strong>Custo Estimado:</strong><br>
                    <span class="text-success">${zoneData.custo_estimado}</span>
                </div>
                <div class="mt-3">
                    <strong>Espécies Recomendadas:</strong><br>
                    <small class="text-muted">${zoneData.especies_recomendadas}</small>
                </div>
            </div>
        </div>
        <div class="mt-4">
            <h6>Interpretação dos Dados</h6>
            <div class="alert alert-info">
                <small>
                    <strong>NDVI (Normalized Difference Vegetation Index):</strong> Mede a densidade de vegetação. 
                    Valores próximos a 1 indicam vegetação densa, valores próximos a 0 indicam áreas urbanizadas.<br><br>
                    <strong>Índice de Criticidade:</strong> Calculado como Temperatura - (NDVI × 10). 
                    Valores altos indicam maior risco de ilha de calor.
                </small>
            </div>
        </div>
    `;
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('zoneModal'));
    modal.show();
}

function getColorForClassification(classification) {
    const colors = {
        'Crítica': '#FF4444',
        'Média': '#FFA500',
        'Segura': '#44FF44'
    };
    return colors[classification] || '#666';
}

function updateStatistics() {
    const statsContainer = document.getElementById('statistics');
    
    const critical = zonesData.filter(z => z.classificacao === 'Crítica').length;
    const medium = zonesData.filter(z => z.classificacao === 'Média').length;
    const safe = zonesData.filter(z => z.classificacao === 'Segura').length;
    const total = zonesData.length;
    
    const avgTemp = zonesData.reduce((sum, z) => sum + z.temperatura, 0) / total;
    const avgNDVI = zonesData.reduce((sum, z) => sum + z.ndvi, 0) / total;
    
    statsContainer.innerHTML = `
        <div class="stat-item">
            <span class="stat-label">Total de Zonas:</span>
            <span class="stat-value">${total}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Críticas:</span>
            <span class="stat-value" style="color: #FF4444;">${critical}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Médias:</span>
            <span class="stat-value" style="color: #FFA500;">${medium}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Seguras:</span>
            <span class="stat-value" style="color: #44FF44;">${safe}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Temp. Média:</span>
            <span class="stat-value">${avgTemp.toFixed(1)}°C</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">NDVI Médio:</span>
            <span class="stat-value">${avgNDVI.toFixed(2)}</span>
        </div>
    `;
}

async function generateReport() {
    try {
        // Show loading state
        const button = event.target;
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando...';
        button.disabled = true;
        
        // Download the PDF
        const response = await fetch('/api/report');
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'relatorio_ilhas_calor.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Reset button
        button.innerHTML = originalText;
        button.disabled = false;
        
        showSuccess('Relatório gerado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        showError('Erro ao gerar relatório PDF');
        
        // Reset button
        const button = event.target;
        button.innerHTML = '<i class="fas fa-file-pdf"></i> Gerar Relatório PDF';
        button.disabled = false;
    }
}

function showError(message) {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = 'alert alert-danger position-fixed';
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle"></i> ${message}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function showSuccess(message) {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = 'alert alert-success position-fixed';
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i> ${message}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Utility function to format numbers
function formatNumber(num, decimals = 2) {
    return parseFloat(num).toFixed(decimals);
}

// Export functions for potential external use
window.HeatIslandApp = {
    showZoneDetails,
    generateReport,
    loadZonesData
};
