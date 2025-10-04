/**
 * UI Manager - Gerenciador de Interface do Usuário
 * Sistema Cidades Frias, Corações Quentes
 */

class UIManager {
    constructor() {
        this.notifications = [];
        this.loadingOverlay = null;
    }

    /**
     * Mostra notificação de sucesso
     */
    showSuccess(message, duration = 3000) {
        this.showNotification(message, 'success', duration);
    }

    /**
     * Mostra notificação de erro
     */
    showError(message, duration = 5000) {
        this.showNotification(message, 'danger', duration);
    }

    /**
     * Mostra notificação de informação
     */
    showInfo(message, duration = 3000) {
        this.showNotification(message, 'info', duration);
    }

    /**
     * Mostra notificação de aviso
     */
    showWarning(message, duration = 4000) {
        this.showNotification(message, 'warning', duration);
    }

    /**
     * Cria e mostra notificação
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            max-width: 500px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        const icon = this.getNotificationIcon(type);
        notification.innerHTML = `
            ${icon} ${message}
            <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
        `;

        document.body.appendChild(notification);

        // Auto remove após duração especificada
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 150);
            }
        }, duration);

        this.notifications.push(notification);
    }

    /**
     * Retorna ícone para tipo de notificação
     */
    getNotificationIcon(type) {
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            danger: '<i class="fas fa-exclamation-circle"></i>',
            info: '<i class="fas fa-info-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>'
        };
        return icons[type] || icons.info;
    }

    /**
     * Mostra loading overlay
     */
    showLoading(message = 'Carregando...') {
        this.hideLoading(); // Remove loading anterior se existir

        this.loadingOverlay = document.createElement('div');
        this.loadingOverlay.className = 'loading-overlay-global';
        this.loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.95);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        this.loadingOverlay.innerHTML = `
            <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">Carregando...</span>
            </div>
            <p class="text-muted">${message}</p>
        `;

        document.body.appendChild(this.loadingOverlay);
    }

    /**
     * Esconde loading overlay
     */
    hideLoading() {
        if (this.loadingOverlay && this.loadingOverlay.parentElement) {
            this.loadingOverlay.remove();
            this.loadingOverlay = null;
        }
    }

    /**
     * Cria tooltip
     */
    createTooltip(element, text, placement = 'top') {
        element.setAttribute('data-bs-toggle', 'tooltip');
        element.setAttribute('data-bs-placement', placement);
        element.setAttribute('title', text);
        
        // Inicializa tooltip do Bootstrap
        new bootstrap.Tooltip(element);
    }

    /**
     * Formata número para exibição
     */
    formatNumber(number, decimals = 2) {
        return parseFloat(number).toFixed(decimals);
    }

    /**
     * Formata data para exibição
     */
    formatDate(date) {
        return new Date(date).toLocaleDateString('pt-BR');
    }

    /**
     * Formata temperatura para exibição
     */
    formatTemperature(temp) {
        return `${this.formatNumber(temp, 1)}°C`;
    }

    /**
     * Formata NDVI para exibição
     */
    formatNDVI(ndvi) {
        return this.formatNumber(ndvi, 2);
    }

    /**
     * Formata densidade populacional para exibição
     */
    formatDensity(density) {
        return density.toLocaleString('pt-BR') + ' hab/km²';
    }

    /**
     * Obtém cor baseada na classificação
     */
    getClassificationColor(classification) {
        const colors = {
            'Crítica': '#FF4444',
            'Média': '#FFA500',
            'Segura': '#44FF44'
        };
        return colors[classification] || '#666';
    }

    /**
     * Cria badge de classificação
     */
    createClassificationBadge(classification) {
        const color = this.getClassificationColor(classification);
        return `<span class="badge" style="background-color: ${color}; color: white;">${classification}</span>`;
    }

    /**
     * Valida email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Valida telefone
     */
    isValidPhone(phone) {
        const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
        return phoneRegex.test(phone);
    }

    /**
     * Confirma ação do usuário
     */
    confirmAction(message, title = 'Confirmação') {
        return new Promise((resolve) => {
            // Cria modal de confirmação
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>${message}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="confirm-btn">Confirmar</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const bsModal = new bootstrap.Modal(modal);

            // Manipula clique no botão confirmar
            modal.querySelector('#confirm-btn').addEventListener('click', () => {
                bsModal.hide();
                setTimeout(() => {
                    modal.remove();
                    resolve(true);
                }, 300);
            });

            // Manipula fechamento do modal
            modal.addEventListener('hidden.bs.modal', () => {
                modal.remove();
                resolve(false);
            });

            bsModal.show();
        });
    }

    /**
     * Limpa todas as notificações
     */
    clearAllNotifications() {
        this.notifications.forEach(notification => {
            if (notification.parentElement) {
                notification.remove();
            }
        });
        this.notifications = [];
    }

    /**
     * Scroll suave para elemento
     */
    scrollToElement(element, offset = 0) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Copia texto para clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showSuccess('Texto copiado para a área de transferência!');
        } catch (error) {
            console.error('Erro ao copiar texto:', error);
            this.showError('Erro ao copiar texto');
        }
    }
}

// Instância global do UIManager
window.UIManager = new UIManager();

