"""
Configurações do Sistema Cidades Frias, Corações Quentes
Sistema de Identificação de Ilhas de Calor Urbano - São Paulo
"""

import os

class Config:
    """Configurações base da aplicação"""
    
    # Configurações do Flask
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'cidades-frias-coracoes-quentes-sp-2025'
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    # Configurações de dados
    CSV_FILE_PATH = 'data/sp_zones_data.csv'
    
    # Configurações do mapa - São Paulo
    DEFAULT_LATITUDE = -23.5505
    DEFAULT_LONGITUDE = -46.6333
    DEFAULT_ZOOM = 11
    
    # Limites de classificação
    CRITICAL_THRESHOLD = 35
    MEDIUM_THRESHOLD = 25
    
    # Configurações de cores
    COLORS = {
        'critical': '#FF4444',    # Vermelho - Crítica
        'medium': '#FFA500',      # Laranja - Média  
        'safe': '#44FF44'         # Verde - Segura
    }
    
    # Configurações do relatório PDF
    PDF_TITLE = "Relatório de Ilhas de Calor - São Paulo"
    PDF_AUTHOR = "Cidades Frias, Corações Quentes"
    PDF_SUBTITLE = "Sistema de Análise Urbana"
    
    # Perfis de usuário
    USER_PROFILES = {
        'GESTOR': {
            'name': 'Gestor Público',
            'description': 'Acesso completo ao sistema com relatórios e análises detalhadas',
            'color': '#2E86AB',
            'icon': '👨‍💼'
        },
        'VOLUNTARIO': {
            'name': 'Voluntário de Arborização', 
            'description': 'Interface simplificada para identificação de zonas que precisam de ajuda',
            'color': '#A23B72',
            'icon': '🌳'
        }
    }
    
    # Sugestões de ações por classificação
    ACTION_SUGGESTIONS = {
        'Crítica': {
            'action': 'PRIORIDADE ALTA: Plantio urgente de árvores e criação de áreas verdes',
            'cost_range': 'R$ 50.000 - R$ 100.000',
            'species': 'Ipês, Sibipirunas, Flamboyants, Tipuanas',
            'volunteer_message': '🌳 Zona Crítica - Precisa de Arborização Urgente!',
            'volunteer_description': 'Esta zona tem alta temperatura e baixa cobertura vegetal. Sua ajuda fará a diferença!'
        },
        'Média': {
            'action': 'PRIORIDADE MÉDIA: Ampliação de áreas verdes e telhados verdes',
            'cost_range': 'R$ 20.000 - R$ 50.000', 
            'species': 'Resedás, Quaresmeiras, Palmeiras, Jambolões',
            'volunteer_message': '🌱 Zona Média - Pode Melhorar com Arborização',
            'volunteer_description': 'Esta zona pode se beneficiar muito com mais vegetação. Toda ajuda é bem-vinda!'
        },
        'Segura': {
            'action': 'MANUTENÇÃO: Preservar áreas verdes existentes',
            'cost_range': 'R$ 5.000 - R$ 15.000',
            'species': 'Manutenção do verde existente',
            'volunteer_message': '✅ Zona Segura - Verde Bem Preservado',
            'volunteer_description': 'Esta zona está bem cuidada, mas sempre pode melhorar!'
        }
    }
    
    # Configurações de contato para voluntários
    VOLUNTEER_CONTACT = {
        'email': 'voluntarios@cidadesfrias.com.br',
        'phone': '(11) 99999-9999',
        'website': 'https://cidadesfrias.com.br/voluntarios'
    }