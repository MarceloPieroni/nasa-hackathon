from flask import Flask, render_template, request, jsonify, send_file, session, redirect, url_for
import pandas as pd
import folium
import os
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
import tempfile
import json
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

class HeatIslandAnalyzer:
    def __init__(self, csv_file):
        self.data = pd.read_csv(csv_file)
        self.process_data()
    
    def process_data(self):
        """Processa os dados e calcula o índice de criticidade"""
        # Calcula índice de criticidade: temperatura - NDVI * 10
        self.data['indice_criticidade'] = self.data['temperatura'] - (self.data['ndvi'] * 10)
        
        # Classifica as zonas baseado no índice
        def classify_zone(index):
            if index > 35:
                return 'Crítica'
            elif index > 25:
                return 'Média'
            else:
                return 'Segura'
        
        self.data['classificacao'] = self.data['indice_criticidade'].apply(classify_zone)
        
        # Define cores para cada classificação
        color_map = {
            'Crítica': '#FF4444',    # Vermelho
            'Média': '#FFA500',      # Laranja
            'Segura': '#44FF44'      # Verde
        }
        self.data['cor'] = self.data['classificacao'].map(color_map)
    
    def get_zone_data(self, zone_id):
        """Retorna dados de uma zona específica"""
        zone = self.data[self.data['id'] == zone_id]
        if zone.empty:
            return None
        
        zone_data = zone.iloc[0]
        classificacao = zone_data['classificacao']
        
        # Usa configurações do sistema para sugestões
        suggestions = Config.ACTION_SUGGESTIONS.get(classificacao, {})
        
        return {
            'id': zone_data['id'],
            'nome': zone_data['nome'],
            'regiao': zone_data.get('regiao', 'São Paulo'),
            'temperatura': zone_data['temperatura'],
            'ndvi': zone_data['ndvi'],
            'densidade_populacional': zone_data['densidade_populacional'],
            'indice_criticidade': round(zone_data['indice_criticidade'], 2),
            'classificacao': zone_data['classificacao'],
            'acao_sugerida': suggestions.get('action', 'Ação não definida'),
            'custo_estimado': suggestions.get('cost_range', 'Custo não estimado'),
            'especies_recomendadas': suggestions.get('species', 'Espécies não definidas'),
            'volunteer_message': suggestions.get('volunteer_message', ''),
            'volunteer_description': suggestions.get('volunteer_description', '')
        }
    
    def generate_report_data(self):
        """Gera dados para o relatório PDF"""
        report_data = []
        for _, row in self.data.iterrows():
            report_data.append({
                'bairro': row['nome'],
                'temperatura': row['temperatura'],
                'ndvi': row['ndvi'],
                'densidade': row['densidade_populacional'],
                'criticidade': row['indice_criticidade'],
                'classificacao': row['classificacao']
            })
        
        # Ordena por criticidade (maior primeiro)
        report_data.sort(key=lambda x: x['criticidade'], reverse=True)
        return report_data

# Inicializa o analisador com dados de São Paulo
analyzer = HeatIslandAnalyzer(Config.CSV_FILE_PATH)

@app.route('/')
def index():
    """Página principal - redireciona baseado no perfil do usuário"""
    if 'user_profile' not in session:
        return redirect(url_for('login'))
    
    if session['user_profile'] == 'gestor':
        return render_template('gestor/dashboard.html')
    elif session['user_profile'] == 'voluntario':
        return render_template('voluntario/dashboard.html')
    else:
        return redirect(url_for('login'))

@app.route('/login')
def login():
    """Página de login com seleção de perfil"""
    return render_template('auth/login.html')

@app.route('/auth/login', methods=['POST'])
def auth_login():
    """Processa login do usuário"""
    data = request.get_json()
    profile = data.get('profile')
    
    if profile in ['gestor', 'voluntario']:
        # Simula login - em produção seria autenticação real
        session['user_profile'] = profile
        session['user_name'] = Config.USER_PROFILES[profile.upper()]['name']
        session['profile_name'] = Config.USER_PROFILES[profile.upper()]['name']
        
        return jsonify({
            'success': True,
            'message': f'Login realizado como {profile}',
            'redirect': url_for('index')
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Perfil inválido'
        }), 400

