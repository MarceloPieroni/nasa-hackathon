/**
 * Dashboard JavaScript Simples - Sistema Clima Vida
 * Versão sem Chart.js para debug
 */

console.log('🚀 Dashboard Simples carregado');

class DashboardManager {
    constructor() {
        console.log('📊 DashboardManager inicializado');
        this.zonesData = [];
        this.statistics = {};
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
            this.populateTable();
            
            // Configura seletores
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
            'avg-ndvi': this.statistics.avg_ndvi,
            'critical-count': this.statistics.critical_zones,
            'medium-count': this.statistics.medium_zones,
            'safe-count': this.statistics.safe_zones,
            'avg-temp-display': `${this.statistics.avg_temperature}°C`
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

        // Atualiza informações de temperatura
        this.updateTemperatureInfo();
    }

    /**
     * Atualiza informações de temperatura
     */
    updateTemperatureInfo() {
        if (!this.zonesData || this.zonesData.length === 0) return;

        const hottestZone = this.zonesData.reduce((max, zone) => 
            zone.temperatura > max.temperatura ? zone : max
        );
        
        const maxTemp = Math.max(...this.zonesData.map(z => z.temperatura));

        const tempElements = {
            'hottest-zone': hottestZone.nome,
            'max-temp': `${maxTemp.toFixed(1)}°C`
        };

        for (const [id, value] of Object.entries(tempElements)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                console.log(`✅ Temperatura ${id} atualizada: ${value}`);
            }
        }
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
            this.populateTable();
            
            this.hideLoading();
            
            console.log(`✅ Cidade alterada para: ${newCity}`);
            
        } catch (error) {
            console.error('Erro ao mudar cidade:', error);
            this.showError('Erro ao carregar dados da cidade selecionada');
        }
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

// Inicializa quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM carregado, inicializando dashboard...');
    window.DashboardManager.init();
});

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
