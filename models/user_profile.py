"""
Modelos de Perfil de Usuário para o Sistema Cidades Frias, Corações Quentes
"""

from enum import Enum
from dataclasses import dataclass
from typing import Dict, Any

class UserProfile(Enum):
    """Perfis de usuário disponíveis no sistema"""
    GESTOR = "gestor"
    VOLUNTARIO = "voluntario"

@dataclass
class User:
    """Modelo de usuário do sistema"""
    id: str
    name: str
    profile: UserProfile
    email: str = None
    phone: str = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Converte o usuário para dicionário"""
        return {
            'id': self.id,
            'name': self.name,
            'profile': self.profile.value,
            'email': self.email,
            'phone': self.phone
        }

# Usuários de exemplo para desenvolvimento
SAMPLE_USERS = {
    'gestor1': User(
        id='gestor1',
        name='Maria Silva',
        profile=UserProfile.GESTOR,
        email='maria.silva@prefeitura.sp.gov.br',
        phone='(11) 3333-4444'
    ),
    'gestor2': User(
        id='gestor2', 
        name='João Santos',
        profile=UserProfile.GESTOR,
        email='joao.santos@ambiente.sp.gov.br',
        phone='(11) 3333-5555'
    ),
    'voluntario1': User(
        id='voluntario1',
        name='Ana Costa',
        profile=UserProfile.VOLUNTARIO,
        email='ana.costa@gmail.com',
        phone='(11) 99999-1111'
    ),
    'voluntario2': User(
        id='voluntario2',
        name='Carlos Lima',
        profile=UserProfile.VOLUNTARIO,
        email='carlos.lima@outlook.com', 
        phone='(11) 99999-2222'
    )
}

