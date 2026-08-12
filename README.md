# 🚗 EcommerCar - AI-Integrated Microservices Car Retail System

Welcome to **EcommerCar**, a modern online car trading e-commerce platform. The system is built on a powerful **Microservices** architecture, combined with intelligent search technologies and automated consulting powered by **Artificial Intelligence (AI Service)**.

This platform allows users to search for cars, view details, place online deposits via the **VNPay** electronic payment gateway, and chat directly with consultants or an AI virtual assistant to get on-road price quotes and suitable car recommendations.

---

## 📐 System Architecture

Below is a detailed diagram of the EcommerCar system architecture, including the data flow from the Client through the Reverse Proxy layer, the security Gateway, the Service Registry, the event-driven business Microservices communicating via a Message Broker, and the integrated AI service:

<img width="1880" height="1298" alt="image" src="https://github.com/user-attachments/assets/3982835f-a218-40df-bd9a-074c6f4ce8b1" />

---

## 🛠️ List of Services & Connection Ports

The system is divided into independent services to increase scalability and fault tolerance.

| Service Name | Main Technology | Local Port (Dev) | Docker Compose Port | Database / External Integration | Main Function |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **Eureka Server** | Java, Spring Cloud Eureka | `8761` | `8761` | None | Manages service registration and discovery (Service Registry & Discovery). |
| **API Gateway** | Java, Spring Cloud Gateway | `8888` | `8888` | Keycloak SSO | Single entry point, responsible for routing and security checks (JWT). |
| **Identity Service** | Java, Spring Boot, Spring Security | `8080` | `8081` | MySQL, Keycloak, Cloudinary | Manages users, permissions, personal profile and avatar updates. |
| **Catalog Service** | Java, Spring Boot, JPA | `8081` | `8082` | MySQL, Cloudinary, RabbitMQ | Manages car information, brand catalogs, retail prices, deposit/sale status. |
| **Ordering Service** | Java, Spring Boot | `8082` | `8083` | MySQL, RabbitMQ | Handles the cart, deposit reservations, order creation, and order status management. |
| **Payment Service** | Java, Spring Boot | `8083` | `8084` | MySQL, VNPay Sandbox, RabbitMQ | Processes deposit payments via the VNPay gateway and reconciles transaction status. |
| **Chat Service** | Java, Spring Boot, WebSocket | `8084` | `8085` | MongoDB, RabbitMQ | Real-time online chat channel between customers and sales consultants. |
| **Notification Service**| Java, Spring Boot | `8085` | `8088` | MongoDB, SendGrid API, RabbitMQ | Automatically sends invoice emails and deposit confirmation notifications. |
| **AI Service** | Python, FastAPI, LangChain | `8000` | `8000` (Local) | Redis Search, ChromaDB, Gemini/OpenAI | Smart car consulting virtual assistant, real on-road price calculation, car recommendations, and Semantic Search. |
| **React Frontend** | ReactJS, TailwindCSS | `3000` | `3000` | Nginx | Customer-facing interface: browse cars, compare, deposit, live chat, and ask the AI. |

---

## ⚡ Key Features

1. **Centralized Security (Single Sign-On - SSO)**: Strongly integrated with **Keycloak** to secure every API flow using JWT token encryption with detailed role-based access control (RBAC).
2. **Event-Driven Architecture**: Uses **RabbitMQ** for asynchronous message transmission. For example: when a deposit payment succeeds, the `Payment Service` emits an event → the `Ordering Service` updates the order status → the `Catalog Service` locks the car → the `Notification Service` sends an invoice email to the customer.
3. **Smart AI Assistant**:
   - Uses a large language model (LLM - Google Gemini / OpenAI) integrated with **RAG (Retrieval-Augmented Generation)** combined with the **ChromaDB** vector database so the chatbot can accurately answer questions about the technical specs of cars available in the showroom.
   - **Semantic Caching with Redis Stack**: Caches common questions semantically to deliver instant chatbot responses (<10ms) and save on LLM API costs.
   - **AI Price Prediction / Cost Estimator**: Automatically analyzes the base price and accurately calculates the on-road cost of a car in different provinces (registration fee, license plate fee, road usage fee, etc.).
