#!/bin/bash

echo "🎒 Iniciando UltraLigero..."
echo ""

# Verificar si MariaDB está corriendo
if ! mysqladmin ping -h localhost --silent 2>/dev/null; then
  echo "⚠️  Advertencia: MariaDB no parece estar corriendo"
  echo "   Asegúrate de que el servidor MariaDB esté activo"
  echo ""
fi

# Iniciar backend
echo "📦 Iniciando servidor backend..."
npm run server &
BACKEND_PID=$!

# Esperar a que el backend esté listo
echo "⏳ Esperando a que el backend esté listo..."
sleep 3

# Iniciar frontend
echo "🎨 Iniciando servidor frontend..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ UltraLigero está corriendo!"
echo ""
echo "🌐 Accesos:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3000"
echo "   API:      http://localhost:3000/api/health"
echo ""
echo "Presiona Ctrl+C para detener ambos servidores"
echo ""

# Manejar señal de interrupción
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT

wait
