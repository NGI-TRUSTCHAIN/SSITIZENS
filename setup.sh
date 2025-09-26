#!/bin/bash

# Colores para la salida
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin color

# Funciones para imprimir mensajes
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para mostrar la ayuda
show_help() {
    cat << EOF
Uso: ./setup.sh [OPCIONES]

Opciones:
  --deploy --mode <demo|dev|full> [--build] [--detach] [--verbose]
    - demo: Despliega servicios básicos.
    - dev: Incluye servicios adicionales.
    - full: Despliegue completo.
    - --build: Reconstruye imágenes.
    - --detach: Ejecuta en segundo plano.
    - --verbose: Salida detallada.

  --manage <docker|--ports <demo|dev|full>|env|containers|stop|clean>
    - docker: Verifica instalación.
    - --ports: Verifica puertos.
    - env: Genera archivo de variables de entorno (.env).
    - containers: Estado de contenedores.
    - stop: Detiene contenedores.
    - clean: Limpia contenedores huérfanos.

  --help
    Muestra esta ayuda.

Ejemplos:
  Desplegar en modo dev:
    ./setup.sh --deploy --mode dev --build --detach
  Generar variables de entorno:
    ./setup.sh --manage env
  Detener contenedores:
    ./setup.sh --manage stop
  Limpiar contenedores huérfanos:
    ./setup.sh --manage clean
  Estado de contenedores:
    ./setup.sh --manage containers
  Verificar puertos:
    ./setup.sh --manage --ports dev
  Mostrar ayuda:
    ./setup.sh --help
EOF
}

# Función para generar el archivo .env
generate_env_file() {
    echo "# ==========================================" >> .env
    echo "# Variables para el Backend" >> .env
    echo "# ==========================================" >> .env
    echo "CLASSIFICATION_LLM_MODEL=\"\"" >> .env
    echo "CONTRACT_ADDRESS=\"\"" >> .env
    echo "DEFAULT_FROM_EMAIL=\"\"" >> .env
    echo "ENT_WALLET_BACK_URL=\"\"" >> .env
    echo "OPENAI_API_BASE=\"\"" >> .env
    echo "OPENAI_API_KEY=\"\"" >> .env
    echo "OPENAI_API_VERSION=\"\"" >> .env
    echo "PINATA_GATEWAY_TOKEN=\"\"" >> .env
    echo "PINATA_SECRET_JWT=\"\"" >> .env
    echo "PINATA_URL=\"\"" >> .env
    echo "POSTMARK_API_KEY=\"\"" >> .env
    echo "SECRET_KEY=\"\"" >> .env
    echo "TOKENIZATION_SERVICE_URL=\"\"" >> .env
    echo "VISION_LLM_MODEL=\"\"" >> .env
    echo "" >> .env
    echo "# ==========================================" >> .env
    echo "# Tokenization API" >> .env
    echo "# ==========================================" >> .env
    echo "SMART_CONTRACT_ADDRESS=\"\"" >> .env

    print_success "Archivo .env generado con éxito."
}


check_env_file() {
    if [[ ! -f .env ]]; then
        print_error "El archivo .env no existe."
        exit 1
    fi

    local empty_vars=false
    while IFS= read -r line; do
        if [[ $line == *"=\"\"" ]]; then
            print_warning "La variable en la línea '$line' está vacía."
            empty_vars=true
        fi
    done < .env

    if [[ $empty_vars == true ]]; then
        print_error "El archivo .env contiene variables vacías."
        exit 1
    else
        print_success "El archivo .env existe y todas las variables están configuradas."
    fi
}
add_profile_to_env() {
    local profile="$1"
    if ! grep -q "^DEMO_MODE=" .env; then
        echo "" >> .env
        if [[ "$profile" == "demo" ]]; then
            echo "DEMO_MODE=true" >> .env
        else
            echo "DEMO_MODE=false" >> .env
        fi
    else
        if [[ "$profile" == "demo" ]]; then
            sed -i "" "s/^DEMO_MODE=.*/DEMO_MODE=true/" .env
        else
            sed -i "" "s/^DEMO_MODE=.*/DEMO_MODE=false/" .env
        fi
    fi
}


