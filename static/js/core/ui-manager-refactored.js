/**
 * UI Manager Refatorado - Sistema Clima Vida
 * Gerenciador de interface com melhor UX e feedback visual
 */

class UIManager {
    constructor() {
        this.notifications = [];
        this.loadingElements = [];
        this.modals = new Map();
        this.toastContainer = null;
        this._initializeToastContainer();
    }

    /**
     * Inicializa o container de toasts
     */
    _initializeToastContainer() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.id = 'toast-container';
        this.toastContainer.className = 'toast-container';
        this.toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
            pointer-events: none;
        `;
        document.body.appendChild(this.toastContainer);
    }

    /**
     * Mostra notificação de sucesso
     */
    showSuccess(message, duration = 3000) {
        this._showNotification(message, 'success', duration, 'fas fa-check-circle');
    }

    /**
     * Mostra notificação de erro
     */
    showError(message, duration = 5000) {
        this._showNotification(message, 'danger', duration, 'fas fa-exclamation-circle');
    }

    /**
     * Mostra notificação de informação
     */
    showInfo(message, duration = 4000) {
        this._showNotification(message, 'info', duration, 'fas fa-info-circle');
    }

    /**
     * Mostra notificação de aviso
     */
    showWarning(message, duration = 4000) {
        this._showNotification(message, 'warning', duration, 'fas fa-exclamation-triangle');
    }

    /**
     * Cria e exibe notificação toast
     */
    _showNotification(message, type = 'info', duration = 3000, icon = 'fas fa-info-circle') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            background: ${this._getToastColor(type)};
            color: white;
            padding: 16px 20px;
            margin-bottom: 10px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease-out;
            pointer-events: auto;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 12px;
            max-width: 100%;
            word-wrap: break-word;
        `;
        
        toast.innerHTML = `
            <i class="${icon}" style="font-size: 18px; flex-shrink: 0;"></i>
            <span style="flex-grow: 1; font-size: 14px; line-height: 1.4;">${message}</span>
            <button type="button" class="toast-close" style="
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                margin-left: 8px;
                opacity: 0.7;
                transition: opacity 0.2s;
            ">&times;</button>
        `;
        
        this.toastContainer.appendChild(toast);
        this.notifications.push(toast);
        
