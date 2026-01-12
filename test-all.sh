#!/bin/bash

# Script para ejecutar tests en todos los servicios
# Uso: ./test-all.sh [servicio] [opción]
# Ejemplo: ./test-all.sh auth-service --watch

SERVICES=("api-gateway" "auth-service" "emotion-service")
SERVICES_DIR="services"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir encabezados
print_header() {
    echo -e "\n${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}\n"
}

# Función para imprimir errores
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Función para imprimir éxitos
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Función para imprimir warnings
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Función para ejecutar tests en un servicio
test_service() {
    local service=$1
    local option=$2
    local service_path="$SERVICES_DIR/$service"
    
    if [ ! -d "$service_path" ]; then
        print_error "Servicio $service no encontrado"
        return 1
    fi
    
    print_header "Testing $service"
    
    cd "$service_path"
    
    # Verificar si existen node_modules
    if [ ! -d "node_modules" ]; then
        print_warning "node_modules no encontrado, instalando dependencias..."
        npm ci || {
            print_error "Error al instalar dependencias"
            cd - > /dev/null
            return 1
        }
    fi
    
    # Ejecutar tests
    if [ -z "$option" ]; then
        npm test -- --coverage || {
            print_error "Tests fallaron en $service"
            cd - > /dev/null
            return 1
        }
    else
        npm test -- $option || {
            print_error "Tests fallaron en $service"
            cd - > /dev/null
            return 1
        }
    fi
    
    print_success "Tests completados en $service"
    cd - > /dev/null
    return 0
}

# Función para ejecutar linting
lint_service() {
    local service=$1
    local service_path="$SERVICES_DIR/$service"
    
    if [ ! -d "$service_path" ]; then
        print_error "Servicio $service no encontrado"
        return 1
    fi
    
    print_header "Linting $service"
    
    cd "$service_path"
    
    if npm run lint 2>&1 | grep -q "npm ERR!"; then
        npm run lint || {
            print_error "Linting fallido en $service"
            cd - > /dev/null
            return 1
        }
    else
        npm run lint || print_warning "Linting completado con warnings"
    fi
    
    print_success "Linting completado en $service"
    cd - > /dev/null
    return 0
}

# Función para mostrar ayuda
show_help() {
    cat << EOF
${BLUE}Script de Tests para EmoTrack Platform${NC}

Uso: ./test-all.sh [OPCIÓN] [SERVICIO] [ARGUMENTS]

OPCIONES:
    test              Ejecutar tests (por defecto)
    lint              Ejecutar linter
    all               Ejecutar tests y linter
    watch             Ejecutar tests en modo watch
    coverage          Ejecutar tests con coverage
    help              Mostrar esta ayuda

SERVICIOS:
    api-gateway       Test API Gateway
    auth-service      Test Auth Service
    emotion-service   Test Emotion Service
    all               Test todos los servicios (por defecto)

EJEMPLOS:
    ./test-all.sh                        # Tests todos los servicios
    ./test-all.sh test api-gateway       # Tests API Gateway
    ./test-all.sh lint auth-service      # Lint Auth Service
    ./test-all.sh watch emotion-service  # Tests en watch mode
    ./test-all.sh all api-gateway        # Tests + Lint API Gateway
    ./test-all.sh coverage               # Tests con coverage

${YELLOW}Notas:${NC}
    - Si no especificas servicio, se ejecutan todos
    - Asegúrate de estar en el directorio raíz del proyecto
    - npm ci instalará dependencias si no existen

EOF
}

# Main
main() {
    local option=$1
    local service=$2
    local args=$3
    
    # Si no hay argumentos
    if [ -z "$option" ]; then
        print_header "Ejecutando tests de todos los servicios"
        for svc in "${SERVICES[@]}"; do
            test_service "$svc" "--coverage" || exit 1
        done
        print_success "Todos los tests completados exitosamente"
        exit 0
    fi
    
    # Procesar opciones
    case "$option" in
        "help"|"-h"|"--help")
            show_help
            exit 0
            ;;
        "test")
            if [ -z "$service" ] || [ "$service" = "all" ]; then
                print_header "Ejecutando tests de todos los servicios"
                for svc in "${SERVICES[@]}"; do
                    test_service "$svc" "$args" || exit 1
                done
                print_success "Todos los tests completados exitosamente"
            else
                test_service "$service" "$args" || exit 1
            fi
            ;;
        "lint")
            if [ -z "$service" ] || [ "$service" = "all" ]; then
                print_header "Ejecutando linter en todos los servicios"
                for svc in "${SERVICES[@]}"; do
                    lint_service "$svc" || exit 1
                done
                print_success "Linting completado en todos los servicios"
            else
                lint_service "$service" || exit 1
            fi
            ;;
        "all")
            if [ -z "$service" ] || [ "$service" = "all" ]; then
                print_header "Ejecutando tests y linter en todos los servicios"
                for svc in "${SERVICES[@]}"; do
                    lint_service "$svc" || exit 1
                    test_service "$svc" "--coverage" || exit 1
                done
                print_success "Todos los tests y linting completados exitosamente"
            else
                lint_service "$service" || exit 1
                test_service "$service" "$args" || exit 1
            fi
            ;;
        "watch")
            if [ -z "$service" ]; then
                service="api-gateway"
            fi
            test_service "$service" "--watch" || exit 1
            ;;
        "coverage")
            if [ -z "$service" ] || [ "$service" = "all" ]; then
                print_header "Ejecutando tests con coverage en todos los servicios"
                for svc in "${SERVICES[@]}"; do
                    test_service "$svc" "--coverage" || exit 1
                done
                print_success "Coverage completado en todos los servicios"
            else
                test_service "$service" "--coverage" || exit 1
            fi
            ;;
        *)
            print_error "Opción desconocida: $option"
            show_help
            exit 1
            ;;
    esac
}

# Ejecutar
main "$@"
