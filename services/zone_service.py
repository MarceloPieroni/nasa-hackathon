"""
Serviço de Processamento de Zonas de Calor Urbano
Sistema Clima Vida - NASA Space Apps Hackathon
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from config import Config
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ZoneData:
    """Modelo de dados para uma zona de calor urbano"""
    id: int
    nome: str
    latitude: float
    longitude: float
    temperatura: float
    ndvi: float
    densidade_populacional: int
    regiao: str
    indice_criticidade: float
    classificacao: str
    cor: str

@dataclass
class ZoneStatistics:
    """Estatísticas gerais das zonas"""
    total_zones: int
    critical_zones: int
    medium_zones: int
    safe_zones: int
    avg_temperature: float
    avg_ndvi: float
    avg_criticity: float

class ZoneService:
    """
    Serviço responsável pelo processamento e análise de dados de zonas de calor urbano
    """
    
    def __init__(self, csv_file: str = None):
        """
        Inicializa o serviço de zonas
        
        Args:
            csv_file: Caminho para o arquivo CSV (opcional, usa Config por padrão)
        """
        self.csv_file = csv_file or Config.CSV_FILE_PATH
        self._data: Optional[pd.DataFrame] = None
        self._statistics: Optional[ZoneStatistics] = None
        self._zones_cache: Optional[List[ZoneData]] = None
        
        # Carrega e processa dados na inicialização
        self._load_and_process_data()
    
    def _load_and_process_data(self) -> None:
        """
        Carrega e processa os dados do CSV
        """
        try:
            logger.info(f"Carregando dados de: {self.csv_file}")
            self._data = pd.read_csv(self.csv_file)
            
            # Validação básica dos dados
            self._validate_data()
            
            # Processa os dados
            self._process_data()
            
            # Calcula estatísticas
            self._calculate_statistics()
            
            # Limpa cache
            self._zones_cache = None
            
            logger.info(f"Dados processados com sucesso: {len(self._data)} zonas")
            
        except FileNotFoundError:
            logger.error(f"Arquivo CSV não encontrado: {self.csv_file}")
            raise
        except Exception as e:
            logger.error(f"Erro ao processar dados: {e}")
            raise
    
    def _validate_data(self) -> None:
        """
        Valida a estrutura e conteúdo dos dados
        """
        required_columns = ['id', 'nome', 'latitude', 'longitude', 'temperatura', 'ndvi', 'densidade_populacional']
        
        # Verifica colunas obrigatórias
        missing_columns = [col for col in required_columns if col not in self._data.columns]
        if missing_columns:
            raise ValueError(f"Colunas obrigatórias ausentes: {missing_columns}")
        
        # Verifica dados nulos
        null_counts = self._data[required_columns].isnull().sum()
        if null_counts.any():
            logger.warning(f"Dados nulos encontrados: {null_counts.to_dict()}")
        
        # Verifica tipos de dados
        numeric_columns = ['latitude', 'longitude', 'temperatura', 'ndvi', 'densidade_populacional']
        for col in numeric_columns:
            if col in self._data.columns:
                try:
                    self._data[col] = pd.to_numeric(self._data[col], errors='coerce')
                except Exception as e:
                    logger.warning(f"Erro ao converter coluna {col} para numérico: {e}")
    
    def _process_data(self) -> None:
        """
        Processa os dados calculando métricas e classificações
        """
        # Calcula índice de criticidade
        self._data['indice_criticidade'] = (
            self._data['temperatura'] - (self._data['ndvi'] * 10)
        )
        
        # Classifica as zonas
        self._data['classificacao'] = self._data['indice_criticidade'].apply(self._classify_zone)
        
        # Define cores baseadas na classificação
        color_mapping = {
            'Crítica': Config.COLORS['critical'],
            'Média': Config.COLORS['medium'],
            'Segura': Config.COLORS['safe']
        }
        self._data['cor'] = self._data['classificacao'].map(color_mapping)
        
        # Adiciona região padrão se não existir
        if 'regiao' not in self._data.columns:
            self._data['regiao'] = 'São Paulo'
    
    def _classify_zone(self, index: float) -> str:
        """
        Classifica uma zona baseada no índice de criticidade
        
        Args:
            index: Índice de criticidade
            
        Returns:
            Classificação da zona (Crítica, Média, Segura)
        """
        if pd.isna(index):
            return 'Segura'
        
        if index > Config.CRITICAL_THRESHOLD:
            return 'Crítica'
        elif index > Config.MEDIUM_THRESHOLD:
            return 'Média'
        else:
            return 'Segura'
    
    def _calculate_statistics(self) -> None:
        """
        Calcula estatísticas gerais das zonas
        """
        if self._data is None or self._data.empty:
            self._statistics = ZoneStatistics(0, 0, 0, 0, 0.0, 0.0, 0.0)
            return
        
        self._statistics = ZoneStatistics(
            total_zones=len(self._data),
            critical_zones=len(self._data[self._data['classificacao'] == 'Crítica']),
            medium_zones=len(self._data[self._data['classificacao'] == 'Média']),
            safe_zones=len(self._data[self._data['classificacao'] == 'Segura']),
            avg_temperature=float(self._data['temperatura'].mean()),
            avg_ndvi=float(self._data['ndvi'].mean()),
            avg_criticity=float(self._data['indice_criticidade'].mean())
        )
    
    def get_all_zones(self) -> List[Dict[str, Any]]:
        """
        Retorna dados de todas as zonas formatados para API
        
        Returns:
            Lista de dicionários com dados das zonas
        """
        if self._zones_cache is not None:
            return [zone.__dict__ for zone in self._zones_cache]
        
        if self._data is None or self._data.empty:
            return []
        
        zones = []
        for _, row in self._data.iterrows():
            zone = ZoneData(
                id=int(row['id']),
                nome=str(row['nome']),
                latitude=float(row['latitude']),
                longitude=float(row['longitude']),
                temperatura=float(row['temperatura']),
                ndvi=float(row['ndvi']),
                densidade_populacional=int(row['densidade_populacional']),
                regiao=str(row.get('regiao', 'São Paulo')),
                indice_criticidade=float(row['indice_criticidade']),
                classificacao=str(row['classificacao']),
                cor=str(row['cor'])
            )
            zones.append(zone)
        
        # Cache o resultado
        self._zones_cache = zones
        return [zone.__dict__ for zone in zones]
    
    def get_zone_by_id(self, zone_id: int) -> Optional[Dict[str, Any]]:
        """
        Retorna dados de uma zona específica
        
        Args:
            zone_id: ID da zona
            
        Returns:
            Dicionário com dados da zona ou None se não encontrada
        """
        if self._data is None or self._data.empty:
            return None
        
        zone_row = self._data[self._data['id'] == zone_id]
        if zone_row.empty:
            return None
        
        row = zone_row.iloc[0]
        classification = row['classificacao']
        action_config = Config.ACTION_SUGGESTIONS.get(classification, {})
        
        return {
            'id': int(row['id']),
            'nome': str(row['nome']),
            'latitude': float(row['latitude']),
            'longitude': float(row['longitude']),
            'temperatura': float(row['temperatura']),
            'ndvi': float(row['ndvi']),
            'densidade_populacional': int(row['densidade_populacional']),
            'regiao': str(row.get('regiao', 'São Paulo')),
            'indice_criticidade': float(row['indice_criticidade']),
            'classificacao': classification,
            'cor': str(row['cor']),
            'acao_sugerida': action_config.get('action', ''),
            'custo_estimado': action_config.get('cost_range', ''),
            'especies_recomendadas': action_config.get('species', ''),
            'civil_message': action_config.get('civil_message', ''),
            'civil_description': action_config.get('civil_description', '')
        }
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        Retorna estatísticas gerais das zonas
        
        Returns:
            Dicionário com estatísticas
        """
        if self._statistics is None:
            return {
                'total_zones': 0,
                'critical_zones': 0,
                'medium_zones': 0,
                'safe_zones': 0,
                'avg_temperature': 0.0,
                'avg_ndvi': 0.0,
                'avg_criticity': 0.0
            }
        
        return {
            'total_zones': self._statistics.total_zones,
            'critical_zones': self._statistics.critical_zones,
            'medium_zones': self._statistics.medium_zones,
            'safe_zones': self._statistics.safe_zones,
            'avg_temperature': round(self._statistics.avg_temperature, 1),
            'avg_ndvi': round(self._statistics.avg_ndvi, 2),
            'avg_criticity': round(self._statistics.avg_criticity, 2)
        }
    
    def get_report_data(self) -> List[Dict[str, Any]]:
        """
        Retorna dados formatados para relatório PDF
        
        Returns:
            Lista de dicionários com dados para relatório
        """
        if self._data is None or self._data.empty:
            return []
        
        report_data = []
        for _, row in self._data.iterrows():
            report_data.append({
                'bairro': str(row['nome']),
                'regiao': str(row.get('regiao', 'São Paulo')),
                'temperatura': float(row['temperatura']),
                'ndvi': float(row['ndvi']),
                'densidade': int(row['densidade_populacional']),
                'criticidade': float(row['indice_criticidade']),
                'classificacao': str(row['classificacao'])
            })
        
        # Ordena por criticidade (maior primeiro)
        report_data.sort(key=lambda x: x['criticidade'], reverse=True)
        return report_data
    
    def refresh_data(self) -> None:
        """
        Recarrega e reprocessa os dados
        """
        logger.info("Recarregando dados...")
        self._load_and_process_data()
    
    def get_zones_by_classification(self, classification: str) -> List[Dict[str, Any]]:
        """
        Retorna zonas filtradas por classificação
        
        Args:
            classification: Classificação desejada (Crítica, Média, Segura)
            
        Returns:
            Lista de zonas com a classificação especificada
        """
        all_zones = self.get_all_zones()
        return [zone for zone in all_zones if zone['classificacao'] == classification]
