.PHONY: help install setup test ingest calculate clean docker-up docker-down query venv

# Use virtual environment Python
PYTHON := ./venv/bin/python3
PIP := ./venv/bin/pip3

help:
	@echo "Airplane Sleep Watch - Available commands:"
	@echo ""
	@echo "  make venv         - Create Python virtual environment"
	@echo "  make install      - Install Python dependencies"
	@echo "  make docker-up    - Start ClickHouse via Docker"
	@echo "  make docker-down  - Stop ClickHouse"
	@echo "  make setup        - Initialize database and seed data"
	@echo "  make test         - Run setup verification tests"
	@echo "  make ingest       - Start data ingestion pipeline"
	@echo "  make calculate    - Calculate panic score (one-time)"
	@echo "  make query        - Open ClickHouse client"
	@echo "  make clean        - Clean Python cache files"
	@echo ""

venv:
	@if [ ! -d "venv" ]; then \
		echo "Creating virtual environment..."; \
		python3 -m venv venv; \
		echo "✓ Virtual environment created"; \
	else \
		echo "✓ Virtual environment already exists"; \
	fi

install: venv
	$(PIP) install -r requirements.txt
	cp -n .env.example .env || true
	@echo ""
	@echo "✓ Dependencies installed"
	@echo "  Edit .env with your configuration if needed"

docker-up:
	docker-compose up -d
	@echo ""
	@echo "Waiting for ClickHouse to start..."
	@sleep 5
	@echo "✓ ClickHouse is running"
	@echo "  HTTP:   http://localhost:8123"
	@echo "  Native: localhost:9000"

docker-down:
	docker-compose down
	@echo "✓ ClickHouse stopped"

setup: docker-up
	@echo "Setting up database..."
	$(PYTHON) scripts/setup_db.py
	@echo ""
	@echo "Loading aircraft profiles..."
	$(PYTHON) scripts/seed_aircraft.py
	@echo ""
	@echo "✓ Setup complete!"

test:
	$(PYTHON) scripts/test_setup.py

ingest:
	$(PYTHON) src/ingest_opensky.py

calculate:
	$(PYTHON) src/calculate_panic.py

query:
	@echo "Connecting to ClickHouse..."
	@echo "Useful queries:"
	@echo "  SHOW TABLES;"
	@echo "  SELECT * FROM panic_scores ORDER BY timestamp DESC LIMIT 10;"
	@echo "  SELECT * FROM aircraft_profiles LIMIT 10;"
	@echo ""
	docker exec -it airplane-watch-clickhouse clickhouse-client --database airplane_watch

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	@echo "✓ Cleaned Python cache files"

# Quick start (run everything)
quickstart: venv install docker-up setup test
	@echo ""
	@echo "=========================================="
	@echo "✓ QUICKSTART COMPLETE"
	@echo "=========================================="
	@echo ""
	@echo "Next steps:"
	@echo "  1. Activate venv:    source venv/bin/activate"
	@echo "  2. Start ingestion:  make ingest"
	@echo "  3. Wait 5-10 minutes for data collection"
	@echo "  4. Calculate score:  make calculate"
	@echo ""
