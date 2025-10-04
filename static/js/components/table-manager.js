/**
 * Table Manager - Componente para gerenciar tabelas de dados
 * Sistema Clima Vida - NASA Space Apps Hackathon 2025
 */

class TableManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 15;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.filteredData = [];
        this.originalData = [];
    }

    /**
     * Inicializa a tabela com dados
     */
    init(tableId, data) {
        this.tableId = tableId;
        this.originalData = data;
        this.filteredData = [...data];
        this.render();
        this.setupEventListeners();
    }

    /**
     * Renderiza a tabela
     */
    render() {
        const table = document.getElementById(this.tableId);
        if (!table) {
            console.error(`Tabela ${this.tableId} não encontrada`);
            return;
        }

        const tbody = table.querySelector('tbody');
        if (!tbody) {
            console.error('Elemento tbody não encontrado na tabela');
            return;
        }

        // Limpa conteúdo existente
        tbody.innerHTML = '';

        // Calcula dados da página atual
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageData = this.filteredData.slice(startIndex, endIndex);

        // Renderiza linhas
        pageData.forEach((zone, index) => {
            const row = this.createTableRow(zone, startIndex + index + 1);
            tbody.appendChild(row);
        });

        // Atualiza controles de paginação
        this.updatePagination();
    }

    /**
     * Cria uma linha da tabela
     */
    createTableRow(zone, index) {
        const row = document.createElement('tr');
        row.setAttribute('data-zone-id', zone.id || index);

        // Classe baseada na classificação
        const classificationClass = this.getClassificationClass(zone.classificacao);
        row.className = `zone-row ${classificationClass}`;

        row.innerHTML = `
            <td><strong>${this.escapeHtml(zone.nome)}</strong></td>
            <td>${zone.temperatura.toFixed(1)}</td>
            <td>${zone.ndvi.toFixed(2)}</td>
            <td>${zone.densidade_populacional.toLocaleString('pt-BR')}</td>
            <td>${zone.indice_criticidade.toFixed(2)}</td>
            <td>
                <span class="badge ${this.getBadgeClass(zone.classificacao)}">
                    ${this.escapeHtml(zone.classificacao)}
                </span>
            </td>
        `;

        // Adiciona evento de clique
        row.addEventListener('click', () => {
            this.onRowClick(zone);
        });

        return row;
    }

    /**
     * Retorna classe CSS baseada na classificação
     */
    getClassificationClass(classification) {
        switch (classification) {
            case 'Crítica': return 'zone-critical';
            case 'Média': return 'zone-medium';
            case 'Segura': return 'zone-safe';
            default: return 'zone-unknown';
        }
    }

    /**
     * Retorna classe do badge baseada na classificação
     */
    getBadgeClass(classification) {
        switch (classification) {
            case 'Crítica': return 'badge-danger';
            case 'Média': return 'badge-warning';
            case 'Segura': return 'badge-success';
            default: return 'badge-secondary';
        }
    }

    /**
     * Escapa HTML para prevenir XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Headers clicáveis para ordenação
        const headers = document.querySelectorAll(`#${this.tableId} thead th`);
        headers.forEach((header, index) => {
            if (index > 0) { // Pula primeira coluna (nome)
                header.style.cursor = 'pointer';
                header.addEventListener('click', () => {
                    this.sortByColumn(index);
                });
            }
        });
    }

    /**
     * Ordena por coluna
     */
    sortByColumn(columnIndex) {
        const columns = ['nome', 'temperatura', 'ndvi', 'densidade_populacional', 'indice_criticidade', 'classificacao'];
        const column = columns[columnIndex];

        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }

        this.filteredData.sort((a, b) => {
            let aValue = a[column];
            let bValue = b[column];

            // Tratamento especial para strings
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        this.currentPage = 1;
        this.render();
        this.updateSortIndicators();
    }

    /**
     * Atualiza indicadores de ordenação
     */
    updateSortIndicators() {
        const headers = document.querySelectorAll(`#${this.tableId} thead th`);
        headers.forEach((header, index) => {
            // Remove indicadores existentes
            header.querySelectorAll('.sort-indicator').forEach(indicator => {
                indicator.remove();
            });

            // Adiciona novo indicador se for a coluna atual
            if (this.sortColumn && index > 0) {
                const columns = ['nome', 'temperatura', 'ndvi', 'densidade_populacional', 'indice_criticidade', 'classificacao'];
                if (columns[index] === this.sortColumn) {
                    const indicator = document.createElement('span');
                    indicator.className = 'sort-indicator ms-1';
                    indicator.innerHTML = this.sortDirection === 'asc' ? '↑' : '↓';
                    header.appendChild(indicator);
                }
            }
        });
    }

    /**
     * Atualiza controles de paginação
     */
    updatePagination() {
        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
        const paginationContainer = document.getElementById('tablePagination');
        
        if (!paginationContainer) return;

        paginationContainer.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div class="pagination-info">
                    <small class="text-muted">
                        Mostrando ${((this.currentPage - 1) * this.itemsPerPage) + 1} a 
                        ${Math.min(this.currentPage * this.itemsPerPage, this.filteredData.length)} 
                        de ${this.filteredData.length} zonas
                    </small>
                </div>
                <div class="pagination-controls">
                    <button class="btn btn-sm btn-outline-primary me-2" 
                            onclick="tableManager.previousPage()" 
                            ${this.currentPage === 1 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-left"></i> Anterior
                    </button>
                    <span class="mx-2">
                        Página ${this.currentPage} de ${totalPages}
                    </span>
                    <button class="btn btn-sm btn-outline-primary ms-2" 
                            onclick="tableManager.nextPage()" 
                            ${this.currentPage === totalPages ? 'disabled' : ''}>
                        Próxima <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Vai para página anterior
     */
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.render();
        }
    }

    /**
     * Vai para próxima página
     */
    nextPage() {
        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.render();
        }
    }

    /**
     * Filtra dados
     */
    filter(searchTerm) {
        if (!searchTerm) {
            this.filteredData = [...this.originalData];
        } else {
            this.filteredData = this.originalData.filter(zone => 
                zone.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                zone.classificacao.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        this.currentPage = 1;
        this.render();
    }

    /**
     * Evento de clique na linha
     */
    onRowClick(zone) {
        // Remove seleção anterior
        document.querySelectorAll('.zone-row').forEach(row => {
            row.classList.remove('selected');
        });

        // Adiciona seleção atual
        event.currentTarget.classList.add('selected');

        // Dispara evento customizado
        const customEvent = new CustomEvent('zoneSelected', {
            detail: { zone }
        });
        document.dispatchEvent(customEvent);
    }

    /**
     * Exporta dados da tabela
     */
    exportToCSV() {
        const headers = ['Nome', 'Temperatura (°C)', 'NDVI', 'Densidade (hab/km²)', 'Índice de Criticidade', 'Classificação'];
        const csvContent = [
            headers.join(','),
            ...this.filteredData.map(zone => [
                zone.nome,
                zone.temperatura.toFixed(1),
                zone.ndvi.toFixed(2),
                zone.densidade_populacional,
                zone.indice_criticidade.toFixed(2),
                zone.classificacao
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `zonas_clima_vida_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Exporta a classe
window.TableManager = TableManager;
