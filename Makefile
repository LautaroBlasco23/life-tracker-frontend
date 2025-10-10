APP_NAME := nextjs-app
PORT := 3000
DOCKER_TAG := latest

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
	@echo "  update-deploy   - Rebuild and redeploy with cleanup"

.PHONY: build-prod
build-prod:
	docker build \
		--build-arg NEXT_PUBLIC_API_URL=https://api-lifetracker.lautaroblasco.com/api \
		-t $(APP_NAME):$(DOCKER_TAG) .

.PHONY: build-dev
build-dev:
	docker build -f Dockerfile.dev -t $(APP_NAME)-dev:$(DOCKER_TAG) .

.PHONY: run-container
run-container: build-prod
	docker run -d \
		--name $(APP_NAME) \
		-p $(PORT):3000 \
		$(APP_NAME):$(DOCKER_TAG)
	@echo "Container running at http://localhost:$(PORT)"

.PHONY: run-dev
run-dev: build-dev
	docker run -d \
		--name $(APP_NAME)-dev \
		-p $(PORT):3000 \
		-v $(PWD):/app \
		-v /app/node_modules \
		$(APP_NAME)-dev:$(DOCKER_TAG)
	@echo "Development container running at http://localhost:$(PORT)"

.PHONY: stop
stop:
	-docker stop $(APP_NAME)
	-docker stop $(APP_NAME)-dev
	-docker rm $(APP_NAME)
	-docker rm $(APP_NAME)-dev

.PHONY: clean
clean: stop
	-docker rmi $(APP_NAME):$(DOCKER_TAG)
	-docker rmi $(APP_NAME)-dev:$(DOCKER_TAG)
	docker system prune -f

.PHONY: logs
logs:
	docker logs -f $(APP_NAME)

.PHONY: logs-dev
logs-dev:
	docker logs -f $(APP_NAME)-dev

.PHONY: shell
shell:
	docker exec -it $(APP_NAME) /bin/sh

.PHONY: shell-dev
shell-dev:
	docker exec -it $(APP_NAME)-dev /bin/sh

.PHONY: restart
restart: stop run-container

.PHONY: restart-dev
restart-dev: stop run-dev

.PHONY: rebuild
rebuild: stop
	docker build --no-cache -t $(APP_NAME):$(DOCKER_TAG) .
	docker run -d \
		--name $(APP_NAME) \
		-p $(PORT):3000 \
		$(APP_NAME):$(DOCKER_TAG)
	@echo "Container running at http://localhost:$(PORT)"

.PHONY: update-deploy
update-deploy:
	@echo "Stopping and removing old container..."
	-docker stop $(APP_NAME)
	-docker rm $(APP_NAME)
	@echo "Removing old image..."
	-docker rmi $(APP_NAME):$(DOCKER_TAG)
	@echo "Building new image..."
	docker build \
		--build-arg NEXT_PUBLIC_API_URL=https://api-lifetracker.lautaroblasco.com/api \
		-t $(APP_NAME):$(DOCKER_TAG) .
	@echo "Starting new container..."
	docker run -d \
		--name $(APP_NAME) \
		-p $(PORT):3000 \
		$(APP_NAME):$(DOCKER_TAG)
	@echo "Cleaning up dangling images..."
	docker image prune -f
	@echo "Deployment complete! Container running at http://localhost:$(PORT)"
