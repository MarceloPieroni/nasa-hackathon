# Script PowerShell para iniciar a aplicacao
Write-Host "Iniciando Sistema de Ilhas de Calor Urbano" -ForegroundColor Cyan

# Tentar diferentes comandos Python
$pythonCommands = @("python", "python3", "py")

foreach ($cmd in $pythonCommands) {
    try {
        Write-Host "Tentando executar com: $cmd" -ForegroundColor Yellow
        
        $pythonPath = Get-Command $cmd -ErrorAction SilentlyContinue
        if ($pythonPath) {
            Write-Host "Python encontrado em: $($pythonPath.Source)" -ForegroundColor Green
            
            Write-Host "Instalando dependencias..." -ForegroundColor Blue
            & $cmd -m pip install -r requirements.txt
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Dependencias instaladas com sucesso!" -ForegroundColor Green
                
                Write-Host "Iniciando aplicacao..." -ForegroundColor Blue
                Write-Host "Acesse: http://localhost:5000" -ForegroundColor Magenta
                Write-Host ""
                
                & $cmd app.py
                break
            }
        }
    }
    catch {
        Write-Host "Comando $cmd nao encontrado" -ForegroundColor Red
    }
}

Write-Host "Python nao encontrado no sistema!" -ForegroundColor Red
Write-Host "Instale Python do site oficial: https://python.org" -ForegroundColor White

Read-Host "Pressione Enter para sair"