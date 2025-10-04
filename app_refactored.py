"""
Sistema Clima Vida - NASA Space Apps Hackathon
Aplicação Flask principal refatorada
"""

from flask import Flask, render_template, request, jsonify, send_file, session, redirect, url_for
import os
import logging
from datetime import datetime
from config import Config
from services.zone_service import ZoneService
from services.pdf_service import PDFService

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Inicializar Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Inicializar serviços
zone_service = ZoneService()
pdf_service = PDFService()

# ============================================================================
# ROTAS DE AUTENTICAÇÃO E NAVEGAÇÃO
# ============================================================================

@app.route('/')
def index():
    """
    Página principal - redireciona baseado no perfil do usuário
    """
    if 'user_profile' not in session:
        return redirect(url_for('login'))
    
    if session['user_profile'] == 'gestor':
        return render_template('gestor/dashboard.html')
    elif session['user_profile'] == 'civil':
        return render_template('civil/dashboard.html')
    else:
        return redirect(url_for('login'))

@app.route('/login')
def login():
    """
    Página de login com seleção de perfil
    """
    return render_template('auth/login.html')

@app.route('/auth/login', methods=['POST'])
def auth_login():
    """
    Processa login do usuário
    """
    try:
        data = request.get_json()
        profile = data.get('profile')
        
        if profile not in ['gestor', 'civil']:
            return jsonify({
                'success': False,
                'message': 'Perfil inválido'
            }), 400
        
        # Configura sessão do usuário
        session['user_profile'] = profile
        session['user_name'] = Config.USER_PROFILES[profile.upper()]['name']
        session['profile_name'] = Config.USER_PROFILES[profile.upper()]['name']
        
        logger.info(f"Login realizado: {profile}")
        
        return jsonify({
            'success': True,
            'message': f'Login realizado como {profile}',
            'redirect': url_for('index')
        })
        
    except Exception as e:
        logger.error(f"Erro no login: {e}")
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor'
        }), 500

@app.route('/logout')
def logout():
    """
    Logout do usuário
    """
    session.clear()
    logger.info("Logout realizado")
    return redirect(url_for('login'))

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.route('/api/zones')
def get_zones():
    """
    Retorna dados de todas as zonas para o mapa
    """
    try:
        zones_data = zone_service.get_all_zones()
        logger.info(f"Retornando {len(zones_data)} zonas")
        return jsonify(zones_data)
        
    except Exception as e:
        logger.error(f"Erro ao buscar zonas: {e}")
        return jsonify({'error': 'Erro ao carregar dados das zonas'}), 500

@app.route('/api/zone/<int:zone_id>')
def get_zone(zone_id):
    """
    Retorna dados detalhados de uma zona específica
    """
    try:
        zone_data = zone_service.get_zone_by_id(zone_id)
        
        if zone_data is None:
            return jsonify({'error': 'Zona não encontrada'}), 404
        
        logger.info(f"Retornando dados da zona {zone_id}")
        return jsonify(zone_data)
        
    except Exception as e:
        logger.error(f"Erro ao buscar zona {zone_id}: {e}")
        return jsonify({'error': 'Erro ao carregar dados da zona'}), 500

@app.route('/api/statistics')
def get_statistics():
    """
    Retorna estatísticas gerais das zonas
    """
    try:
        statistics = zone_service.get_statistics()
        logger.info("Retornando estatísticas gerais")
        return jsonify(statistics)
        
    except Exception as e:
        logger.error(f"Erro ao buscar estatísticas: {e}")
        return jsonify({'error': 'Erro ao carregar estatísticas'}), 500

@app.route('/api/report')
def generate_report():
    """
    Gera e retorna relatório PDF
    """
    try:
        # Busca dados necessários
        zones_data = zone_service.get_report_data()
        statistics = zone_service.get_statistics()
        
        if not zones_data:
            return jsonify({'error': 'Nenhum dado disponível para relatório'}), 404
        
        # Gera o PDF
        pdf_path = pdf_service.generate_heat_island_report(zones_data, statistics)
        
        logger.info("Relatório PDF gerado com sucesso")
        
        # Retorna o arquivo para download
        return send_file(
            pdf_path, 
            as_attachment=True, 
            download_name=f'relatorio_clima_vida_{datetime.now().strftime("%Y%m%d_%H%M")}.pdf',
            mimetype='application/pdf'
        )
        
    except Exception as e:
        logger.error(f"Erro ao gerar relatório: {e}")
        return jsonify({'error': 'Erro ao gerar relatório PDF'}), 500

@app.route('/api/zones/classification/<classification>')
def get_zones_by_classification(classification):
    """
    Retorna zonas filtradas por classificação
    """
    try:
        if classification not in ['Crítica', 'Média', 'Segura']:
            return jsonify({'error': 'Classificação inválida'}), 400
        
        zones_data = zone_service.get_zones_by_classification(classification)
        logger.info(f"Retornando {len(zones_data)} zonas {classification}")
        return jsonify(zones_data)
        
    except Exception as e:
        logger.error(f"Erro ao filtrar zonas por classificação: {e}")
        return jsonify({'error': 'Erro ao filtrar zonas'}), 500

# ============================================================================
# ROTAS DE ADMINISTRAÇÃO
# ============================================================================

@app.route('/admin/refresh-data')
def refresh_data():
    """
    Endpoint para recarregar dados (apenas para gestores)
    """
    if session.get('user_profile') != 'gestor':
        return jsonify({'error': 'Acesso negado'}), 403
    
    try:
        zone_service.refresh_data()
        logger.info("Dados recarregados por administrador")
        return jsonify({'success': True, 'message': 'Dados recarregados com sucesso'})
        
    except Exception as e:
        logger.error(f"Erro ao recarregar dados: {e}")
        return jsonify({'error': 'Erro ao recarregar dados'}), 500

@app.route('/health')
def health_check():
    """
    Endpoint de verificação de saúde da aplicação
    """
    try:
        stats = zone_service.get_statistics()
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'zones_loaded': stats['total_zones'],
            'version': '1.0.0'
        })
    except Exception as e:
        logger.error(f"Health check falhou: {e}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

# ============================================================================
# HANDLERS DE ERRO
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    """
    Handler para páginas não encontradas
    """
    return render_template('errors/404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    """
    Handler para erros internos
    """
    logger.error(f"Erro interno: {error}")
    return render_template('errors/500.html'), 500

# ============================================================================
# INICIALIZAÇÃO DA APLICAÇÃO
# ============================================================================

if __name__ == '__main__':
    # Cria diretórios necessários
    os.makedirs('data', exist_ok=True)
    os.makedirs('temp', exist_ok=True)
    
    # Log de inicialização
    logger.info("Iniciando Sistema Clima Vida")
    logger.info(f"Zonas carregadas: {zone_service.get_statistics()['total_zones']}")
    
    # Executa a aplicação
    app.run(
        debug=Config.DEBUG, 
        host='0.0.0.0', 
        port=5000,
        threaded=True
    )
