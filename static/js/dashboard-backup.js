/**
 * Dashboard JavaScript Otimizado - Sistema Clima Vida
 * Versão otimizada para melhor performance
 */

class DashboardManager {
    constructor() {
        this.zonesData = [];
        this.statistics = {};
        this.charts = {};
        this.initialized = false;
        this.currentCity = 'sao_paulo';
        this.loadingTimeout = null;
        
        // Configurações de cores
        this.colors = {
            critical: '#FF4444',
            medium: '#FFA500',
            safe: '#44FF44',
            primary: '#2E86AB',
            secondary: '#A23B72'
        };
        
        // Configurações otimizadas dos gráficos
        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 800,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: {
                            size: 11,
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
                    cornerRadius: 6,
                    displayColors: true
                }
            }
        };
    }

    /**
     * Inicializa o dashboard com loading otimizado
     */
    async init() {
        try {
            console.log('🚀 Inicializando Dashboard Otimizado...');
            
            // Mostra loading com timeout
            this.showLoading();
            this.loadingTimeout = setTimeout(() => {
                this.showError('Carregamento demorado. Verifique sua conexão.');
            }, 10000); // 10 segundos timeout
            
            // Carrega dados
            await this.loadData();
            
            // Calcula estatísticas
            this.calculateStatistics();
            
            // Atualiza interface em paralelo
            await Promise.all([
                this.updateStatsCards(),
                this.createCharts(),
                this.populateTable()
            ]);
            
            // Configura seletores
            this.setupSelectors();
            this.setupCitySelector();
            
            // Esconde loading
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
     * Carrega dados da API com timeout
     */
    async loadData(city = null) {
        try {
            const cityParam = city || this.currentCity;
            console.log(`📊 Carregando dados para: ${cityParam}`);
            
            // Timeout de 5 segundos para a requisição
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(`/api/zones?city=${cityParam}`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.zonesData = await response.json();
            
            if (!Array.isArray(this.zonesData)) {
                throw new Error('Dados recebidos não são um array válido');
            }
            
            console.log(`✅ ${this.zonesData.length} zonas carregadas para ${cityParam}`);
            
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Timeout: Carregamento demorou mais que 5 segundos');
            }
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
     * Atualiza cards de estatísticas com animação
     */
    async updateStatsCards() {
        const elements = {
            'total-zones': this.statistics.total_zones,
            'critical-zones': this.statistics.critical_zones,
            'avg-temperature': `${this.statistics.avg_temperature}°C`,
            'avg-ndvi': this.statistics.avg_ndvi
        };

        for (const [id, value] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) {
                this.animateNumber(element, value);
            }
        }
    }

    /**
     * Anima números nos cards
     */
    animateNumber(element, targetValue) {
        const startValue = 0;
        const duration = 1000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = startValue + (targetValue - startValue) * progress;
            element.textContent = typeof targetValue === 'string' ? targetValue : Math.round(currentValue);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Cria gráficos otimizados
     */
    async createCharts() {
        // Cria gráficos em paralelo para melhor performance
        await Promise.all([
            this.createCriticityChart(),
            this.createTemperatureChart(),
            this.createNDVIChart(),
            this.createRadarChart()
        ]);
    }

    /**
     * Cria gráfico de pizza otimizado
     */
    async createCriticityChart() {
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
                cutout: '60%'
            }
        });
    }

    /**
     * Cria gráfico de temperatura otimizado (top 8 apenas)
     */
    async createTemperatureChart() {
        const ctx = document.getElementById('temperatureChart').getContext('2d');
        
        // Limita a 8 zonas para melhor performance
        const sortedZones = [...this.zonesData]
            .sort((a, b) => b.temperatura - a.temperatura)
            .slice(0, 8);

        const data = {
            labels: sortedZones.map(z => z.nome.length > 12 ? z.nome.substring(0, 12) + '...' : z.nome),
            datasets: [{
                label: 'Temperatura (°C)',
                data: sortedZones.map(z => z.temperatura),
                backgroundColor: sortedZones.map(z => this.getZoneColor(z.classificacao, 0.8)),
                borderColor: sortedZones.map(z => this.getZoneColor(z.classificacao, 1)),
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
                            minRotation: 45,
                            font: {
                                size: 10
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Cria gráfico NDVI otimizado (top 8 apenas)
     */
    async createNDVIChart() {
        const ctx = document.getElementById('ndviChart').getContext('2d');
        
        // Limita a 8 zonas para melhor performance
        const sortedZones = [...this.zonesData]
            .sort((a, b) => a.ndvi - b.ndvi)
            .slice(0, 8);

        const data = {
            labels: sortedZones.map(z => z.nome.length > 12 ? z.nome.substring(0, 12) + '...' : z.nome),
            datasets: [{
                label: 'NDVI',
                data: sortedZones.map(z => z.ndvi),
                backgroundColor: sortedZones.map(z => this.getZoneColor(z.classificacao, 0.8)),
                borderColor: sortedZones.map(z => this.getZoneColor(z.classificacao, 1)),
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
                            maxRotation: 0,
                            font: {
                                size: 10
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Cria gráfico radar otimizado
     */
    async createRadarChart() {
        const ctx = document.getElementById('radarChart').getContext('2d');
        
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
     * Preenche tabela otimizada (paginada)
     */
    async populateTable() {
        const tbody = document.querySelector('#zonesTable tbody');
        tbody.innerHTML = '';

        // Ordena por criticidade
        const sortedZones = [...this.zonesData].sort((a, b) => {
            const order = { 'Crítica': 0, 'Média': 1, 'Segura': 2 };
            return order[a.classificacao] - order[b.classificacao];
        });

        // Limita a 15 zonas na tabela para melhor performance
        const displayZones = sortedZones.slice(0, 15);

        // Usa DocumentFragment para melhor performance
        const fragment = document.createDocumentFragment();

        displayZones.forEach(zone => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${zone.nome}</strong></td>
                <td>${zone.regiao || 'N/A'}</td>
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
            fragment.appendChild(row);
        });

        tbody.appendChild(fragment);

        // Adiciona indicador se há mais dados
        if (sortedZones.length > 15) {
            const moreRow = document.createElement('tr');
            moreRow.innerHTML = `
                <td colspan="7" class="text-center text-muted">
                    <i class="fas fa-info-circle me-2"></i>
                    Mostrando 15 de ${sortedZones.length} zonas. 
                    <a href="/api/report" class="text-primary">Ver relatório completo</a>
                </td>
            `;
            tbody.appendChild(moreRow);
        }
    }

    /**
     * Configura seletores otimizados
     */
    setupSelectors() {
        const selector = document.getElementById('zoneSelector');
        if (!selector) return;
        
        // Limita opções para melhor performance
        const topZones = this.zonesData
            .sort((a, b) => b.indice_criticidade - a.indice_criticidade)
            .slice(0, 20);
        
        selector.innerHTML = '';
        
        topZones.forEach(zone => {
            const option = document.createElement('option');
            option.value = zone.id;
            option.textContent = `${zone.nome} (${zone.classificacao})`;
            selector.appendChild(option);
        });

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
        
        citySelector.addEventListener('change', async (event) => {
            const newCity = event.target.value;
            if (newCity !== this.currentCity) {
                await this.changeCity(newCity);
            }
        });
    }

    /**
     * Muda cidade com loading otimizado
     */
    async changeCity(newCity) {
        try {
            console.log(`🔄 Mudando para cidade: ${newCity}`);
            
            this.showLoading();
            this.currentCity = newCity;
            
            await this.loadData(newCity);
            this.calculateStatistics();
            
            // Atualiza em paralelo
            await Promise.all([
                this.updateStatsCards(),
                this.updateCharts(),
                this.populateTable()
            ]);
            
            this.setupSelectors();
            this.hideLoading();
            
            console.log(`✅ Cidade alterada para: ${newCity}`);
            
        } catch (error) {
            console.error('Erro ao mudar cidade:', error);
            this.showError('Erro ao carregar dados da cidade selecionada');
        }
    }

    /**
     * Atualiza gráficos otimizado
     */
    updateCharts() {
        // Destroi gráficos existentes
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.destroy) {
                chart.destroy();
            }
        });
        
        // Recria gráficos
        return this.createCharts();
    }

    /**
     * Atualiza gráfico radar
     */
    updateRadarChart() {
        const selector = document.getElementById('zoneSelector');
        const selectedIds = Array.from(selector.selectedOptions).map(opt => parseInt(opt.value));
        
        if (selectedIds.length === 0) {
            this.charts.radar.data.datasets = [];
            this.charts.radar.update();
            return;
        }

        if (selectedIds.length > 3) {
            this.showWarning('Máximo de 3 zonas podem ser comparadas');
            const lastOption = selector.selectedOptions[selector.selectedOptions.length - 1];
            lastOption.selected = false;
            return;
        }

        const datasets = selectedIds.map((id, index) => {
            const zone = this.zonesData.find(z => z.id === id);
            if (!zone) return null;

            const maxTemp = Math.max(...this.zonesData.map(z => z.temperatura));
            const maxDensity = Math.max(...this.zonesData.map(z => z.densidade_populacional));
            const maxCriticity = Math.max(...this.zonesData.map(z => z.indice_criticidade));

            return {
                label: zone.nome,
                data: [
                    zone.temperatura / maxTemp,
                    zone.ndvi,
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
     * Mostra loading otimizado
     */
    showLoading() {
        document.getElementById('loading-spinner').style.display = 'flex';
        document.getElementById('main-content').style.display = 'none';
    }

    /**
     * Esconde loading
     */
    hideLoading() {
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
            this.loadingTimeout = null;
        }
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
        this.hideLoading();
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
            Object.values(window.DashboardManager.charts).forEach(chart => {
                if (chart && chart.resize) {
                    chart.resize();
                }
            });
        }, 100);
    }
});

// Função global para download de relatório
async function downloadReport() {
    try {
        const button = document.getElementById('downloadReport');
        const originalText = button.innerHTML;
        
        // Mostra loading no botão
        button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Gerando PDF...';
        button.disabled = true;
        
        // Faz download do PDF
        const response = await fetch('/api/report');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_clima_vida_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Restaura botão
        button.innerHTML = originalText;
        button.disabled = false;
        
        // Mostra sucesso
        if (window.UIManager) {
            window.UIManager.showSuccess('Relatório PDF baixado com sucesso!');
        }
        
    } catch (error) {
        console.error('Erro ao baixar relatório:', error);
        
        // Restaura botão
        const button = document.getElementById('downloadReport');
        button.innerHTML = '<i class="fas fa-download me-2"></i>Baixar Relatório PDF';
        button.disabled = false;
        
        // Mostra erro
        if (window.UIManager) {
            window.UIManager.showError('Erro ao gerar relatório PDF');
        }
    }
}
