/**
 * Dashboard JavaScript Debug - Sistema Clima Vida
 * Versão simplificada para debug
 */

console.log('🚀 Dashboard Debug carregado');

class DashboardManager {
    constructor() {
        console.log('📊 DashboardManager inicializado');
        this.zonesData = [];
        this.statistics = {};
        this.charts = {};
        this.initialized = false;
        this.currentCity = 'sao_paulo';
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
            
            // Atualiza interface
            this.updateStatsCards();
            this.createCharts();
            this.populateTable();
            
            // Configura seletores
            this.setupSelectors();
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
            console.log(`📊 Carregando dados para: ${cityParam}`);
            
            const response = await fetch(`/api/zones?city=${cityParam}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.zonesData = await response.json();
            
            if (!Array.isArray(this.zonesData)) {
                throw new Error('Dados recebidos não são um array válido');
            }
            
            console.log(`✅ ${this.zonesData.length} zonas carregadas para ${cityParam}`);
            
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
        
        console.log('📊 Estatísticas calculadas:', this.statistics);
    }

    /**
     * Atualiza cards de estatísticas
     */
    updateStatsCards() {
        const elements = {
            'total-zones': this.statistics.total_zones,
            'critical-zones': this.statistics.critical_zones,
            'avg-temperature': `${this.statistics.avg_temperature}°C`,
            'avg-ndvi': this.statistics.avg_ndvi
        };

        for (const [id, value] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                console.log(`✅ Card ${id} atualizado: ${value}`);
            } else {
                console.warn(`⚠️ Elemento ${id} não encontrado`);
            }
        }
    }

    /**
     * Cria gráficos básicos
     */
    createCharts() {
        console.log('📊 Criando gráficos...');
        
        // Verifica se Chart.js está disponível
        if (typeof Chart === 'undefined') {
            console.error('❌ Chart.js não está carregado');
            return;
        }
        
        try {
            this.createCriticityChart();
            this.createTemperatureChart();
            this.createNDVIChart();
            this.createRadarChart();
            console.log('✅ Gráficos criados com sucesso');
        } catch (error) {
            console.error('❌ Erro ao criar gráficos:', error);
        }
    }

    /**
     * Cria gráfico de pizza
     */
    createCriticityChart() {
        const ctx = document.getElementById('criticityChart');
        if (!ctx) {
            console.warn('⚠️ Canvas criticityChart não encontrado');
            return;
        }
        
        const data = {
            labels: ['Crítica', 'Média', 'Segura'],
            datasets: [{
                data: [
                    this.statistics.critical_zones,
                    this.statistics.medium_zones,
                    this.statistics.safe_zones
                ],
                backgroundColor: ['#FF4444', '#FFA500', '#44FF44'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        };

        this.charts.criticity = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%'
            }
        });
    }

    /**
     * Cria gráfico de temperatura
     */
    createTemperatureChart() {
        const ctx = document.getElementById('temperatureChart');
        if (!ctx) {
            console.warn('⚠️ Canvas temperatureChart não encontrado');
            return;
        }
        
        const sortedZones = [...this.zonesData]
            .sort((a, b) => b.temperatura - a.temperatura)
            .slice(0, 8);

        const data = {
            labels: sortedZones.map(z => z.nome.length > 12 ? z.nome.substring(0, 12) + '...' : z.nome),
            datasets: [{
                label: 'Temperatura (°C)',
                data: sortedZones.map(z => z.temperatura),
                backgroundColor: 'rgba(46, 134, 171, 0.8)',
                borderColor: 'rgba(46, 134, 171, 1)',
                borderWidth: 1
            }]
        };

        this.charts.temperature = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    /**
     * Cria gráfico NDVI
     */
    createNDVIChart() {
        const ctx = document.getElementById('ndviChart');
        if (!ctx) {
            console.warn('⚠️ Canvas ndviChart não encontrado');
            return;
        }
        
        const sortedZones = [...this.zonesData]
            .sort((a, b) => a.ndvi - b.ndvi)
            .slice(0, 8);

        const data = {
            labels: sortedZones.map(z => z.nome.length > 12 ? z.nome.substring(0, 12) + '...' : z.nome),
            datasets: [{
                label: 'NDVI',
                data: sortedZones.map(z => z.ndvi),
                backgroundColor: 'rgba(162, 59, 114, 0.8)',
                borderColor: 'rgba(162, 59, 114, 1)',
                borderWidth: 1
            }]
        };

        this.charts.ndvi = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 1
                    }
                }
            }
        });
    }

    /**
     * Cria gráfico radar
     */
    createRadarChart() {
        const ctx = document.getElementById('radarChart');
        if (!ctx) {
            console.warn('⚠️ Canvas radarChart não encontrado');
            return;
        }
        
        const data = {
            labels: ['Temperatura', 'NDVI', 'Densidade Pop.', 'Criticidade'],
            datasets: []
        };

        this.charts.radar = new Chart(ctx, {
            type: 'radar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 1
                    }
                }
            }
        });
    }

    /**
     * Preenche tabela
     */
    populateTable() {
        const tbody = document.querySelector('#zonesTable tbody');
        if (!tbody) {
            console.warn('⚠️ Tabela zonesTable não encontrada');
            return;
        }
        
        tbody.innerHTML = '';

        const sortedZones = [...this.zonesData].sort((a, b) => {
            const order = { 'Crítica': 0, 'Média': 1, 'Segura': 2 };
            return order[a.classificacao] - order[b.classificacao];
        });

        const displayZones = sortedZones.slice(0, 15);

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
            tbody.appendChild(row);
        });

        console.log(`✅ Tabela preenchida com ${displayZones.length} zonas`);
    }

    /**
     * Configura seletores
     */
    setupSelectors() {
        const selector = document.getElementById('zoneSelector');
        if (!selector) {
            console.warn('⚠️ Seletor zoneSelector não encontrado');
            return;
        }
        
        selector.innerHTML = '';
        
        this.zonesData.forEach(zone => {
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
        if (!citySelector) {
            console.warn('⚠️ Seletor citySelect não encontrado');
            return;
        }
        
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
            
            this.showLoading();
            this.currentCity = newCity;
            
            await this.loadData(newCity);
            this.calculateStatistics();
            this.updateStatsCards();
            this.updateCharts();
            this.populateTable();
            this.setupSelectors();
            
            this.hideLoading();
            
            console.log(`✅ Cidade alterada para: ${newCity}`);
            
        } catch (error) {
            console.error('Erro ao mudar cidade:', error);
            this.showError('Erro ao carregar dados da cidade selecionada');
        }
    }

    /**
     * Atualiza gráficos
     */
    updateCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.destroy) {
                chart.destroy();
            }
        });
        
        this.createCharts();
    }

    /**
     * Atualiza gráfico radar
     */
    updateRadarChart() {
        const selector = document.getElementById('zoneSelector');
        if (!selector) return;
        
        const selectedIds = Array.from(selector.selectedOptions).map(opt => parseInt(opt.value));
        
        if (selectedIds.length === 0) {
            this.charts.radar.data.datasets = [];
            this.charts.radar.update();
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
                backgroundColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.2)`,
                borderColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`,
                borderWidth: 2
            };
        }).filter(Boolean);

        this.charts.radar.data.datasets = datasets;
        this.charts.radar.update();
    }

    /**
     * Mostra loading
     */
    showLoading() {
        const loading = document.getElementById('loading-spinner');
        const content = document.getElementById('main-content');
        if (loading) loading.style.display = 'flex';
        if (content) content.style.display = 'none';
    }

    /**
     * Esconde loading
     */
    hideLoading() {
        const loading = document.getElementById('loading-spinner');
        if (loading) loading.style.display = 'none';
    }

    /**
     * Mostra conteúdo
     */
    showContent() {
        const content = document.getElementById('main-content');
        if (content) content.style.display = 'block';
    }

    /**
     * Mostra erro
     */
    showError(message) {
        this.hideLoading();
        console.error('❌ Erro:', message);
        alert(`Erro: ${message}`);
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

// Inicialização será feita pelo template após Chart.js carregar
// document.addEventListener('DOMContentLoaded', () => {
//     console.log('📄 DOM carregado, inicializando dashboard...');
//     window.DashboardManager.init();
// });

// Função global para download de relatório
async function downloadReport() {
    try {
        console.log('📥 Iniciando download do relatório...');
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
        
        console.log('✅ Relatório baixado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao baixar relatório:', error);
        alert('Erro ao gerar relatório PDF');
    }
}
