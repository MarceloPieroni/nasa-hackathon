"""
Serviço de Geração de Relatórios PDF
Sistema Clima Vida - NASA Space Apps Hackathon
"""

import tempfile
import os
from datetime import datetime
from typing import List, Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from config import Config
import logging

logger = logging.getLogger(__name__)

class PDFService:
    """
    Serviço responsável pela geração de relatórios PDF
    """
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """
        Configura estilos customizados para o PDF
        """
        # Estilo para título principal
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Title'],
            fontSize=24,
            spaceAfter=30,
            textColor=colors.HexColor('#2E86AB'),
            alignment=1  # Center alignment
        ))
        
        # Estilo para subtítulos
        self.styles.add(ParagraphStyle(
            name='CustomHeading2',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceAfter=12,
            textColor=colors.HexColor('#A23B72')
        ))
        
        # Estilo para informações de cabeçalho
        self.styles.add(ParagraphStyle(
            name='HeaderInfo',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.grey,
            alignment=1
        ))
    
    def generate_heat_island_report(self, zones_data: List[Dict[str, Any]], 
                                  statistics: Dict[str, Any]) -> str:
        """
        Gera relatório completo de ilhas de calor urbano
        
        Args:
            zones_data: Lista com dados das zonas
            statistics: Estatísticas gerais
            
        Returns:
            Caminho para o arquivo PDF gerado
        """
        try:
            # Cria arquivo temporário
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
            temp_file.close()
            
            # Cria o documento PDF
            doc = SimpleDocTemplate(
                temp_file.name, 
                pagesize=letter,
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=18
            )
            
            # Constrói o conteúdo
            story = self._build_report_content(zones_data, statistics)
            
            # Gera o PDF
            doc.build(story)
            
            logger.info(f"Relatório PDF gerado: {temp_file.name}")
            return temp_file.name
            
        except Exception as e:
            logger.error(f"Erro ao gerar relatório PDF: {e}")
            raise
    
    def _build_report_content(self, zones_data: List[Dict[str, Any]], 
                            statistics: Dict[str, Any]) -> List:
        """
        Constrói o conteúdo do relatório
        
        Args:
            zones_data: Dados das zonas
            statistics: Estatísticas
            
        Returns:
            Lista de elementos para o PDF
        """
        story = []
        
        # Cabeçalho
        story.extend(self._build_header())
        
        # Resumo executivo
        story.extend(self._build_executive_summary(statistics))
        
        # Tabela de dados
        story.extend(self._build_data_table(zones_data))
        
        # Análise e recomendações
        story.extend(self._build_analysis_section(statistics))
        
        # Ações prioritárias
        story.extend(self._build_action_plan())
        
        return story
    
    def _build_header(self) -> List:
        """
        Constrói o cabeçalho do relatório
        """
        return [
            Paragraph(Config.PDF_TITLE, self.styles['CustomTitle']),
            Spacer(1, 12),
            Paragraph(Config.PDF_SUBTITLE, self.styles['HeaderInfo']),
            Paragraph(f"Gerado em: {datetime.now().strftime('%d/%m/%Y às %H:%M')}", 
                     self.styles['HeaderInfo']),
            Spacer(1, 30)
        ]
    
    def _build_executive_summary(self, statistics: Dict[str, Any]) -> List:
        """
        Constrói o resumo executivo
        """
        return [
            Paragraph("Resumo Executivo", self.styles['CustomHeading2']),
            Paragraph(
                f"Este relatório apresenta a análise de {statistics['total_zones']} zonas urbanas "
                f"em São Paulo, identificando {statistics['critical_zones']} zonas críticas que "
                f"requerem intervenção imediata para mitigação de ilhas de calor urbano.",
                self.styles['Normal']
            ),
            Spacer(1, 20),
            Paragraph("Distribuição por Classificação:", self.styles['Heading3']),
            Paragraph(f"• Zonas Críticas: {statistics['critical_zones']} ({statistics['critical_zones']/statistics['total_zones']*100:.1f}%)", 
                     self.styles['Normal']),
            Paragraph(f"• Zonas Médias: {statistics['medium_zones']} ({statistics['medium_zones']/statistics['total_zones']*100:.1f}%)", 
                     self.styles['Normal']),
            Paragraph(f"• Zonas Seguras: {statistics['safe_zones']} ({statistics['safe_zones']/statistics['total_zones']*100:.1f}%)", 
                     self.styles['Normal']),
            Spacer(1, 20)
        ]
    
    def _build_data_table(self, zones_data: List[Dict[str, Any]]) -> List:
        """
        Constrói a tabela de dados das zonas
        """
        # Cabeçalho da tabela
        table_data = [
            ['Bairro', 'Região', 'Temp (°C)', 'NDVI', 'Densidade', 'Criticidade', 'Classificação']
        ]
        
        # Dados das zonas
        for zone in zones_data:
            table_data.append([
                zone['bairro'],
                zone['regiao'],
                f"{zone['temperatura']:.1f}",
                f"{zone['ndvi']:.2f}",
                f"{zone['densidade']:,.0f}",
                f"{zone['criticidade']:.1f}",
                zone['classificacao']
            ])
        
        # Cria a tabela
        table = Table(table_data, repeatRows=1)
        table.setStyle(TableStyle([
            # Cabeçalho
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2E86AB')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            
            # Dados
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            
            # Coloração por classificação
            ('TEXTCOLOR', (6, 1), (6, -1), self._get_classification_color),
        ]))
        
        return [
            Paragraph("Dados Detalhados das Zonas", self.styles['CustomHeading2']),
            Spacer(1, 12),
            table,
            Spacer(1, 20)
        ]
    
    def _get_classification_color(self, table, row, col):
        """
        Retorna cor baseada na classificação da zona
        """
        if row > 0:  # Pula o cabeçalho
            classification = table._cellvalues[row][6]  # Coluna de classificação
            if classification == 'Crítica':
                return colors.HexColor('#FF4444')
            elif classification == 'Média':
                return colors.HexColor('#FFA500')
            else:
                return colors.HexColor('#44FF44')
        return colors.black
    
    def _build_analysis_section(self, statistics: Dict[str, Any]) -> List:
        """
        Constrói a seção de análise
        """
        return [
            Paragraph("Análise e Interpretação", self.styles['CustomHeading2']),
            Paragraph(
                f"Temperatura média observada: {statistics['avg_temperature']:.1f}°C. "
                f"Índice NDVI médio: {statistics['avg_ndvi']:.2f}, indicando "
                f"{'baixa' if statistics['avg_ndvi'] < 0.3 else 'média' if statistics['avg_ndvi'] < 0.6 else 'alta'} "
                f"cobertura vegetal na região analisada.",
                self.styles['Normal']
            ),
            Spacer(1, 12),
            Paragraph("Interpretação do NDVI:", self.styles['Heading3']),
            Paragraph("• 0.0 - 0.3: Áreas urbanizadas, concreto, asfalto", self.styles['Normal']),
            Paragraph("• 0.3 - 0.6: Vegetação esparsa, gramados", self.styles['Normal']),
            Paragraph("• 0.6 - 1.0: Vegetação densa, florestas", self.styles['Normal']),
            Spacer(1, 20)
        ]
    
    def _build_action_plan(self) -> List:
        """
        Constrói o plano de ações
        """
        return [
            Paragraph("Plano de Ações Prioritárias", self.styles['CustomHeading2']),
            Paragraph("1. Implementação de Telhados Verdes", self.styles['Heading3']),
            Paragraph(
                "Priorizar zonas críticas para implementação de telhados verdes em edifícios "
                "públicos e privados, reduzindo a absorção de calor.",
                self.styles['Normal']
            ),
            Spacer(1, 12),
            Paragraph("2. Plantio de Árvores de Grande Porte", self.styles['Heading3']),
            Paragraph(
                "Criar corredores verdes com árvores nativas de grande porte, especialmente "
                "em zonas com baixo NDVI.",
                self.styles['Normal']
            ),
            Spacer(1, 12),
            Paragraph("3. Criação de Parques e Áreas de Lazer", self.styles['Heading3']),
            Paragraph(
                "Desenvolver novos parques e ampliar áreas verdes existentes em zonas "
                "densamente povoadas.",
                self.styles['Normal']
            ),
            Spacer(1, 12),
            Paragraph("4. Implementação de Pavimentos Permeáveis", self.styles['Heading3']),
            Paragraph(
                "Substituir pavimentos impermeáveis por materiais que permitam infiltração "
                "de água e redução da temperatura superficial.",
                self.styles['Normal']
            ),
            Spacer(1, 20),
            Paragraph(
                "Este relatório foi gerado automaticamente pelo Sistema Clima Vida. "
                "Para mais informações, consulte os dados técnicos detalhados.",
                self.styles['HeaderInfo']
            )
        ]
