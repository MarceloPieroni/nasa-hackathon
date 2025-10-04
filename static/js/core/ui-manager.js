/**
 * UI Manager - Gerenciador de Interface
 * Sistema Cidades Frias, Corações Quentes
 */

class UIManager {
    constructor() {
        this.notifications = [];
    }

    /**
     * Mostra notificação de sucesso
     */
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    /**
     * Mostra notificação de erro
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Mostra notificação de aviso
     */
    showWarning(message) {
        this.showNotification(message, 'warning');
    }

    /**
     * Mostra notificação de informação
     */
    showInfo(message) {
        this.showNotification(message, 'info');
    }

    /**
     * Mostra notificação genérica
     */
    showNotification(message, type = 'info') {
        const notification = this.createNotification(message, type);
        document.body.appendChild(notification);
        
        // Anima entrada
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remove após 5 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
        
        console.log(`📢 Notificação ${type}:`, message);
    }

    /**
     * Cria elemento de notificação
     */
    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = this.getIconForType(type);
        const color = this.getColorForType(type);
        
        notification.innerHTML = `
            <div class="notification-content" style="border-left: 4px solid ${color};">
                <i class="fas ${icon}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        return notification;
    }

    /**
     * Retorna ícone para tipo de notificação
     */
    getIconForType(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    }

    /**
     * Retorna cor para tipo de notificação
     */
    getColorForType(type) {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        return colors[type] || '#17a2b8';
    }

    /**
     * Mostra loading
     */
    showLoading(message = 'Carregando...') {
        const loading = document.getElementById('loading');
        if (loading) {
            const messageElement = loading.querySelector('p');
            if (messageElement) {
                messageElement.textContent = message;
            }
            loading.style.display = 'flex';
        }
    }

    /**
     * Esconde loading
     */
    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    /**
     * Atualiza progresso
     */
    updateProgress(percent, message = '') {
        const progressBar = document.getElementById('progress-bar');
        const progressMessage = document.getElementById('progress-message');
        
        if (progressBar) {
            progressBar.style.width = `${percent}%`;
            progressBar.setAttribute('aria-valuenow', percent);
        }
        
        if (progressMessage && message) {
            progressMessage.textContent = message;
        }
    }
}

// Instância global do UIManager
window.UIManager = new UIManager();