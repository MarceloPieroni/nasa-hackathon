/**
 * Theme Manager - Componente para gerenciar temas (modo escuro/claro)
 * Sistema Clima Vida - NASA Space Apps Hackathon 2025
 */

class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.themes = {
            light: {
                name: 'Claro',
                icon: 'fa-sun',
                description: 'Tema claro padrão'
            },
            dark: {
                name: 'Escuro',
                icon: 'fa-moon',
                description: 'Tema escuro para melhor visibilidade noturna'
            }
        };
        this.init();
    }

    /**
     * Inicializa o gerenciador de temas
     */
    init() {
        // Detecta tema preferido do sistema
        const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        
        // Carrega tema salvo ou usa preferência do sistema
        this.currentTheme = localStorage.getItem('clima-vida-theme') || systemPreference;
        
        // Aplica tema inicial
        this.applyTheme(this.currentTheme);
        
        // Configura listener para mudanças de preferência do sistema
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('clima-vida-theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
        
        // Cria seletor de tema se não existir
        this.createThemeSelector();
        
        console.log(`🎨 Theme Manager inicializado com tema: ${this.currentTheme}`);
    }

    /**
     * Aplica um tema
     */
    applyTheme(theme) {
        if (!this.themes[theme]) {
            console.warn(`Tema '${theme}' não encontrado`);
            return;
        }

        const html = document.documentElement;
        html.setAttribute('data-theme', theme);
        html.classList.remove('theme-light', 'theme-dark');
        html.classList.add(`theme-${theme}`);
        
        // Atualiza meta theme-color
        this.updateMetaThemeColor(theme);
        
        // Dispara evento customizado
        const event = new CustomEvent('themeChanged', {
            detail: { theme, themeData: this.themes[theme] }
        });
        document.dispatchEvent(event);
        
        console.log(`🎨 Tema aplicado: ${theme}`);
    }

    /**
     * Define um novo tema
     */
    setTheme(theme) {
        if (!this.themes[theme]) {
            console.warn(`Tema '${theme}' não encontrado`);
            return;
        }

        this.currentTheme = theme;
        localStorage.setItem('clima-vida-theme', theme);
        this.applyTheme(theme);
        
        // Atualiza seletor se existir
        this.updateThemeSelector();
    }

    /**
     * Alterna entre temas claro e escuro
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        return newTheme;
    }

    /**
     * Retorna o tema atual
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Retorna dados do tema atual
     */
    getCurrentThemeData() {
        return this.themes[this.currentTheme];
    }

    /**
     * Retorna todos os temas disponíveis
     */
    getAvailableThemes() {
        return this.themes;
    }

    /**
     * Atualiza meta theme-color
     */
    updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        const colors = {
            light: '#2E86AB',
            dark: '#1a1a1a'
        };
        
        metaThemeColor.content = colors[theme] || colors.light;
    }

    /**
     * Cria seletor de tema
     */
    createThemeSelector() {
        // Verifica se já existe
        if (document.getElementById('themeSelector')) {
            return;
        }

        // Cria container
        const container = document.createElement('div');
        container.id = 'themeSelector';
        container.className = 'theme-selector position-fixed';
        container.style.cssText = `
            top: 1rem;
            right: 1rem;
            z-index: 1080;
        `;

        // Cria botão
        const button = document.createElement('button');
        button.className = 'btn btn-outline-primary btn-sm';
        button.setAttribute('aria-label', 'Alternar tema');
        button.setAttribute('title', 'Alternar entre tema claro e escuro');
        
        const icon = document.createElement('i');
        icon.className = `fas ${this.themes[this.currentTheme].icon}`;
        button.appendChild(icon);

        // Adiciona evento
        button.addEventListener('click', () => {
            const newTheme = this.toggleTheme();
            const newIcon = this.themes[newTheme].icon;
            icon.className = `fas ${newIcon}`;
            
            // Feedback visual
            button.classList.add('btn-primary');
            setTimeout(() => {
                button.classList.remove('btn-primary');
                button.classList.add('btn-outline-primary');
            }, 200);
        });

        container.appendChild(button);
        document.body.appendChild(container);
    }

    /**
     * Atualiza seletor de tema
     */
    updateThemeSelector() {
        const button = document.querySelector('#themeSelector button');
        const icon = document.querySelector('#themeSelector i');
        
        if (button && icon) {
            icon.className = `fas ${this.themes[this.currentTheme].icon}`;
        }
    }

    /**
     * Cria menu de seleção de tema
     */
    createThemeMenu() {
        const container = document.createElement('div');
        container.className = 'dropdown position-fixed';
        container.style.cssText = `
            top: 1rem;
            right: 1rem;
            z-index: 1080;
        `;

        const button = document.createElement('button');
        button.className = 'btn btn-outline-primary btn-sm dropdown-toggle';
        button.setAttribute('data-bs-toggle', 'dropdown');
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-label', 'Selecionar tema');
        
        const icon = document.createElement('i');
        icon.className = `fas ${this.themes[this.currentTheme].icon} me-1`;
        button.appendChild(icon);
        button.appendChild(document.createTextNode('Tema'));

        const menu = document.createElement('ul');
        menu.className = 'dropdown-menu dropdown-menu-end';

        Object.entries(this.themes).forEach(([key, theme]) => {
            const item = document.createElement('li');
            const link = document.createElement('a');
            link.className = 'dropdown-item d-flex align-items-center';
            link.href = '#';
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.setTheme(key);
            });

            const itemIcon = document.createElement('i');
            itemIcon.className = `fas ${theme.icon} me-2`;
            
            const text = document.createElement('span');
            text.textContent = theme.name;

            link.appendChild(itemIcon);
            link.appendChild(text);
            item.appendChild(link);
            menu.appendChild(item);
        });

        container.appendChild(button);
        container.appendChild(menu);
        document.body.appendChild(container);
    }

    /**
     * Adiciona tema personalizado
     */
    addCustomTheme(key, themeData) {
        this.themes[key] = themeData;
        console.log(`🎨 Tema personalizado adicionado: ${key}`);
    }

    /**
     * Remove tema personalizado
     */
    removeCustomTheme(key) {
        if (key === 'light' || key === 'dark') {
            console.warn('Não é possível remover temas padrão');
            return;
        }
        
        delete this.themes[key];
        console.log(`🎨 Tema removido: ${key}`);
    }

    /**
     * Exporta configurações de tema
     */
    exportThemeSettings() {
        return {
            currentTheme: this.currentTheme,
            availableThemes: this.themes,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Importa configurações de tema
     */
    importThemeSettings(settings) {
        if (settings.currentTheme && this.themes[settings.currentTheme]) {
            this.setTheme(settings.currentTheme);
        }
        
        if (settings.availableThemes) {
            Object.assign(this.themes, settings.availableThemes);
        }
        
        console.log('🎨 Configurações de tema importadas');
    }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    window.themeManager = new ThemeManager();
});

// Exporta a classe
window.ThemeManager = ThemeManager;
