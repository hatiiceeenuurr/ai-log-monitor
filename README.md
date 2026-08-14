# AI Log Monitor

AI Log Monitor is a full-stack, AI-powered log analysis and semantic search platform designed to ingest application logs, analyze them using Large Language Models (LLMs), and enable high-performance vector-based similarity searches.

## Architecture

*   **Backend:** Java 21, Spring Boot 3, Spring Data JPA, Hibernate Vector
*   **Frontend:** React, Vite, Tailwind CSS, Context API, Recharts, i18next
*   **Database:** PostgreSQL with `pgvector` extension
*   **AI Engine:** Local execution via Ollama (qwen2.5) with Google Gemini 2.5 Flash API fallback for high availability.
*   **Alerting:** Real-time Slack Webhook integrations for CRITICAL logs.

## Features

1.  **Semantic RAG Search:** Automatically generates 768-dimensional embeddings for incoming logs. Uses PostgreSQL `cosine_distance` (`<=>`) to find semantically identical historical errors, returning root causes and solutions.
2.  **Cross-Lingual RAG:** Built-in dynamic translation layer. You can query the English vector database using Turkish natural language.
3.  **Resilient AI Analysis:** Failsafe AI mechanism. If the local Ollama instance crashes, it seamlessly falls back to cloud APIs.
4.  **Real-Time Dashboard:** Interactive visual metrics generated via Recharts.

## Local Setup Instructions

### Prerequisites
*   Java 21 (JDK)
*   Node.js & npm
*   Docker & Docker Compose (for pgvector database)
*   Ollama installed locally

### 1. Database Setup
A `docker-compose.yml` file is provided in the root directory to spin up PostgreSQL with the `pgvector` extension.
```bash
docker-compose up -d
```

### 2. Backend Setup
Navigate to the root directory and build the Spring Boot application using Maven wrapper:
```bash
./mvnw clean install -DskipTests
./mvnw spring-boot:run
```

### 3. Frontend Setup
Navigate to the frontend directory, install dependencies, and start the development server:
```bash
cd ai-log-monitor-ui
npm install
npm run dev
```

## Environment Variables (application.properties)
Ensure you configure the following properties in your `src/main/resources/application.properties` before running in a production-like environment:
*   `spring.datasource.url`
*   `slack.webhook.url`
*   `ai.fallback.api-key`

## License
Developed during the Summer 2026 Engineering Internship at Lastgen Software.
