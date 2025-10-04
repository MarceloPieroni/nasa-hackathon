#!/usr/bin/env python3
"""
Ponto de entrada principal para o sistema Cidades Frias, Corações Quentes
Sistema de Identificação de Ilhas de Calor Urbano - São Paulo
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
