# 🏗️ Estrutura do Sistema Cidades Frias, Corações Quentes

## 📁 Organização de Arquivos

```
NASA!/
├── 📄 app.py                          # Backend Flask principal
├── ⚙️ config.py                       # Configurações do sistema
├── 📋 requirements.txt                # Dependências Python
├── 📖 README.md                       # Documentação principal
├── 🛠️ INSTALACAO_PYTHON.md           # Guia de instalação
├── 📊 README_ESTRUTURA.md             # Este arquivo - estrutura do projeto
├── 🧪 test_api.py                     # Testes da API
├── 🌐 demo_standalone.html            # Demo standalone
├── 🚀 run.bat                         # Script de inicialização
├── 🔧 start_app.ps1                   # Script PowerShell
│
├── 📁 models/                         # Modelos de dados
│   └── user_profile.py                # Perfis de usuário e modelos
│
├── 📁 utils/                          # Utilitários e processadores
│   └── zone_processor.py              # Processador de dados das zonas
│
├── 📁 templates/                      # Templates HTML
│   ├── base.html                      # Template base
│   ├── index.html                     # Página principal (legado)
│   ├── 📁 auth/                       # Autenticação
│   │   └── login.html                 # Página de login/seleção de perfil
│   ├── 📁 gestor/                     # Templates para gestores
│   │   └── dashboard.html             # Dashboard do gestor
│   └── 📁 voluntario/                 # Templates para voluntários
│       └── dashboard.html             # Dashboard do voluntário
│
├── 📁 static/                         # Arquivos estáticos
│   ├── 📁 css/                        # Estilos CSS
│   │   ├── main.css                   # Estilos principais
│   │   └── profile-specific.css       # Estilos específicos por perfil
│   ├── 📁 js/                         # JavaScript
│   │   ├── script.js                  # Script principal (legado)
│   │   ├── style.css                  # Estilos (legado)
│   │   ├── 📁 core/                   # JavaScript core
│   │   │   ├── map-manager.js         # Gerenciador do mapa
│   │   │   ├── data-manager.js        # Gerenciador de dados
│   │   │   └── ui-manager.js          # Gerenciador de UI
│   │   └── 📁 profiles/               # JavaScript específico por perfil
│   │       ├── gestor.js              # Lógica para gestores
│   │       └── voluntario.js          # Lógica para voluntários
│
└── 📁 data/                           # Dados do sistema
    ├── sample_data.csv                # Dados de exemplo (Rio de Janeiro)
    └── sp_zones_data.csv              # Dados de São Paulo (30 zonas)
```

## 🎯 Arquivos Principais para o Manus Implementar

### 1. **Backend Flask (app.py)**
- ✅ **JÁ CRIADO**: Sistema completo com API REST
- 🔧 **PRECISA**: Adicionar endpoints de autenticação e perfis
- 🔧 **PRECISA**: Adaptar para usar novos processadores

### 2. **Sistema de Autenticação**
- 📄 **CRIADO**: `templates/auth/login.html` - Página de seleção de perfil
- 📄 **CRIADO**: `models/user_profile.py` - Modelos de usuário
- 🔧 **PRECISA**: Implementar rotas de login/logout no Flask

### 3. **Templates por Perfil**
- 📄 **CRIADO**: `templates/gestor/dashboard.html` - Interface completa para gestores
- 📄 **CRIADO**: `templates/voluntario/dashboard.html` - Interface simplificada para voluntários
- 📄 **CRIADO**: `templates/base.html` - Template base com navegação

### 4. **JavaScript Modular**
- 📄 **CRIADO**: `static/js/core/map-manager.js` - Gerenciador do mapa
- 📄 **CRIADO**: `static/js/core/data-manager.js` - Gerenciador de dados
- 📄 **CRIADO**: `static/js/core/ui-manager.js` - Gerenciador de UI
- 📄 **CRIADO**: `static/js/profiles/gestor.js` - Lógica específica para gestores
- 📄 **CRIADO**: `static/js/profiles/voluntario.js` - Lógica específica para voluntários

### 5. **Estilos CSS**
- 📄 **CRIADO**: `static/css/main.css` - Estilos principais
- 📄 **CRIADO**: `static/css/profile-specific.css` - Estilos por perfil

### 6. **Dados de São Paulo**
- 📄 **CRIADO**: `data/sp_zones_data.csv` - 30 zonas de São Paulo
- 📄 **CRIADO**: `utils/zone_processor.py` - Processador de dados
- 📄 **CRIADO**: `config.py` - Configurações atualizadas

## 🚀 Próximos Passos para o Manus

### 1. **Implementar Sistema de Autenticação**
```python
# Adicionar ao app.py:
@app.route('/auth/login', methods=['POST'])
@app.route('/auth/logout')
@app.route('/login')
```

### 2. **Adaptar Rotas Existentes**
```python
# Modificar rotas para suportar perfis:
@app.route('/')
@app.route('/gestor')
@app.route('/voluntario')
```

### 3. **Testar Interface por Perfil**
- ✅ **Gestor**: Modal detalhado, relatórios PDF, estatísticas completas
- ✅ **Voluntário**: Modal simplificado, botão de ajuda, contato direto

### 4. **Validar Responsividade**
- ✅ **Desktop**: Interface completa com sidebar
- ✅ **Mobile**: Layout adaptado, modais responsivos

## 🎨 Diferenças Visuais por Perfil

### **Gestor Público** 👨‍💼
- **Cores**: Azul/Roxo (`#2E86AB` / `#A23B72`)
- **Interface**: Completa com estatísticas, relatórios, análises
- **Modal**: Detalhado com dados técnicos, custos, espécies
- **Ações**: Gerar PDF, exportar dados, filtrar zonas

### **Voluntário** 🌳
- **Cores**: Roxo/Laranja (`#A23B72` / `#F18F01`)
- **Interface**: Simplificada focada em ajuda
- **Modal**: Básico com status e botão de ação
- **Ações**: Contatar para ajudar, ver instruções

## 📊 Dados Preparados

### **30 Zonas de São Paulo**
- **Regiões**: Centro, Zona Sul, Zona Norte, Zona Leste, Zona Oeste, ABC, Grande SP
- **Temperaturas**: 37.8°C a 45.1°C (realistas para SP)
- **NDVI**: 0.08 a 0.68 (vegetação esparsa a densa)
- **Densidade**: 4.800 a 22.000 hab/km²

### **Classificações Automáticas**
- **Crítica**: 8 zonas (alta temperatura, baixa vegetação)
- **Média**: 12 zonas (temperatura moderada)
- **Segura**: 10 zonas (boa cobertura vegetal)

## ✅ Status Atual

### **100% Pronto para Implementação**
- ✅ Estrutura de arquivos organizada
- ✅ Templates HTML responsivos
- ✅ JavaScript modular e limpo
- ✅ CSS com design diferenciado por perfil
- ✅ Dados realistas de São Paulo
- ✅ Processadores de dados
- ✅ Sistema de configuração

### **Próximo: Implementação pelo Manus**
- 🔧 Adicionar rotas de autenticação no Flask
- 🔧 Conectar templates com backend
- 🔧 Testar fluxo completo por perfil
- 🔧 Validar responsividade em diferentes dispositivos

**🎉 O terreno está 100% preparado para a implementação dos perfis de usuário!**

