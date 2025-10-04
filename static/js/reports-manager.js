/**
 * Reports Manager - Gerenciador da Página de Relatórios
 * Sistema Clima Vida - NASA Space Apps Hackathon 2025
 */

class DashboardManager {
    constructor() {
        this.chartManager = null;
        this.statsManager = null;
        this.tableManager = null;
        this.zonesData = [];
        this.initialized = false;
    }

    /**
     * Inicializa o dashboard
     */
    init() {
        if (this.initialized) {
            console.log('Dashboard já inicializado');
            return;
        }

        console.log('🚀 Inicializando Dashboard Manager...');

        // Verifica se os dados estão disponíveis
        if (!window.zonesData || window.zonesData.length === 0) {
            console.warn('⚠️ Nenhum dado de zona disponível para relatórios');
            this.showNoDataMessage();
            return;
        }

        this.zonesData = window.zonesData;
        console.log(`📊 Carregando ${this.zonesData.length} zonas`);

        try {
            // Inicializa componentes
            this.initializeComponents();
            
            // Renderiza componentes
            this.renderComponents();
            
            // Configura event listeners
            this.setupEventListeners();
            
            this.initialized = true;
            console.log('✅ Dashboard inicializado com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar dashboard:', error);
            this.showErrorMessage('Erro ao carregar dashboard. Tente recarregar a página.');
        }
    }

    /**
     * Inicializa componentes
     */
    initializeComponents() {
        // Inicializa gerenciadores
        this.chartManager = new ChartManager();
        this.statsManager = new StatsManager();
        this.tableManager = new TableManager();

        // Torna disponível globalmente
        window.chartManager = this.chartManager;
        window.statsManager = this.statsManager;
        window.tableManager = this.tableManager;
    }

    /**
     * Renderiza componentes
     */
    renderComponents() {
        // Calcula e exibe estatísticas
        this.statsManager.calculateStats(this.zonesData);
        this.statsManager.updateDOM();

        // Renderiza gráficos
        this.chartManager.renderClassificationChart('classificationChart', this.zonesData);
        this.chartManager.renderTemperatureChart('temperatureChart', this.zonesData);

        // Inicializa tabela
        this.tableManager.init('zonesTable', this.zonesData);
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Event listener para seleção de zona na tabela
        document.addEventListener('zoneSelected', (event) => {
            console.log('Zona selecionada:', event.detail.zone);
            // Aqui você pode adicionar lógica para destacar a zona no mapa
        });

        // Event listener para redimensionamento da janela
        window.addEventListener('resize', () => {
            if (this.chartManager) {
                this.chartManager.resizeAll();
            }
        });
    }

    /**
     * Exibe mensagem quando não há dados
     */
    showNoDataMessage() {
        const container = document.querySelector('.main-body .container');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-warning text-center">
                    <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                    <h4>Nenhum dado disponível</h4>
                    <p>Não foi possível carregar os dados das zonas. Tente recarregar a página.</p>
                    <button class="btn btn-warning" onclick="location.reload()">
                        <i class="fas fa-refresh me-2"></i>
                        Recarregar Página
                    </button>
                </div>
            `;
        }
    }

    /**
     * Exibe mensagem de erro
     */
    showErrorMessage(message) {
        const container = document.querySelector('.main-body .container');
        if (container) {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-danger alert-dismissible fade show';
            alertDiv.innerHTML = `
                <i class="fas fa-exclamation-circle me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            container.insertBefore(alertDiv, container.firstChild);
        }
    }

    /**
     * Atualiza dados do dashboard
     */
    updateData(newData) {
        this.zonesData = newData;
        
        if (this.statsManager) {
            this.statsManager.calculateStats(this.zonesData);
            this.statsManager.updateDOM();
        }
        
        if (this.chartManager) {
            this.chartManager.renderClassificationChart('classificationChart', this.zonesData);
            this.chartManager.renderTemperatureChart('temperatureChart', this.zonesData);
        }
        
        if (this.tableManager) {
            this.tableManager.init('zonesTable', this.zonesData);
        }
    }

    /**
     * Destrói o dashboard
     */
    destroy() {
        if (this.chartManager) {
            this.chartManager.destroyAll();
        }
        
        this.initialized = false;
        console.log('🗑️ Dashboard destruído');
    }
}

// Função global para download de relatório
window.downloadReport = async function() {
    try {
        const button = document.getElementById('downloadReport');
        const originalText = button.innerHTML;
        
        // Mostra loading
        button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Gerando PDF...';
        button.disabled = true;
        
        // Faz requisição
        const response = await fetch('/api/report');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Baixa arquivo
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
};

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Cria instância global do dashboard
    window.DashboardManager = new DashboardManager();
    
    // Inicializa se Chart.js estiver disponível
    if (typeof Chart !== 'undefined') {
        window.DashboardManager.init();
    } else {
        console.warn('Chart.js não está disponível, aguardando...');
    }
});

/**
 * Renderiza o gráfico de distribuição de zonas por classificação.
 */
function renderClassificationChart(zonesData) {
    const ctx = document.getElementById('classificationChart').getContext('2d');
    const classificationCounts = {};
    
    zonesData.forEach(zone => {
        classificationCounts[zone.classificacao] = (classificationCounts[zone.classificacao] || 0) + 1;
    });
    
    const labels = Object.keys(classificationCounts);
    const data = Object.values(classificationCounts);
    const backgroundColors = labels.map(label => {
        if (label === 'Crítica') return '#FF4444';
        if (label === 'Média') return '#FFA500';
        if (label === 'Segura') return '#44FF44';
        return '#CCCCCC';
    });

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: false,
                    text: 'Distribuição de Zonas por Classificação'
                }
            }
        },
    });
}

/**
 * Renderiza o gráfico de temperatura média por região.
 */
function renderTemperatureChart(zonesData) {
    const ctx = document.getElementById('temperatureChart').getContext('2d');
    const regionTemperatures = {};
    const regionCounts = {};

    zonesData.forEach(zone => {
        const region = zone.regiao || 'Desconhecida';
        regionTemperatures[region] = (regionTemperatures[region] || 0) + zone.temperatura;
        regionCounts[region] = (regionCounts[region] || 0) + 1;
    });

    const labels = Object.keys(regionTemperatures);
    const data = labels.map(region => regionTemperatures[region] / regionCounts[region]);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperatura Média (°C)',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: false,
                    text: 'Temperatura Média por Região'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Temperatura (°C)'
                    }
                }
            }
        }
    });
}

/**
 * Popula a tabela com os dados das zonas.
 */
function populateTable(zonesData) {
    const tableBody = document.querySelector('.table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = ''; // Limpa o conteúdo existente

    zonesData.forEach(zone => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = zone.nome;
        row.insertCell().textContent = zone.temperatura.toFixed(1);
        row.insertCell().textContent = zone.ndvi.toFixed(2);
        row.insertCell().textContent = zone.densidade_populacional;
        row.insertCell().textContent = zone.indice_criticidade.toFixed(2);
        row.insertCell().textContent = zone.classificacao;
    });
}