# Función para manejar la opción --deploy
deploy() {
    local mode=""
    local build=false
    local clean=false
    local detach=false
    local verbose=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --mode)
                mode="$2"
                shift 2
                ;;
            --build)
                build=true
                shift
                ;;
            --clean)
                clean=true
                shift
                ;;
            --detach)
                detach=true
                shift
                ;;
            --verbose)
                verbose=true
                shift
                ;;
            *)
                print_error "Opción desconocida: $1"
                exit 1
                ;;
        esac
    done

    if [[ -z "$mode" ]]; then
        print_error "Debe especificar un modo con --mode (demo, dev, full)."
        exit 1
    fi

    print_status "Iniciando despliegue en modo $mode..."

    local compose_args="--profile $mode"
    if [ "$verbose" = true ]; then
        compose_args="$compose_args --verbose"
    fi
    compose_args="$compose_args up"
    if [ "$detach" = true ]; then
        compose_args="$compose_args -d"
    fi
    if [ "$build" = true ]; then
        compose_args="$compose_args --build"
    fi

    # Comprobamos que el fichero está y es correcto
    check_env_file
    # Añadimos el profile con el que debe ejecutarse
    add_profile_to_env "$mode"


    if docker compose $compose_args; then
        print_success "Despliegue completado en modo $mode."
    else
        print_error "Error en el despliegue en modo $mode."
    fi
}

# Función para limpiar contenedores huérfanos
clean_containers() {
    print_status "Limpiando contenedores huérfanos..."
    docker compose down --remove-orphans
}

# Función para manejar las opciones de gestión
manage() {
    local action="$1"
    local mode="$2"

    case $action in
        docker)
            print_status "Comprobando instalación de Docker y Docker Compose..."
            if ! command -v docker &> /dev/null; then
                print_error "Docker no está instalado."
                exit 1
            fi
            if ! command -v docker compose &> /dev/null; then
                print_error "Docker Compose no está instalado."
                exit 1
            fi
            print_success "Docker y Docker Compose están instalados."
            ;;
        --ports)
            if [[ -z "$mode" ]]; then
                print_error "Debe especificar un modo con --ports (demo, dev, full)."
                exit 1
            fi
            print_status "Comprobando puertos para el modo $mode..."
            local ports=""
            case $mode in
                demo)
                    ports="3000 5432 6379 8000"
                    ;;
                dev)
                    ports="3000 5432 6379 8000 8080 8888"
                    ;;
                full)
                    ports="3000 5432 6379 8000 8080 8545 8888"
                    ;;
                *)
                    print_error "Modo desconocido: $mode"
                    exit 1
                    ;;
            esac
            for port in $ports; do
                if lsof -i:$port &> /dev/null; then
                    print_warning "El puerto $port está en uso."
                else
                    print_success "El puerto $port está disponible."
                fi
            done
            ;;
        env)
            # print_status "Generando archivo de variables de entorno (.env)..."
            # if [ -f .env ]; then
            #     print_warning "El archivo .env ya existe."
            #     read -p "¿Deseas sobrescribirlo? (y/N): " -n 1 -r
            #     echo
            #     if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            #         print_status "Operación cancelada."
            #         exit 0
            #     fi
            # fi

            # Generar archivo .env con plantillas
            if [ ! -f .env ]; then
                generate_env_file
                print_status "📝 Recuerda configurar las variables en el archivo .env"
                print_status "💡 Puedes editarlo con: nano .env"
            else
                print_warning "El archivo .env ya existe."
            fi
            ;;
        containers)
            print_status "Comprobando estado de los contenedores..."
            if [ "$(docker ps -q)" ]; then
                docker ps
            else
                echo "No containers are running"
            fi
            ;;
        stop)
            print_status "Deteniendo todos los contenedores..."
            # Detener todos los contenedores en ejecución
            if [ "$(docker-compose ps -q)" ]; then
                docker stop $(docker-compose ps -q)
                echo "✨ Containers stopped correctly"
            else
                echo "No containers are running"
            fi
            ;;
        clean)
            clean_containers
            ;;
        *)
            print_error "Acción desconocida: $action"
            print_status "Acciones disponibles:"
            print_status "  docker          - Verificar instalación de Docker"
            print_status "  --ports <modo>  - Verificar puertos disponibles"
            print_status "  env             - Generar archivo de variables de entorno (.env)"
            print_status "  containers      - Ver estado de contenedores"
            print_status "  stop            - Detener contenedores"
            print_status "  clean           - Limpiar contenedores y volúmenes"
            exit 1
            ;;
    esac
}

# Parsear argumentos de línea de comandos
if [[ $# -eq 0 ]]; then
    print_error "No se proporcionaron argumentos. Use --deploy, --manage o --help."
    exit 1
fi

    case $1 in
    --deploy)
            shift
        deploy "$@"
            ;;
    --manage)
            shift
        if [[ $# -ne 1 && $# -ne 2 ]]; then
            print_error "Debe proporcionar una opción válida para --manage (docker, --ports demo/dev/full, containers, stop, clean)."
            exit 1
        fi
        manage "$@"
            ;;
        --help)
        show_help
            ;;
        *)
        print_error "Opción desconocida: $1"
            exit 1
            ;;
    esac