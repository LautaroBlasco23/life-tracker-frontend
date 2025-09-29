# Variables
APP_NAME := nextjs-app
PORT := 3000
DOCKER_TAG := latest

# Default target
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  build-prod      - Build production Docker image"
	@echo "  build-dev       - Build development Docker image"
	@echo "  run-container   - Run production container"
	@echo "  run-dev         - Run development container with hot reload"
	@echo "  stop            - Stop running containers"
	@echo "  clean           - Remove containers and images"
	@echo "  logs            - View container logs"
	@echo "  shell           - Open shell in running container"

# Build production image
.PHONY: build-prod
build-prod:
	docker build -t $(APP_NAME):$(DOCKER_TAG) .

# Build development image
.PHONY: build-dev
build-dev:
	docker build -f Dockerfile.dev -t $(APP_NAME)-dev:$(DOCKER_TAG) .

# Run production container
.PHONY: run-container
run-container: build-prod
	docker run -d \
		--name $(APP_NAME) \
		-p $(PORT):3000 \
		$(APP_NAME):$(DOCKER_TAG)
	@echo "Container running at http://localhost:$(PORT)"

# Run development container with hot reload
.PHONY: run-dev
run-dev: build-dev
	docker run -d \
		--name $(APP_NAME)-dev \
		-p $(PORT):3000 \
		-v $(PWD):/app \
		-v /app/node_modules \
		$(APP_NAME)-dev:$(DOCKER_TAG)
	@echo "Development container running at http://localhost:$(PORT)"

# Stop running containers
.PHONY: stop
stop:
	-docker stop $(APP_NAME)
	-docker stop $(APP_NAME)-dev
	-docker rm $(APP_NAME)
	-docker rm $(APP_NAME)-dev

# Clean up containers and images
.PHONY: clean
clean: stop
	-docker rmi $(APP_NAME):$(DOCKER_TAG)
	-docker rmi $(APP_NAME)-dev:$(DOCKER_TAG)
	docker system prune -f

# View logs
.PHONY: logs
logs:
	docker logs -f $(APP_NAME)

# View dev logs
.PHONY: logs-dev
logs-dev:
	docker logs -f $(APP_NAME)-dev

# Open shell in running container
.PHONY: shell
shell:
	docker exec -it $(APP_NAME) /bin/sh

# Open shell in dev container
.PHONY: shell-dev
shell-dev:
	docker exec -it $(APP_NAME)-dev /bin/sh

# Restart container
.PHONY: restart
restart: stop run-container

# Restart dev container
.PHONY: restart-dev
restart-dev: stop run-dev