@app.route('/logout')
def logout():
    """Logout do usuário"""
    session.clear()
    return redirect(url_for('login'))

@app.route('/api/zones')
def get_zones():
    """Retorna dados de todas as zonas para o mapa"""
    zones_data = []
    for _, row in analyzer.data.iterrows():
        zones_data.append({
            'id': row['id'],
            'nome': row['nome'],
            'regiao': row.get('regiao', 'São Paulo'),  # Adiciona região se disponível
            'latitude': row['latitude'],
            'longitude': row['longitude'],
            'temperatura': row['temperatura'],
            'ndvi': row['ndvi'],
            'densidade_populacional': row['densidade_populacional'],
            'indice_criticidade': round(row['indice_criticidade'], 2),
            'classificacao': row['classificacao'],
            'cor': row['cor']
        })
    
    return jsonify(zones_data)

@app.route('/api/zone/<int:zone_id>')
def get_zone(zone_id):
    """Retorna dados detalhados de uma zona específica"""
    zone_data = analyzer.get_zone_data(zone_id)
    if zone_data:
        return jsonify(zone_data)
    else:
        return jsonify({'error': 'Zona não encontrada'}), 404

@app.route('/api/report')
def generate_report():
    """Gera e retorna relatório PDF"""
    report_data = analyzer.generate_report_data()
    
    # Cria arquivo temporário para o PDF
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
    temp_file.close()
    
    # Cria o PDF
    doc = SimpleDocTemplate(temp_file.name, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    # Título
    title = Paragraph("Relatório de Ilhas de Calor Urbano", styles['Title'])
    story.append(title)
    story.append(Spacer(1, 12))
    
    # Data de geração
    date_para = Paragraph(f"Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M')}", styles['Normal'])
    story.append(date_para)
    story.append(Spacer(1, 20))
    
    # Tabela de dados
    table_data = [['Bairro', 'Temp (°C)', 'NDVI', 'Densidade', 'Criticidade', 'Classificação']]
    
    for data in report_data:
        table_data.append([
            data['bairro'],
            f"{data['temperatura']:.1f}",
            f"{data['ndvi']:.2f}",
            f"{data['densidade']:.0f}",
            f"{data['criticidade']:.2f}",
            data['classificacao']
        ])
    
    table = Table(table_data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    story.append(table)
    story.append(Spacer(1, 20))
    
    # Resumo de ações
    story.append(Paragraph("Resumo de Ações Recomendadas:", styles['Heading2']))
    
    criticas = len([d for d in report_data if d['classificacao'] == 'Crítica'])
    medias = len([d for d in report_data if d['classificacao'] == 'Média'])
    seguras = len([d for d in report_data if d['classificacao'] == 'Segura'])
    
    story.append(Paragraph(f"• Zonas Críticas: {criticas} bairros", styles['Normal']))
    story.append(Paragraph(f"• Zonas Médias: {medias} bairros", styles['Normal']))
    story.append(Paragraph(f"• Zonas Seguras: {seguras} bairros", styles['Normal']))
    
    story.append(Spacer(1, 12))
    story.append(Paragraph("Ações Prioritárias:", styles['Heading3']))
    story.append(Paragraph("1. Implementar telhados verdes em zonas críticas", styles['Normal']))
    story.append(Paragraph("2. Plantio de árvores de grande porte em corredores verdes", styles['Normal']))
    story.append(Paragraph("3. Criação de parques e áreas de lazer com vegetação", styles['Normal']))
    story.append(Paragraph("4. Implementação de pavimentos permeáveis", styles['Normal']))
    
    doc.build(story)
    
    return send_file(temp_file.name, as_attachment=True, download_name='relatorio_ilhas_calor.pdf')

if __name__ == '__main__':
    # Cria diretório de dados se não existir
    os.makedirs('data', exist_ok=True)
    app.run(debug=True, host='0.0.0.0', port=5000)
