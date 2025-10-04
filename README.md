# Sistema de Identificação de Ilhas de Calor Urbano

Um protótipo MVP para identificar e analisar ilhas de calor em áreas urbanas, desenvolvido com Python Flask e Leaflet.js.

## 🎯 Funcionalidades

- **Análise de Dados**: Processamento de CSV com dados de temperatura, NDVI e densidade populacional
- **Cálculo de Criticidade**: Índice baseado em temperatura - (NDVI × 10)
- **Classificação de Zonas**: Crítica (>35°C), Média (25-35°C), Segura (<25°C)
- **Mapa Interativo**: Visualização com Leaflet.js e pontos coloridos por criticidade
- **Detalhes por Zona**: Popups e modais com informações detalhadas e sugestões
- **Relatório PDF**: Geração automática com tabelas, análises e recomendações

## 🚀 Instalação e Execução

### Pré-requisitos
- Python 3.8+
- pip (gerenciador de pacotes Python)

### Instalação

1. **Clone ou baixe o projeto**
```bash
cd "C:\Users\Junior\NASA!"
```

2. **Instale as dependências**
```bash
pip install -r requirements.txt
```

3. **Execute a aplicação**
```bash
python app.py
```

4. **Acesse no navegador**
```
http://localhost:5000
```

## 📊 Estrutura dos Dados

O arquivo `data/sample_data.csv` deve conter as seguintes colunas:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | int | Identificador único da zona |
| nome | string | Nome do bairro/zona |
| latitude | float | Latitude geográfica |
| longitude | float | Longitude geográfica |
| temperatura | float | Temperatura em °C |
| ndvi | float | Índice NDVI (0-1) |
| densidade_populacional | int | Habitantes por km² |

## 🧮 Algoritmo de Criticidade

```python
indice_criticidade = temperatura - (ndvi * 10)
```

### Classificação:
- **Crítica**: índice > 35
- **Média**: índice entre 25-35  
- **Segura**: índice < 25

## 🎨 Interface

- **Sidebar**: Legenda, estatísticas e controles
- **Mapa Principal**: Visualização interativa das zonas
- **Popups**: Informações básicas ao clicar nos pontos
- **Modais**: Detalhes completos com sugestões de ação
- **Relatório PDF**: Download automático com análises

## 📁 Estrutura do Projeto

```
NASA!/
├── app.py                 # Backend Flask
├── requirements.txt       # Dependências Python
├── README.md             # Documentação
├── templates/
│   └── index.html        # Template principal
├── static/
│   ├── style.css         # Estilos CSS
│   └── script.js         # JavaScript frontend
└── data/
    └── sample_data.csv   # Dados de exemplo
```

## 🔧 API Endpoints

- `GET /` - Página principal
- `GET /api/zones` - Lista todas as zonas
- `GET /api/zone/<id>` - Detalhes de uma zona específica
- `GET /api/report` - Download do relatório PDF

## 🌡️ Interpretação dos Dados

### NDVI (Normalized Difference Vegetation Index)
- **0.0 - 0.3**: Áreas urbanizadas, concreto, asfalto
- **0.3 - 0.6**: Vegetação esparsa, gramados
- **0.6 - 1.0**: Vegetação densa, florestas

### Índice de Criticidade
- **Alto**: Zonas com alta temperatura e baixa vegetação
- **Médio**: Zonas com temperatura moderada
- **Baixo**: Zonas com boa cobertura vegetal

## 💡 Sugestões de Ação

### Zonas Críticas
- Plantio urgente de árvores
- Criação de áreas verdes
- Implementação de telhados verdes

### Zonas Médias
- Ampliação de áreas verdes existentes
- Plantio de árvores de médio porte
- Pavimentos permeáveis

### Zonas Seguras
- Manutenção do verde existente
- Monitoramento contínuo
- Preservação ambiental

## 🛠️ Tecnologias Utilizadas

- **Backend**: Python Flask
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Mapas**: Leaflet.js
- **Dados**: Pandas
- **PDF**: ReportLab
- **UI**: Bootstrap 5

## 📈 Próximas Melhorias

- [ ] Upload de arquivos CSV personalizados
- [ ] Integração com APIs de dados climáticos reais
- [ ] Análise temporal (evolução das ilhas de calor)
- [ ] Exportação para outros formatos (Excel, GeoJSON)
- [ ] Dashboard com gráficos e métricas avançadas
- [ ] Sistema de alertas automáticos

## 🤝 Contribuição

Este é um protótipo MVP para demonstração. Para contribuições:

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto é um protótipo educacional para análise urbana.

---

**Desenvolvido para análise de ilhas de calor urbano** 🌡️🌳
