/**
 * Stats Manager - Componente para gerenciar estatísticas
 * Sistema Clima Vida - NASA Space Apps Hackathon 2025
 */

class StatsManager {
    constructor() {
        this.stats = {
            totalZones: 0,
            criticalZones: 0,
            mediumZones: 0,
            safeZones: 0,
            avgTemperature: 0,
            avgNDVI: 0,
            maxTemperature: 0,
            minTemperature: 0
        };
    }

    /**
     * Calcula estatísticas dos dados
     */
    calculateStats(zonesData) {
        if (!zonesData || zonesData.length === 0) {
            console.warn('Nenhum dado de zona fornecido para cálculo de estatísticas');
            return this.stats;
        }

        const temperatures = zonesData.map(zone => zone.temperatura);
        const ndviValues = zonesData.map(zone => zone.ndvi);
        
        // Contadores por classificação
        const classificationCounts = {
            'Crítica': 0,
            'Média': 0,
            'Segura': 0
        };

        zonesData.forEach(zone => {
            if (classificationCounts.hasOwnProperty(zone.classificacao)) {
                classificationCounts[zone.classificacao]++;
            }
        });

        // Calcula estatísticas
        this.stats = {
            totalZones: zonesData.length,
            criticalZones: classificationCounts['Crítica'],
            mediumZones: classificationCounts['Média'],
            safeZones: classificationCounts['Segura'],
            avgTemperature: this.calculateAverage(temperatures),
            avgNDVI: this.calculateAverage(ndviValues),
            maxTemperature: Math.max(...temperatures),
            minTemperature: Math.min(...temperatures)
        };

        return this.stats;
    }

    /**
     * Calcula média de um array
     */
    calculateAverage(values) {
        if (values.length === 0) return 0;
        return values.reduce((sum, value) => sum + value, 0) / values.length;
    }

    /**
     * Atualiza os elementos DOM com as estatísticas
     */
    updateDOM() {
        // Total de zonas
        const totalElement = document.getElementById('totalZones');
        if (totalElement) {
            totalElement.textContent = this.stats.totalZones;
            this.animateNumber(totalElement, this.stats.totalZones);
        }

        // Zonas críticas
        const criticalElement = document.getElementById('criticalZones');
        if (criticalElement) {
            criticalElement.textContent = this.stats.criticalZones;
            this.animateNumber(criticalElement, this.stats.criticalZones);
        }

        // Temperatura média
        const tempElement = document.getElementById('avgTemperature');
        if (tempElement) {
            tempElement.textContent = `${this.stats.avgTemperature.toFixed(1)}°C`;
            this.animateNumber(tempElement, this.stats.avgTemperature);
        }

        // NDVI médio
        const ndviElement = document.getElementById('avgNDVI');
        if (ndviElement) {
            ndviElement.textContent = this.stats.avgNDVI.toFixed(2);
            this.animateNumber(ndviElement, this.stats.avgNDVI);
        }

        // Atualiza elementos adicionais se existirem
        this.updateAdditionalStats();
    }

    /**
     * Atualiza estatísticas adicionais
     */
    updateAdditionalStats() {
        // Temperatura máxima
        const maxTempElement = document.getElementById('maxTemperature');
        if (maxTempElement) {
            maxTempElement.textContent = `${this.stats.maxTemperature.toFixed(1)}°C`;
        }

        // Temperatura mínima
        const minTempElement = document.getElementById('minTemperature');
        if (minTempElement) {
            minTempElement.textContent = `${this.stats.minTemperature.toFixed(1)}°C`;
        }

        // Zonas médias
        const mediumElement = document.getElementById('mediumZones');
        if (mediumElement) {
            mediumElement.textContent = this.stats.mediumZones;
        }

        // Zonas seguras
        const safeElement = document.getElementById('safeZones');
        if (safeElement) {
            safeElement.textContent = this.stats.safeZones;
        }
    }

    /**
     * Anima número com efeito de contagem
     */
    animateNumber(element, targetValue) {
        const startValue = 0;
        const duration = 1000; // 1 segundo
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = startValue + (targetValue - startValue) * easeOut;
            
            // Formata o valor baseado no tipo
            if (element.id === 'avgTemperature' || element.id === 'maxTemperature' || element.id === 'minTemperature') {
                element.textContent = `${currentValue.toFixed(1)}°C`;
            } else if (element.id === 'avgNDVI') {
                element.textContent = currentValue.toFixed(2);
            } else {
                element.textContent = Math.round(currentValue);
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Retorna estatísticas formatadas para exibição
     */
    getFormattedStats() {
        return {
            totalZones: this.stats.totalZones.toLocaleString('pt-BR'),
            criticalZones: this.stats.criticalZones.toLocaleString('pt-BR'),
            mediumZones: this.stats.mediumZones.toLocaleString('pt-BR'),
            safeZones: this.stats.safeZones.toLocaleString('pt-BR'),
            avgTemperature: `${this.stats.avgTemperature.toFixed(1)}°C`,
            avgNDVI: this.stats.avgNDVI.toFixed(2),
            maxTemperature: `${this.stats.maxTemperature.toFixed(1)}°C`,
            minTemperature: `${this.stats.minTemperature.toFixed(1)}°C`
        };
    }

    /**
     * Retorna estatísticas em formato JSON
     */
    toJSON() {
        return JSON.stringify(this.stats, null, 2);
    }
}

// Exporta a classe
window.StatsManager = StatsManager;
