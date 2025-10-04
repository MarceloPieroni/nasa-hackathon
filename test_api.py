#!/usr/bin/env python3
"""
Script de teste para a API do Sistema de Ilhas de Calor
Execute este script para testar os endpoints da API
"""

import requests
import json
import time

def test_api():
    base_url = "http://localhost:5000"
    
    print("🌡️  Testando API do Sistema de Ilhas de Calor")
    print("=" * 50)
    
    # Test 1: Verificar se a aplicação está rodando
    print("\n1. Testando conexão...")
    try:
        response = requests.get(base_url, timeout=5)
        if response.status_code == 200:
            print("✅ Aplicação está rodando!")
        else:
            print(f"❌ Erro: Status {response.status_code}")
            return
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro de conexão: {e}")
        print("💡 Certifique-se de que a aplicação está rodando (python app.py)")
        return
    
    # Test 2: Buscar dados de todas as zonas
    print("\n2. Testando endpoint /api/zones...")
    try:
        response = requests.get(f"{base_url}/api/zones")
        if response.status_code == 200:
            zones = response.json()
            print(f"✅ Encontradas {len(zones)} zonas")
            
            # Mostrar algumas estatísticas
            critical = len([z for z in zones if z['classificacao'] == 'Crítica'])
            medium = len([z for z in zones if z['classificacao'] == 'Média'])
            safe = len([z for z in zones if z['classificacao'] == 'Segura'])
            
            print(f"   📊 Críticas: {critical}")
            print(f"   📊 Médias: {medium}")
            print(f"   📊 Seguras: {safe}")
            
        else:
            print(f"❌ Erro: Status {response.status_code}")
    except Exception as e:
        print(f"❌ Erro: {e}")
    
    # Test 3: Buscar detalhes de uma zona específica
    print("\n3. Testando endpoint /api/zone/1...")
    try:
        response = requests.get(f"{base_url}/api/zone/1")
        if response.status_code == 200:
            zone_data = response.json()
            print(f"✅ Dados da zona: {zone_data['nome']}")
            print(f"   🌡️  Temperatura: {zone_data['temperatura']}°C")
            print(f"   🌳 NDVI: {zone_data['ndvi']}")
            print(f"   📊 Classificação: {zone_data['classificacao']}")
            print(f"   💡 Ação: {zone_data['acao_sugerida'][:50]}...")
        else:
            print(f"❌ Erro: Status {response.status_code}")
    except Exception as e:
        print(f"❌ Erro: {e}")
    
    # Test 4: Testar geração de relatório
    print("\n4. Testando geração de relatório PDF...")
    try:
        response = requests.get(f"{base_url}/api/report")
        if response.status_code == 200:
            print("✅ Relatório PDF gerado com sucesso!")
            print(f"   📄 Tamanho: {len(response.content)} bytes")
            
            # Salvar o relatório
            with open("relatorio_teste.pdf", "wb") as f:
                f.write(response.content)
            print("   💾 Relatório salvo como 'relatorio_teste.pdf'")
        else:
            print(f"❌ Erro: Status {response.status_code}")
    except Exception as e:
        print(f"❌ Erro: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Testes concluídos!")
    print("\nPara usar a aplicação:")
    print("1. Acesse: http://localhost:5000")
    print("2. Clique nos pontos no mapa para ver detalhes")
    print("3. Use o botão 'Gerar Relatório PDF' para baixar análises")

if __name__ == "__main__":
    test_api()
