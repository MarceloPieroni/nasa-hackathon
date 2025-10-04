# 🐍 Como Instalar Python no Windows

## Problema Identificado
O Python da Microsoft Store não está funcionando corretamente no seu sistema. Aqui estão as soluções:

## 🚀 Solução 1: Download Direto (Recomendado)

1. **Acesse o site oficial**: https://python.org/downloads/
2. **Baixe a versão mais recente** (Python 3.11 ou 3.12)
3. **Execute o instalador** e **MARQUE A CAIXA**:
   ```
   ✅ Add Python to PATH
   ```
4. **Clique em "Install Now"**
5. **Reinicie o terminal/PowerShell**
6. **Teste**: `python --version`

## 🔧 Solução 2: Via Chocolatey (Se já tiver)

```powershell
# Instalar Chocolatey (se não tiver)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Instalar Python
choco install python
```

## 🔧 Solução 3: Via Winget (Windows 10/11)

```powershell
winget install Python.Python.3.12
```

## ✅ Verificação da Instalação

Após instalar, teste no terminal:

```bash
python --version
pip --version
```

Se funcionar, execute o sistema:

```bash
cd "C:\Users\Junior\NASA!"
pip install -r requirements.txt
python app.py
```

## 🌐 Demo Standalone

Enquanto isso, você pode testar o sistema usando o arquivo `demo_standalone.html` que já está funcionando!

## 📞 Suporte

Se ainda tiver problemas:
1. Reinicie o computador
2. Verifique se Python está no PATH: `echo $env:PATH`
3. Tente usar `py` em vez de `python`

---
**O sistema está pronto, só precisa do Python funcionando! 🎉**