        // Anima entrada
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 10);
        
        // Event listeners
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this._removeToast(toast));
        closeBtn.addEventListener('mouseenter', () => closeBtn.style.opacity = '1');
        closeBtn.addEventListener('mouseleave', () => closeBtn.style.opacity = '0.7');
        
        // Auto remove
        setTimeout(() => {
            this._removeToast(toast);
        }, duration);
    }

    /**
     * Remove toast com animação
     */
    _removeToast(toast) {
        if (!toast.parentElement) return;
        
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
            const index = this.notifications.indexOf(toast);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 300);
    }

    /**
     * Retorna cor do toast baseada no tipo
     */
    _getToastColor(type) {
        const colors = {
            'success': '#28a745',
            'danger': '#dc3545',
            'info': '#17a2b8',
            'warning': '#ffc107'
        };
        return colors[type] || colors['info'];
    }

    /**
     * Mostra loading overlay
     */
    showLoading(message = 'Carregando...', id = 'default-loading') {
        // Remove loading existente com mesmo ID
        this.hideLoading(id);
        
        const loading = document.createElement('div');
        loading.id = `ui-loading-${id}`;
        loading.className = 'loading-overlay';
        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            backdrop-filter: blur(2px);
        `;
        
        loading.innerHTML = `
            <div class="loading-spinner" style="
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255,255,255,0.3);
                border-top: 4px solid #fff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 20px;
            "></div>
            <p style="
                color: white;
                font-size: 16px;
                margin: 0;
                text-align: center;
                max-width: 300px;
            ">${message}</p>
        `;
        
        // Adiciona animação CSS se não existir
        if (!document.querySelector('#loading-spinner-style')) {
            const style = document.createElement('style');
            style.id = 'loading-spinner-style';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(loading);
        this.loadingElements.push(loading);
    }

    /**
     * Esconde loading overlay
     */
    hideLoading(id = 'default-loading') {
        const loadingId = `ui-loading-${id}`;
        const loading = document.getElementById(loadingId);
        
        if (loading) {
            loading.remove();
            const index = this.loadingElements.indexOf(loading);
            if (index > -1) {
                this.loadingElements.splice(index, 1);
            }
        }
    }

    /**
     * Cria modal de confirmação
     */
    showConfirm(title, message, onConfirm, onCancel = null, options = {}) {
        const modalId = `confirm-modal-${Date.now()}`;
        
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header" style="border-bottom: 1px solid #dee2e6;">
                        <h5 class="modal-title" style="margin: 0; font-weight: 600;">
                            <i class="fas fa-question-circle text-warning me-2"></i>
                            ${title}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" style="padding: 20px;">
                        <p style="margin: 0; font-size: 15px; line-height: 1.5;">${message}</p>
                    </div>
                    <div class="modal-footer" style="border-top: 1px solid #dee2e6; padding: 15px 20px;">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-1"></i>
                            ${options.cancelText || 'Cancelar'}
                        </button>
                        <button type="button" class="btn ${options.confirmClass || 'btn-primary'}" id="confirm-btn">
                            <i class="fas fa-check me-1"></i>
                            ${options.confirmText || 'Confirmar'}
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
            this._cleanupModal(modal);
        });
        
        modal.addEventListener('hidden.bs.modal', () => {
            if (onCancel) onCancel();
            this._cleanupModal(modal);
        });
        
        this.modals.set(modalId, modal);
    }

    /**
     * Atualiza progress bar
     */
    updateProgress(percentage, message = '', id = 'default-progress') {
        let progressContainer = document.getElementById(`progress-${id}`);
        
        if (!progressContainer) {
            progressContainer = document.createElement('div');
            progressContainer.id = `progress-${id}`;
            progressContainer.className = 'progress-container';
            progressContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 4px;
                z-index: 10001;
                background: rgba(0,0,0,0.1);
            `;
            
            progressContainer.innerHTML = `
                <div class="progress-bar" style="
                    height: 100%;
                    background: linear-gradient(90deg, #007bff, #0056b3);
                    width: 0%;
                    transition: width 0.3s ease;
                    border-radius: 0 2px 2px 0;
                "></div>
            `;
            
            document.body.appendChild(progressContainer);
        }
        
        const bar = progressContainer.querySelector('.progress-bar');
        bar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
        
        if (message) {
            this.showInfo(message, 2000);
        }
    }

    /**
     * Esconde progress bar
     */
    hideProgress(id = 'default-progress') {
        const progressContainer = document.getElementById(`progress-${id}`);
        if (progressContainer) {
            progressContainer.remove();
        }
    }

    /**
     * Limpa todas as notificações
     */
    clearNotifications() {
        this.notifications.forEach(toast => {
            this._removeToast(toast);
        });
    }

    /**
     * Anima elemento
     */
    animateElement(element, animation, duration = 300) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (!element) return;
        
        element.style.animation = `${animation} ${duration}ms ease-out`;
        
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }

    /**
     * Scroll suave para elemento
     */
    scrollToElement(element, offset = 0) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (!element) return;
        
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Mostra tooltip customizado
     */
    showTooltip(element, message, position = 'top') {
        const tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip';
        tooltip.textContent = message;
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            z-index: 10000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s;
        `;
        
        document.body.appendChild(tooltip);
        
        const updatePosition = () => {
            const rect = element.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            
            let top, left;
            
            switch (position) {
                case 'top':
                    top = rect.top - tooltipRect.height - 8;
                    left = rect.left + (rect.width - tooltipRect.width) / 2;
                    break;
                case 'bottom':
                    top = rect.bottom + 8;
                    left = rect.left + (rect.width - tooltipRect.width) / 2;
                    break;
                case 'left':
                    top = rect.top + (rect.height - tooltipRect.height) / 2;
                    left = rect.left - tooltipRect.width - 8;
                    break;
                case 'right':
                    top = rect.top + (rect.height - tooltipRect.height) / 2;
                    left = rect.right + 8;
                    break;
            }
            
            tooltip.style.top = `${top}px`;
            tooltip.style.left = `${left}px`;
        };
        
        updatePosition();
        tooltip.style.opacity = '1';
        
        // Remove tooltip após 3 segundos
        setTimeout(() => {
            tooltip.style.opacity = '0';
            setTimeout(() => {
                if (tooltip.parentElement) {
                    tooltip.remove();
                }
            }, 200);
        }, 3000);
    }

    // ========================================================================
    // MÉTODOS PRIVADOS
    // ========================================================================

    /**
     * Limpa modal
     */
    _cleanupModal(modal) {
        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 300);
    }
}

// Instância global do UIManager
window.UIManager = new UIManager();
