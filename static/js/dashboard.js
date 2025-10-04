/**
 * Dashboard JavaScript - Sistema Clima Vida
 * Gerenciador de gráficos e visualizações interativas
 */

class DashboardManager {
    constructor() {
        this.zonesData = [];
        this.statistics = {};
        this.charts = {};
        this.initialized = false;
        this.currentCity = 'sao_paulo';
        
        // Configurações de cores
        this.colors = {
            critical: '#FF4444',
            medium: '#FFA500',
            safe: '#44FF44',
            primary: '#2E86AB',
            secondary: '#A23B72',
            success: '#28a745',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        
        // Configurações dos gráficos
        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: 'rgba(255,255,255,0.2)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.parsed || context.formattedValue}`;
                        }
                    }
                }
            }
        };
    }

    /**
     * Inicializa o dashboard
     */
    async init() {
        try {
            console.log('🚀 Inicializando Dashboard...');
            
            // Mostra loading
            this.showLoading();
            
            // Carrega dados
            await this.loadData();
            
            // Calcula estatísticas
            this.calculateStatistics();
            
            // Atualiza cards
            this.updateStatsCards();
            
            // Cria gráficos
            this.createCharts();
            
            // Preenche tabela
            this.populateTable();
            
            // Configura seletores
            this.setupSelectors();
            
            // Configura seletor de cidade
            this.setupCitySelector();
            
            // Esconde loading e mostra conteúdo
            this.hideLoading();
            this.showContent();
            
            this.initialized = true;
            console.log('✅ Dashboard inicializado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar dashboard:', error);
            this.showError('Erro ao carregar dados do dashboard');
        }
    }

    /**
     * Carrega dados da API
     */
    async loadData(city = null) {
        try {
            const cityParam = city || this.currentCity;
            const response = await fetch(`/api/zones?city=${cityParam}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.zonesData = await response.json();
            
            if (!Array.isArray(this.zonesData)) {
                throw new Error('Dados recebidos não são um array válido');
            }
            
            console.log(`📊 ${this.zonesData.length} zonas carregadas para ${cityParam}`);
            
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            throw error;
        }
    }

    /**
     * Calcula estatísticas dos dados
     */
    calculateStatistics() {
        if (!this.zonesData || this.zonesData.length === 0) {
            this.statistics = this.getEmptyStatistics();
            return;
        }

        const critical = this.zonesData.filter(z => z.classificacao === 'Crítica').length;
        const medium = this.zonesData.filter(z => z.classificacao === 'Média').length;
        const safe = this.zonesData.filter(z => z.classificacao === 'Segura').length;
        
        const avgTemp = this.zonesData.reduce((sum, z) => sum + z.temperatura, 0) / this.zonesData.length;
        const avgNDVI = this.zonesData.reduce((sum, z) => sum + z.ndvi, 0) / this.zonesData.length;

        this.statistics = {
            total_zones: this.zonesData.length,
            critical_zones: critical,
            medium_zones: medium,
            safe_zones: safe,
            avg_temperature: Math.round(avgTemp * 10) / 10,
            avg_ndvi: Math.round(avgNDVI * 100) / 100
        };
    }

    /**
     * Atualiza cards de estatísticas
     */
    updateStatsCards() {
        document.getElementById('total-zones').textContent = this.statistics.total_zones;
        document.getElementById('critical-zones').textContent = this.statistics.critical_zones;
        document.getElementById('avg-temperature').textContent = `${this.statistics.avg_temperature}°C`;
        document.getElementById('avg-ndvi').textContent = this.statistics.avg_ndvi;
    }

    /**
     * Cria todos os gráficos
     */
    createCharts() {
        this.createCriticityChart();
        this.createTemperatureChart();
        this.createNDVIChart();
        this.createRadarChart();
    }

    /**
     * Cria gráfico de pizza para criticidade
     */
    createCriticityChart() {
        const ctx = document.getElementById('criticityChart').getContext('2d');
        
        const data = {
            labels: ['Crítica', 'Média', 'Segura'],
            datasets: [{
                data: [
                    this.statistics.critical_zones,
                    this.statistics.medium_zones,
                    this.statistics.safe_zones
                ],
                backgroundColor: [
                    this.colors.critical,
                    this.colors.medium,
                    this.colors.safe
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        };

        this.charts.criticity = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                ...this.chartOptions,
                cutout: '60%',
                plugins: {
                    ...this.chartOptions.plugins,
                    legend: {
                        ...this.chartOptions.plugins.legend,
                        position: 'bottom'
                    }
                }
            }
        });
    }

    /**
     * Cria gráfico de barras para temperatura
     */
    createTemperatureChart() {
        const ctx = document.getElementById('temperatureChart').getContext('2d');
        
        // Ordena zonas por temperatura (maior primeiro)
        const sortedZones = [...this.zonesData]
            .sort((a, b) => b.temperatura - a.temperatura)
            .slice(0, 10); // Top 10 zonas mais quentes

        const data = {
            labels: sortedZones.map(z => z.nome),
            datasets: [{
                label: 'Temperatura (°C)',
                data: sortedZones.map(z => z.temperatura),
                backgroundColor: sortedZones.map(z => {
                    if (z.classificacao === 'Crítica') return this.colors.critical;
                    if (z.classificacao === 'Média') return this.colors.medium;
                    return this.colors.safe;
                }),
                borderColor: sortedZones.map(z => {
                    if (z.classificacao === 'Crítica') return '#CC0000';
                    if (z.classificacao === 'Média') return '#CC6600';
                    return '#00CC00';
                }),
                borderWidth: 1,
                borderRadius: 4
            }]
        };

        this.charts.temperature = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                ...this.chartOptions,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: Math.min(...sortedZones.map(z => z.temperatura)) - 2,
                        title: {
                            display: true,
                            text: 'Temperatura (°C)'
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    }

    /**
     * Cria gráfico de barras horizontais para NDVI
     */
    createNDVIChart() {
        const ctx = document.getElementById('ndviChart').getContext('2d');
        
        // Ordena zonas por NDVI (menor primeiro - mais críticas)
        const sortedZones = [...this.zonesData]
            .sort((a, b) => a.ndvi - b.ndvi)
            .slice(0, 10); // Top 10 zonas com menor NDVI

        const data = {
            labels: sortedZones.map(z => z.nome),
            datasets: [{
                label: 'NDVI',
                data: sortedZones.map(z => z.ndvi),
                backgroundColor: sortedZones.map(z => {
                    if (z.classificacao === 'Crítica') return this.colors.critical;
                    if (z.classificacao === 'Média') return this.colors.medium;
                    return this.colors.safe;
                }),
                borderColor: sortedZones.map(z => {
                    if (z.classificacao === 'Crítica') return '#CC0000';
                    if (z.classificacao === 'Média') return '#CC6600';
                    return '#00CC00';
                }),
                borderWidth: 1,
                borderRadius: 4
            }]
        };

        this.charts.ndvi = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                ...this.chartOptions,
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 1,
                        title: {
                            display: true,
                            text: 'NDVI'
                        }
                    },
                    y: {
                        ticks: {
                            maxRotation: 0
                        }
                    }
                }
            }
        });
    }

    /**
     * Cria gráfico radar para comparação
     */
    createRadarChart() {
        const ctx = document.getElementById('radarChart').getContext('2d');
        
        // Dados iniciais vazios
        const data = {
            labels: ['Temperatura', 'NDVI', 'Densidade Pop.', 'Criticidade'],
            datasets: []
        };

        this.charts.radar = new Chart(ctx, {
            type: 'radar',
            data: data,
            options: {
                ...this.chartOptions,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 1,
                        ticks: {
                            stepSize: 0.2
                        }
                    }
                }
            }
        });
    }

    /**
     * Preenche tabela com dados
     */
    populateTable() {
        const tbody = document.querySelector('#zonesTable tbody');
        tbody.innerHTML = '';

        // Ordena por criticidade (críticas primeiro)
        const sortedZones = [...this.zonesData].sort((a, b) => {
            const order = { 'Crítica': 0, 'Média': 1, 'Segura': 2 };
            return order[a.classificacao] - order[b.classificacao];
        });

        sortedZones.forEach(zone => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${zone.nome}</strong></td>
                <td>${zone.regiao || 'São Paulo'}</td>
                <td>${zone.temperatura.toFixed(1)}°C</td>
                <td>${zone.ndvi.toFixed(2)}</td>
                <td>${zone.densidade_populacional.toLocaleString()}</td>
                <td>${zone.indice_criticidade.toFixed(1)}</td>
                <td>
                    <span class="status-badge ${zone.classificacao.toLowerCase()}">
                        ${zone.classificacao}
                    </span>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    /**
     * Configura seletores para comparação
     */
    setupSelectors() {
        const selector = document.getElementById('zoneSelector');
        
        // Limpa opções existentes
        selector.innerHTML = '';
        
        // Adiciona opções
        this.zonesData.forEach(zone => {
            const option = document.createElement('option');
            option.value = zone.id;
            option.textContent = `${zone.nome} (${zone.classificacao})`;
            selector.appendChild(option);
        });

        // Event listener para mudanças
        selector.addEventListener('change', () => {
            this.updateRadarChart();
        });
    }

    /**
     * Configura seletor de cidade
     */
    setupCitySelector() {
        const citySelector = document.getElementById('citySelect');
        
        if (!citySelector) return;
        
        // Event listener para mudança de cidade
        citySelector.addEventListener('change', async (event) => {
            const newCity = event.target.value;
            if (newCity !== this.currentCity) {
                await this.changeCity(newCity);
            }
        });
    }

    /**
     * Muda a cidade atual
     */
    async changeCity(newCity) {
        try {
            console.log(`🔄 Mudando para cidade: ${newCity}`);
            
            // Mostra loading
            this.showLoading();
            
            // Atualiza cidade atual
            this.currentCity = newCity;
            
            // Carrega novos dados
            await this.loadData(newCity);
            
            // Recalcula estatísticas
            this.calculateStatistics();
            
            // Atualiza interface
            this.updateStatsCards();
            this.updateCharts();
            this.populateTable();
            this.setupSelectors();
            
            // Esconde loading
            this.hideLoading();
            
            console.log(`✅ Cidade alterada para: ${newCity}`);
            
        } catch (error) {
            console.error('Erro ao mudar cidade:', error);
            this.showError('Erro ao carregar dados da cidade selecionada');
        }
    }

    /**
     * Atualiza todos os gráficos
     */
    updateCharts() {
        // Destroi gráficos existentes
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.destroy) {
                chart.destroy();
            }
        });
        
        // Recria gráficos
        this.createCharts();
    }

    /**
     * Atualiza gráfico radar baseado na seleção
     */
    updateRadarChart() {
        const selector = document.getElementById('zoneSelector');
        const selectedIds = Array.from(selector.selectedOptions).map(opt => parseInt(opt.value));
        
        if (selectedIds.length === 0) {
            this.charts.radar.data.datasets = [];
            this.charts.radar.update();
            return;
        }

        // Limita a 3 zonas
        if (selectedIds.length > 3) {
            this.showWarning('Máximo de 3 zonas podem ser comparadas simultaneamente');
            // Remove a última seleção
            const lastOption = selector.selectedOptions[selector.selectedOptions.length - 1];
            lastOption.selected = false;
            return;
        }

        const datasets = selectedIds.map((id, index) => {
            const zone = this.zonesData.find(z => z.id === id);
            if (!zone) return null;

            // Normaliza os dados para o radar (0-1)
            const maxTemp = Math.max(...this.zonesData.map(z => z.temperatura));
            const maxDensity = Math.max(...this.zonesData.map(z => z.densidade_populacional));
            const maxCriticity = Math.max(...this.zonesData.map(z => z.indice_criticidade));

            return {
                label: zone.nome,
                data: [
                    zone.temperatura / maxTemp,
                    zone.ndvi, // NDVI já está entre 0-1
                    zone.densidade_populacional / maxDensity,
                    zone.indice_criticidade / maxCriticity
                ],
                backgroundColor: this.getZoneColor(zone.classificacao, 0.2),
                borderColor: this.getZoneColor(zone.classificacao, 1),
                borderWidth: 2,
                pointBackgroundColor: this.getZoneColor(zone.classificacao, 1),
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            };
        }).filter(Boolean);

        this.charts.radar.data.datasets = datasets;
        this.charts.radar.update();
    }

    /**
     * Retorna cor baseada na classificação
     */
    getZoneColor(classification, alpha = 1) {
        const colors = {
            'Crítica': `rgba(255, 68, 68, ${alpha})`,
            'Média': `rgba(255, 165, 0, ${alpha})`,
            'Segura': `rgba(68, 255, 68, ${alpha})`
        };
        return colors[classification] || `rgba(128, 128, 128, ${alpha})`;
    }

    /**
     * Mostra loading
     */
    showLoading() {
        document.getElementById('loading-spinner').style.display = 'flex';
        document.getElementById('main-content').style.display = 'none';
    }

    /**
     * Esconde loading
     */
    hideLoading() {
        document.getElementById('loading-spinner').style.display = 'none';
    }

    /**
     * Mostra conteúdo
     */
    showContent() {
        document.getElementById('main-content').style.display = 'block';
    }

    /**
     * Mostra erro
     */
    showError(message) {
        if (window.UIManager) {
            window.UIManager.showError(message);
        } else {
            alert(`Erro: ${message}`);
        }
    }

    /**
     * Mostra aviso
     */
    showWarning(message) {
        if (window.UIManager) {
            window.UIManager.showWarning(message);
        } else {
            alert(`Aviso: ${message}`);
        }
    }

    /**
     * Retorna estatísticas vazias
     */
    getEmptyStatistics() {
        return {
            total_zones: 0,
            critical_zones: 0,
            medium_zones: 0,
            safe_zones: 0,
            avg_temperature: 0,
            avg_ndvi: 0
        };
    }

    /**
     * Redimensiona gráficos
     */
    resizeCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.resize) {
                chart.resize();
            }
        });
    }
}

// Instância global do DashboardManager
window.DashboardManager = new DashboardManager();

// Inicializa quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    window.DashboardManager.init();
});

// Redimensiona gráficos quando a janela muda de tamanho
window.addEventListener('resize', () => {
    if (window.DashboardManager.initialized) {
        setTimeout(() => {
            window.DashboardManager.resizeCharts();
        }, 100);
    }
});
