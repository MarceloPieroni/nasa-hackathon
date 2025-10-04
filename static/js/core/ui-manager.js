/**
 * UI Manager - Gerenciador de Interface
 * Sistema Cidades Frias, Corações Quentes
 */

class UIManager {
    constructor() {
        this.notifications = [];
        this.loadingElements = [];
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
    showInfo(message, duration = 4000) {
        this.showNotification(message, 'info', duration);
    }

    /**
     * Mostra notificação de aviso
     */
    showWarning(message, duration = 4000) {
        this.showNotification(message, 'warning', duration);
    }

    /**
     * Cria e exibe notificação
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} position-fixed notification`;
        notification.style.cssText = `
            top: 20px; 
            right: 20px; 
            z-index: 9999; 
            min-width: 300px; 
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border-radius: 8px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        const icon = this.getIconForType(type);
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="${icon} me-2"></i>
                <span class="flex-grow-1">${message}</span>
                <button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;
        
        document.body.appendChild(notification);
        this.notifications.push(notification);
        
        // Auto remove após duração especificada
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, duration);
    }

    /**
     * Retorna ícone baseado no tipo de notificação
     */
    getIconForType(type) {
        const icons = {
            'success': 'fas fa-check-circle',
            'danger': 'fas fa-exclamation-circle',
            'info': 'fas fa-info-circle',
            'warning': 'fas fa-exclamation-triangle'
        };
        return icons[type] || 'fas fa-info-circle';
    }

    /**
     * Mostra loading overlay
     */
    showLoading(message = 'Carregando...') {
        const loading = document.createElement('div');
        loading.id = 'ui-loading-overlay';
        loading.className = 'position-fixed loading-overlay';
        loading.style.cssText = `
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        loading.innerHTML = `
            <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">Carregando...</span>
            </div>
            <p class="text-white">${message}</p>
        `;
        
        document.body.appendChild(loading);
        this.loadingElements.push(loading);
    }

    /**
     * Esconde loading overlay
     */
    hideLoading() {
        this.loadingElements.forEach(loading => {
            if (loading.parentElement) {
                loading.remove();
            }
        });
        this.loadingElements = [];
    }

    /**
     * Cria modal de confirmação
     */
    showConfirm(title, message, onConfirm, onCancel = null) {
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
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            Cancelar
                        </button>
                        <button type="button" class="btn btn-primary" id="confirm-btn">
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
        
        // Event listeners
        document.getElementById('confirm-btn').addEventListener('click', () => {
            bootstrapModal.hide();
            if (onConfirm) onConfirm();
            modal.remove();
        });
        
        modal.addEventListener('hidden.bs.modal', () => {
            if (onCancel) onCancel();
            modal.remove();
        });
    }

    /**
     * Atualiza progress bar
     */
    updateProgress(percentage, message = '') {
        let progressBar = document.getElementById('ui-progress-bar');
        
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.id = 'ui-progress-bar';
            progressBar.className = 'position-fixed';
            progressBar.style.cssText = `
                top: 0;
                left: 0;
                width: 100%;
                height: 4px;
                z-index: 10001;
                background: rgba(0,0,0,0.1);
            `;
            
            progressBar.innerHTML = `
                <div class="progress-bar bg-primary" style="width: 0%; transition: width 0.3s ease;"></div>
            `;
            
            document.body.appendChild(progressBar);
        }
        
        const bar = progressBar.querySelector('.progress-bar');
        bar.style.width = `${percentage}%`;
        
        if (message) {
            this.showInfo(message, 2000);
        }
    }

    /**
     * Esconde progress bar
     */
    hideProgress() {
        const progressBar = document.getElementById('ui-progress-bar');
        if (progressBar) {
            progressBar.remove();
        }
    }

    /**
     * Limpa todas as notificações
     */
    clearNotifications() {
        this.notifications.forEach(notification => {
            if (notification.parentElement) {
                notification.remove();
            }
        });
        this.notifications = [];
    }

    /**
     * Anima elemento
     */
    animateElement(element, animation, duration = 300) {
        element.style.animation = `${animation} ${duration}ms ease-out`;
        
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }

    /**
     * Scroll suave para elemento
     */
    scrollToElement(element, offset = 0) {
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }
}

// Instância global do UIManager
window.UIManager = new UIManager();

// Adiciona estilos CSS para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification {
        animation: slideInRight 0.3s ease-out;
    }
`;
document.head.appendChild(style);