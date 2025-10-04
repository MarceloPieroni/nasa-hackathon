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
        
        zone_data = zone.iloc[0].to_dict()
        
        # Adiciona sugestões de ações baseadas na classificação
        classification = zone_data['classificacao']
        if classification in Config.ACTION_SUGGESTIONS:
            zone_data['action_suggestion'] = Config.ACTION_SUGGESTIONS[classification]
        
        return zone_data
    
    def get_report_data(self):
        """Retorna dados formatados para relatório"""
        report_data = []
        for _, row in self.data.iterrows():
            report_data.append({
                'nome': row['nome'],
                'regiao': row.get('regiao', 'São Paulo'),
                'temperatura': round(row['temperatura'], 1),
                'ndvi': round(row['ndvi'], 2),
                'densidade_populacional': int(row['densidade_populacional']),
                'criticidade': round(row['indice_criticidade'], 1),
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
    elif session['user_profile'] == 'civil':
        return render_template('civil/dashboard.html')
    else:
        return redirect(url_for('login'))

@app.route('/login')
def login():
    """Página de login"""
    return render_template('auth/login.html')

@app.route('/auth/login', methods=['POST'])
def auth_login():
    """Autenticação de login"""
    profile = request.form.get('profile')
    
    if profile in ['gestor', 'civil']:
        session['user_profile'] = profile
        return jsonify({'success': True, 'redirect': url_for('index')})
    else:
        return jsonify({'success': False, 'error': 'Perfil inválido'})

@app.route('/logout')
def logout():
    """Logout do usuário"""
    session.pop('user_profile', None)
    return redirect(url_for('login'))

@app.route('/relatorios')
def relatorios():
    """
    Página de relatórios interativos
    """
    # Verifica se o usuário está logado
    if 'user_profile' not in session:
        return redirect(url_for('login'))
    
    # Apenas gestores podem acessar relatórios detalhados
    if session['user_profile'] != 'gestor':
        return redirect(url_for('index'))
    
    # Prepara dados para o template
    zones_data = []
    for _, row in analyzer.data.iterrows():
        zones_data.append({
            'nome': row['nome'],
            'regiao': row.get('regiao', 'São Paulo'),
            'temperatura': float(row['temperatura']),
            'ndvi': float(row['ndvi']),
            'densidade_populacional': int(row['densidade_populacional']),
            'indice_criticidade': float(row['indice_criticidade']),
            'classificacao': row['classificacao']
        })
    
    return render_template('relatorios.html', zones=zones_data)

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
    
    if zone_data is None:
        return jsonify({'error': 'Zona não encontrada'}), 404
    
    return jsonify(zone_data)

@app.route('/api/report')
def generate_report():
    """Gera e retorna relatório PDF"""
    try:
        # Cria arquivo temporário
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        temp_file.close()
        
        # Cria o documento PDF
        doc = SimpleDocTemplate(temp_file.name, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        
        # Título
        title = Paragraph(Config.PDF_TITLE, styles['Title'])
        story.append(title)
        story.append(Spacer(1, 12))
        
        # Subtítulo
        subtitle = Paragraph(Config.PDF_SUBTITLE, styles['Heading2'])
        story.append(subtitle)
        story.append(Spacer(1, 12))
        
        # Data
        date_str = datetime.now().strftime("%d/%m/%Y %H:%M")
        date_para = Paragraph(f"Gerado em: {date_str}", styles['Normal'])
        story.append(date_para)
        story.append(Spacer(1, 20))
        
        # Dados do relatório
        report_data = analyzer.get_report_data()
        
        # Cabeçalho da tabela
        table_data = [['Zona', 'Região', 'Temp. (°C)', 'NDVI', 'Densidade', 'Criticidade', 'Classificação']]
        
        # Adiciona dados das zonas
        for zone in report_data:
            table_data.append([
                zone['nome'],
                zone['regiao'],
                str(zone['temperatura']),
                str(zone['ndvi']),
                f"{zone['densidade_populacional']:,}",
                str(zone['criticidade']),
                zone['classificacao']
            ])
        
        # Cria a tabela
        table = Table(table_data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(table)
        
        # Constrói o PDF
        doc.build(story)
        
        # Retorna o arquivo
        return send_file(temp_file.name, as_attachment=True, download_name=f'relatorio_ilhas_calor_{datetime.now().strftime("%Y%m%d_%H%M")}.pdf')
        
    except Exception as e:
        return jsonify({'error': f'Erro ao gerar relatório: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)