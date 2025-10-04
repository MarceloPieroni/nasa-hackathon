"""
Processador de Dados de Zonas para o Sistema Cidades Frias, Corações Quentes
"""

import pandas as pd
from typing import Dict, List, Any, Optional
from config import Config

class ZoneProcessor:
    """Classe para processar dados das zonas de calor urbano"""
    
    def __init__(self, csv_file: str = None):
        """Inicializa o processador com dados do CSV"""
        self.csv_file = csv_file or Config.CSV_FILE_PATH
        self.data = None
        self.process_data()
    
    def process_data(self):
        """Processa os dados e calcula métricas de criticidade"""
        try:
            self.data = pd.read_csv(self.csv_file)
            
            # Calcula índice de criticidade: temperatura - NDVI * 10
            self.data['indice_criticidade'] = (
                self.data['temperatura'] - (self.data['ndvi'] * 10)
            )
            
            # Classifica as zonas
            def classify_zone(index):
                if index > Config.CRITICAL_THRESHOLD:
                    return 'Crítica'
                elif index > Config.MEDIUM_THRESHOLD:
                    return 'Média'
                else:
                    return 'Segura'
            
            self.data['classificacao'] = self.data['indice_criticidade'].apply(classify_zone)
            
            # Define cores
            self.data['cor'] = self.data['classificacao'].map(Config.COLORS)
            
            # Calcula estatísticas
            self._calculate_statistics()
            
        except Exception as e:
            print(f"Erro ao processar dados: {e}")
            self.data = pd.DataFrame()
    
    def _calculate_statistics(self):
        """Calcula estatísticas gerais das zonas"""
        if self.data.empty:
            return
            
        self.stats = {
            'total_zones': len(self.data),
            'critical_zones': len(self.data[self.data['classificacao'] == 'Crítica']),
            'medium_zones': len(self.data[self.data['classificacao'] == 'Média']),
            'safe_zones': len(self.data[self.data['classificacao'] == 'Segura']),
            'avg_temperature': self.data['temperatura'].mean(),
            'avg_ndvi': self.data['ndvi'].mean(),
            'avg_criticity': self.data['indice_criticidade'].mean()
        }
    
    def get_all_zones(self) -> List[Dict[str, Any]]:
        """Retorna dados de todas as zonas"""
        if self.data.empty:
            return []
        
        zones = []
        for _, row in self.data.iterrows():
            zones.append({
                'id': int(row['id']),
                'nome': row['nome'],
                'latitude': float(row['latitude']),
                'longitude': float(row['longitude']),
                'temperatura': float(row['temperatura']),
                'ndvi': float(row['ndvi']),
                'densidade_populacional': int(row['densidade_populacional']),
                'regiao': row['regiao'],
                'indice_criticidade': float(row['indice_criticidade']),
                'classificacao': row['classificacao'],
                'cor': row['cor']
            })
        
        return zones
    
    def get_zone_details(self, zone_id: int) -> Optional[Dict[str, Any]]:
        """Retorna detalhes completos de uma zona específica"""
        zone = self.data[self.data['id'] == zone_id]
        if zone.empty:
            return None
        
        zone_data = zone.iloc[0]
        classification = zone_data['classificacao']
        action_config = Config.ACTION_SUGGESTIONS.get(classification, {})
        
        return {
            'id': int(zone_data['id']),
            'nome': zone_data['nome'],
            'latitude': float(zone_data['latitude']),
            'longitude': float(zone_data['longitude']),
            'temperatura': float(zone_data['temperatura']),
            'ndvi': float(zone_data['ndvi']),
            'densidade_populacional': int(zone_data['densidade_populacional']),
            'regiao': zone_data['regiao'],
            'indice_criticidade': float(zone_data['indice_criticidade']),
            'classificacao': classification,
            'cor': zone_data['cor'],
            'acao_sugerida': action_config.get('action', ''),
            'custo_estimado': action_config.get('cost_range', ''),
            'especies_recomendadas': action_config.get('species', ''),
            'volunteer_message': action_config.get('volunteer_message', ''),
            'volunteer_description': action_config.get('volunteer_description', '')
        }
    
    def get_statistics(self) -> Dict[str, Any]:
        """Retorna estatísticas gerais"""
        return getattr(self, 'stats', {
            'total_zones': 0,
            'critical_zones': 0,
            'medium_zones': 0,
            'safe_zones': 0,
            'avg_temperature': 0,
            'avg_ndvi': 0,
            'avg_criticity': 0
        })
    
    def get_report_data(self) -> List[Dict[str, Any]]:
        """Retorna dados para relatório PDF"""
        if self.data.empty:
            return []
        
        report_data = []
        for _, row in self.data.iterrows():
            report_data.append({
                'bairro': row['nome'],
                'regiao': row['regiao'],
                'temperatura': row['temperatura'],
                'ndvi': row['ndvi'],
                'densidade': row['densidade_populacional'],
                'criticidade': row['indice_criticidade'],
                'classificacao': row['classificacao']
            })
        
        # Ordena por criticidade (maior primeiro)
        report_data.sort(key=lambda x: x['criticidade'], reverse=True)
        return report_data