4. **Secure Payment**: Integrated with the highly secure national **VNPay Sandbox** payment gateway, allowing customers to place a 100% online deposit quickly and easily.
5. **Cloud Image Management**: Synchronized storage and optimization of car images and user avatars via **Cloudinary**.

---

## 💾 Prerequisites

Before installing, your machine needs to have the following tools pre-installed:
*   [Docker & Docker Compose](https://www.docker.com/products/docker-desktop/) (recommended for quick infrastructure setup).
*   [Java Development Kit (JDK) 17](https://www.oracle.com/java/technologies/downloads/#java17) or newer.
*   [Apache Maven 3.8+](https://maven.apache.org/) (if running locally without Docker).
*   [Node.js 18+](https://nodejs.org/) & `npm` or `yarn`.
*   [Python 3.10+](https://www.python.org/downloads/) (for the AI service).

---

## 🚀 Installation and Setup Guide

You can run the system in two ways: **Method 1 (Fastest - Run entirely with Docker Compose)** or **Method 2 (Run each part locally for easier development/debugging)**.

### Configure environment variables before running

In the `/EcommerWebCar/.env` folder, configure your API Keys and appropriate IP settings:
```env
PUBLIC_IP=localhost
KEYCLOAK_PORT=8180
EUREKA_PORT=8761
API_GATEWAY_PORT=8888
FRONTEND_PORT=3000

# Image storage and payment services (Replace with your own keys)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_email@gmail.com
SENDGRID_FROM_NAME=EcommerCar_Showroom

VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_HASH_SECRET=your_vnpay_hash_secret
```

Similarly, in `/EcommerWebCar/ai-service/.env`, update the API Keys for the AI service:
```env
REDIS_URL=redis://localhost:6379
GOOGLE_API_KEY=AIzaSy... (your Google Gemini API Key)
OPEN_API_KEY=sk-... (your OpenAI API Key if using GPT)
SHOWROOM_API_URL=http://localhost:8888/api/v1  # Routes through the API Gateway
```

---

### 🐳 METHOD 1: Run the Entire System Quickly with Docker Compose (Recommended)

This method pulls up all the database containers, Keycloak, RabbitMQ, Redis, the 7 Java microservices, and the React Frontend to run together with just a single command.

1.  Open a Terminal and navigate to the project directory containing the `docker-compose.yml` file:
    ```bash
    cd EcommerWebCar
    ```
2.  Start all services in detached mode:
    ```bash
    docker compose up -d
    ```
3.  Check the status of the running containers:
    ```bash
    docker compose ps
    ```

> [!NOTE]
> The process of pulling images and initializing the databases may take 5-10 minutes depending on your network speed. Once started successfully, you can access the user interface right away at `http://localhost:3000`.

---

### 💻 METHOD 2: Start Each Service Manually (For Development & Debugging)

When you want to edit the source code of each service, running locally directly in an IDE (IntelliJ IDEA, VS Code) is more convenient.

#### Step 1: Start the infrastructure (Database, Message Broker, Cache)
We take advantage of Docker Compose to quickly set up the background services without needing a cumbersome install on the host machine.
1.  Navigate to the `EcommerWebCar` directory.
2.  Start only the required infrastructure services:
    ```bash
    docker compose up -d mongodb car_mysql keycloak rabbitmq car_redis
    ```

#### Step 2: Run the Service Registry (Eureka Server)
Every Java microservice needs to register with the Eureka Server first, so this must be the first service started.
1.  Navigate to the eureka-server directory:
    ```bash
    cd EcommerWebCar/eureka-server
    ```
2.  Start the service:
    ```bash
    ../mvnw spring-boot:run
    ```
    *(The Eureka Dashboard will be available at `http://localhost:8761`)*

#### Step 3: Start the API Gateway
1.  Navigate to the api-gateway directory:
    ```bash
    cd ../api-gateway
    ```
2.  Start the service:
    ```bash
    ../mvnw spring-boot:run
    ```

#### Step 4: Run the Backend Java Services
Open new terminals one by one to start the following core services (or open the `EcommerWebCar` project in IntelliJ IDEA and hit Run for each):
*   **Identity Service**: `cd ../identity-service && ../mvnw spring-boot:run`
*   **Catalog Service**: `cd ../catalog-service && ../mvnw spring-boot:run`
*   **Ordering Service**: `cd ../ordering-service && ../mvnw spring-boot:run`
*   **Payment Service**: `cd ../payment-service && ../mvnw spring-boot:run`
*   **Chat Service**: `cd ../chat-service && ../mvnw spring-boot:run`
*   **Notification Service**: `cd ../notification-service && ../mvnw spring-boot:run`

#### Step 5: Run the AI Service (FastAPI)
The AI service is written in Python, so we need to set up a Python virtual environment first:
1.  Open a new terminal and navigate to the AI directory:
    ```bash
    cd EcommerWebCar/ai-service
    ```
2.  Create and activate the virtual environment:
    ```bash
    # On macOS/Linux:
    python3 -m venv venv
    source venv/bin/activate

    # On Windows:
    python -m venv venv
    venv\Scripts\activate
    ```
3.  Install the required dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Start the FastAPI server using Uvicorn:
    ```bash
    uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
    ```
    *(The AI Service Swagger API documentation will appear at `http://localhost:8000/docs`)*

#### Step 6: Start the Frontend Interface (React JS)
1.  Open a new terminal and navigate to the application's frontend directory:
    ```bash
    cd carecommerapp
    ```
2.  Install the Node.js packages:
    ```bash
    yarn install
    # Or if using npm:
    npm install
    ```
3.  Start the Frontend application in dev mode:
    ```bash
    yarn start
    # Or if using npm:
    npm start
    ```
    *(Open your browser and go to `http://localhost:3000` to start experiencing the app)*

---

## 🔑 Keycloak (IAM) Configuration Guide

For login and authorization to work correctly, you need to configure Keycloak:
1.  Access the Keycloak Admin Console at: `http://localhost:8180` (Account: `admin` / Password: `admin` as configured in docker-compose).
2.  Create a new **Realm** named: `car-ecommerce-realm` (or import the JSON configuration file from the config folder if available).
3.  Within the newly created Realm, configure the **Clients**:
    *   `car-shop-client`: Client type is *public* (so the React Frontend can connect to obtain a token).
    *   `backend-gateway-client`: Client type is *confidential* (so the API Gateway can decode and validate the token).
4.  Configure the **Roles**, including `ROLE_USER` and `ROLE_ADMIN`, to grant corresponding permissions on the interface as well as the API endpoints.

---

## 🔗 Important Access URLs

Once you have fully started the system, you can access the services via the following links:

*   **💻 User Interface (React App)**: [http://localhost:3000](http://localhost:3000)
*   **🔍 Eureka Service Admin Dashboard**: [http://localhost:8761](http://localhost:8761)
*   **🔑 Keycloak Account Admin Console**: [http://localhost:8180](http://localhost:8180)
*   **🐇 RabbitMQ Management Page**: [http://localhost:15672](http://localhost:15672) (User: `root` / Pass: `123456`)
*   **🤖 AI Service Swagger API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
*   **🔀 API Gateway Entry Point**: [http://localhost:8888](http://localhost:8888)

---

## 🤝 Contributing Guide

All contributions, bug reports, or new feature suggestions are welcome! Please follow these steps:
1.  Fork this project to your own GitHub account.
2.  Create a new branch for your feature: `git checkout -b feature/new-feature`.
3.  Commit your changes with a clear description: `git commit -m "Add feature A"`.
4.  Push to that branch: `git push origin feature/new-feature`.
5.  Open a **Pull Request** on the original repository for review and merging.

---

## 📄 License
This project is distributed under the **MIT License**. You are fully permitted to copy, modify, and use it for non-commercial learning and research purposes.
Enjoy your experience with **EcommerCar**! 🚀
