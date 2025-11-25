#!/bin/bash

# Script de configuração de variáveis de ambiente
# Este script ajuda a configurar o arquivo .env de forma segura

set -e

FRONTEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$FRONTEND_DIR/.env"
ENV_EXAMPLE="$FRONTEND_DIR/.env.example"

echo "🔐 Configuração de Variáveis de Ambiente - YummyNClub Frontend"
echo "================================================================"
echo ""

# Verificar se .env.example existe
if [ ! -f "$ENV_EXAMPLE" ]; then
    echo "❌ Arquivo .env.example não encontrado!"
    exit 1
fi

# Criar .env a partir do exemplo se não existir
if [ ! -f "$ENV_FILE" ]; then
    echo "📝 Criando arquivo .env a partir do .env.example..."
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    echo "✅ Arquivo .env criado!"
else
    echo "ℹ️  Arquivo .env já existe. Verificando configurações..."
fi

# Verificar se Google Maps API Key já está configurada
if grep -q "VITE_GOOGLE_MAPS_API_KEY=AIzaSyCn0VyNKT1965nwZGMCsheCV57jE22WS90" "$ENV_FILE" 2>/dev/null; then
    echo "✅ Google Maps API Key já está configurada!"
elif grep -q "VITE_GOOGLE_MAPS_API_KEY=" "$ENV_FILE" 2>/dev/null; then
    echo "⚠️  Google Maps API Key já existe, mas com valor diferente."
    read -p "Deseja atualizar para a nova API key? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        # Atualizar API key no .env
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' 's|VITE_GOOGLE_MAPS_API_KEY=.*|VITE_GOOGLE_MAPS_API_KEY=AIzaSyCn0VyNKT1965nwZGMCsheCV57jE22WS90|' "$ENV_FILE"
        else
            # Linux
            sed -i 's|VITE_GOOGLE_MAPS_API_KEY=.*|VITE_GOOGLE_MAPS_API_KEY=AIzaSyCn0VyNKT1965nwZGMCsheCV57jE22WS90|' "$ENV_FILE"
        fi
        echo "✅ Google Maps API Key atualizada!"
    fi
else
    echo "📝 Adicionando Google Maps API Key..."
    echo "" >> "$ENV_FILE"
    echo "# Google Maps API Key" >> "$ENV_FILE"
    echo "VITE_GOOGLE_MAPS_API_KEY=AIzaSyCn0VyNKT1965nwZGMCsheCV57jE22WS90" >> "$ENV_FILE"
    echo "✅ Google Maps API Key adicionada!"
fi

echo ""
echo "✅ Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Reinicie o servidor de desenvolvimento: npm run dev"
echo "   2. O AddressSelectorLazy agora deve funcionar com Google Maps"
echo ""
echo "🔒 Segurança:"
echo "   - O arquivo .env está no .gitignore e NÃO será commitado"
echo "   - Nunca compartilhe sua API key publicamente"
echo "   - Configure restrições na API key no Google Cloud Console"
echo ""

