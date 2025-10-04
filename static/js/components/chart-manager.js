/**
 * Chart Manager - Componente para gerenciar gráficos
 * Sistema Clima Vida - NASA Space Apps Hackathon 2025
 */

class ChartManager {
    constructor() {
        this.charts = new Map();
        this.colors = {
            critical: '#FF4444',
            medium: '#FFA500',
            safe: '#44FF44',
            primary: '#2E86AB',
            secondary: '#A23B72'
        };
    }

    /**
     * Cria gradiente de temperatura
     */
    createTemperatureGradient(ctx, minTemp, maxTemp) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        
        // Verde para baixas temperaturas
        gradient.addColorStop(0, '#44FF44');
        // Amarelo para temperaturas médias
        gradient.addColorStop(0.5, '#FFA500');
        // Vermelho para altas temperaturas
        gradient.addColorStop(1, '#FF4444');
        
        return gradient;
    }

    /**
     * Renderiza gráfico de distribuição por criticidade
     */
    renderClassificationChart(canvasId, zonesData) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.error(`Canvas ${canvasId} não encontrado`);
            return;
        }

        // Destrói gráfico existente
        if (this.charts.has(canvasId)) {
            this.charts.get(canvasId).destroy();
        }

        // Calcula distribuição
        const classificationCounts = {};
        zonesData.forEach(zone => {
            classificationCounts[zone.classificacao] = (classificationCounts[zone.classificacao] || 0) + 1;
        });

        const labels = Object.keys(classificationCounts);
        const data = Object.values(classificationCounts);
        const backgroundColors = labels.map(label => {
            switch(label) {
                case 'Crítica': return this.colors.critical;
                case 'Média': return this.colors.medium;
                case 'Segura': return this.colors.safe;
                default: return this.colors.primary;
            }
        });

        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 0,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false // Usamos legenda customizada
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} zonas (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true
                }
            }
        });

        this.charts.set(canvasId, chart);
        return chart;
    }

    /**
     * Renderiza gráfico de temperatura por região
     */
    renderTemperatureChart(canvasId, zonesData) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.error(`Canvas ${canvasId} não encontrado`);
            return;
        }

        // Destrói gráfico existente
        if (this.charts.has(canvasId)) {
            this.charts.get(canvasId).destroy();
        }

        // Agrupa por região
        const regionTemperatures = {};
        const regionCounts = {};

        zonesData.forEach(zone => {
            const region = zone.regiao || 'Desconhecida';
            regionTemperatures[region] = (regionTemperatures[region] || 0) + zone.temperatura;
            regionCounts[region] = (regionCounts[region] || 0) + 1;
        });

        const labels = Object.keys(regionTemperatures);
        const data = labels.map(region => regionTemperatures[region] / regionCounts[region]);
        
        // Cria gradiente baseado na temperatura
        const minTemp = Math.min(...data);
        const maxTemp = Math.max(...data);
        const gradient = this.createTemperatureGradient(ctx, minTemp, maxTemp);

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Temperatura Média (°C)',
                    data: data,
                    backgroundColor: (context) => {
                        const value = context.parsed.y;
                        const ratio = (value - minTemp) / (maxTemp - minTemp);
                        
                        if (ratio < 0.3) return this.colors.safe;
                        if (ratio < 0.7) return this.colors.medium;
                        return this.colors.critical;
                    },
                    borderColor: (context) => {
                        const value = context.parsed.y;
                        const ratio = (value - minTemp) / (maxTemp - minTemp);
                        
                        if (ratio < 0.3) return this.colors.safe;
                        if (ratio < 0.7) return this.colors.medium;
                        return this.colors.critical;
                    },
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Temperatura: ${context.parsed.y.toFixed(1)}°C`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Temperatura (°C)',
                            font: {
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Região',
                            font: {
                                weight: 'bold'
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });

        this.charts.set(canvasId, chart);
        return chart;
    }

    /**
     * Exporta gráfico como imagem
     */
    exportChart(canvasId, filename = 'chart') {
        const chart = this.charts.get(canvasId);
        if (!chart) {
            console.error(`Gráfico ${canvasId} não encontrado`);
            return;
        }

        const url = chart.toBase64Image();
        const link = document.createElement('a');
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Destrói todos os gráficos
     */
    destroyAll() {
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
    }

    /**
     * Redimensiona todos os gráficos
     */
    resizeAll() {
        this.charts.forEach(chart => chart.resize());
    }
}

// Função global para exportar gráficos
window.exportChart = function(canvasId) {
    if (window.chartManager) {
        window.chartManager.exportChart(canvasId);
    }
};

// Exporta a classe
window.ChartManager = ChartManager;
