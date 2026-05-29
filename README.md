# 🚗 EcommerCar - Hệ Thống Bán Lẻ Ô Tô Microservices Tích Hợp AI

Chào mừng bạn đến với **EcommerCar**, một nền tảng thương mại điện tử mua bán ô tô trực tuyến hiện đại. Hệ thống được phát triển dựa trên kiến trúc **Microservices** mạnh mẽ, kết hợp với các công nghệ tìm kiếm thông minh và tư vấn tự động bằng **Trí tuệ Nhân tạo (AI Service)**.

Nền tảng này cho phép người dùng tìm kiếm, xem chi tiết, đặt cọc xe trực tuyến qua cổng thanh toán điện tử VNPay, trò chuyện trực tiếp với tư vấn viên hoặc trợ lý ảo AI để được báo giá lăn bánh, đề xuất xe phù hợp nhu cầu.

---

## 📐 Kiến Trúc Hệ Thống (System Architecture)

Dưới đây là sơ đồ chi tiết kiến trúc của hệ thống EcommerCar, bao gồm luồng đi của dữ liệu từ Client qua lớp Reverse Proxy, Gateway bảo mật, hệ thống Service Registry, các Microservices nghiệp vụ giao tiếp hướng sự kiện qua Message Broker, và dịch vụ AI tích hợp:

<img width="1880" height="1204" alt="image" src="https://github.com/user-attachments/assets/4e1e5c1c-ae21-4d28-85f0-86b5b35822f7" />


---

## 🛠️ Danh Sách Các Dịch Vụ & Cổng Kết Nối

Hệ thống được chia thành các dịch vụ độc lập giúp tăng khả năng mở rộng (scalability) và khả năng chịu lỗi (fault tolerance). 

| Tên Dịch Vụ | Công Nghệ Chính | Cổng Local (Dev) | Cổng Docker Compose | Cơ Sở Dữ Liệu / Tích Hợp Ngoại Vi | Chức Năng Chính |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **Eureka Server** | Java, Spring Cloud Eureka | `8761` | `8761` | Không | Quản lý đăng ký dịch vụ và khám phá dịch vụ (Service Registry & Discovery). |
| **API Gateway** | Java, Spring Cloud Gateway | `8888` | `8888` | Keycloak SSO | Điểm đầu vào duy nhất, chịu trách nhiệm định tuyến, kiểm tra bảo mật (JWT). |
| **Identity Service** | Java, Spring Boot, Spring Security | `8080` | `8081` | MySQL, Keycloak, Cloudinary | Quản lý người dùng, phân quyền, cập nhật hồ sơ cá nhân và ảnh đại diện. |
| **Catalog Service** | Java, Spring Boot, JPA | `8081` | `8082` | MySQL, Cloudinary, RabbitMQ | Quản lý thông tin xe, danh mục hãng xe, giá bán lẻ, trạng thái đặt cọc/bán. |
| **Ordering Service** | Java, Spring Boot | `8082` | `8083` | MySQL, RabbitMQ | Xử lý giỏ hàng, đặt cọc giữ xe, tạo đơn đặt hàng và quản lý trạng thái đơn hàng. |
| **Payment Service** | Java, Spring Boot | `8083` | `8084` | MySQL, VNPay Sandbox, RabbitMQ | Xử lý thanh toán tiền cọc qua cổng VNPay, đối soát trạng thái giao dịch. |
| **Notification Service**| Java, Spring Boot | `8085` | `8088` | MongoDB, SendGrid API, RabbitMQ | Tự động gửi email thông báo hóa đơn, xác nhận đặt cọc thành công. |
| **Chat Service** | Java, Spring Boot, WebSocket | `8084` | `8085` | MongoDB, RabbitMQ | Kênh chat trực tuyến thời gian thực giữa Khách hàng và Nhân viên tư vấn. |
| **AI Service** | Python, FastAPI, LangChain | `8000` | `8000` (Local) | Redis Search, ChromaDB, Gemini/OpenAI | Trợ lý ảo tư vấn xe thông minh, tính giá lăn bánh thực tế, đề xuất xe và Semantic Search. |
| **React Frontend** | ReactJS, TailwindCSS | `3000` | `3000` | Nginx | Giao diện phía khách hàng: duyệt xe, so sánh, đặt cọc, chat trực tuyến và hỏi AI. |

---

## ⚡ Các Tính Năng Nổi Bật

1. **Bảo Mật Tập Trung (Single Sign-On - SSO)**: Tích hợp mạnh mẽ với **Keycloak** giúp bảo mật mọi luồng API bằng cơ chế mã hóa JWT token phân quyền chi tiết (RBAC).
2. **Giao Tiếp Hướng Sự Kiện (Event-Driven Architecture)**: Sử dụng **RabbitMQ** để truyền tải thông điệp không đồng bộ. Ví dụ: khi thanh toán cọc thành công, `Payment Service` phát đi sự kiện -> `Ordering Service` chuyển trạng thái đơn hàng -> `Catalog Service` khóa xe -> `Notification Service` gửi email hóa đơn cho khách hàng.
3. **Trợ Lý Trí Tuệ Nhân Tạo Thông Minh**: 
   - Sử dụng mô hình ngôn ngữ lớn (LLM - Google Gemini / OpenAI) tích hợp kỹ thuật **RAG (Retrieval-Augmented Generation)** kết hợp CSDL Vector **ChromaDB** để chatbot trả lời chính xác thông số kỹ thuật xe có sẵn trong showroom.
   - **Semantic Caching với Redis Stack**: Lưu trữ đệm ngữ nghĩa các câu hỏi phổ biến giúp phản hồi chatbot ngay lập tức (<10ms) và tiết kiệm chi phí gọi API của LLM.
   - **AI Price Prediction / Cost Estimator**: Tự động phân tích giá gốc và tính toán chính xác chi phí lăn bánh của xe tại các tỉnh thành (phí trước bạ, biển số, phí đường bộ...).
4. **Thanh Toán An Toàn**: Tích hợp cổng thanh toán quốc gia **VNPay Sandbox** bảo mật cao, cho phép khách hàng đặt cọc 100% trực tuyến nhanh gọn.
5. **Quản Lý Ảnh Đám Mây**: Đồng bộ lưu trữ và tối ưu hóa tài nguyên hình ảnh xe cộ, avatar người dùng qua **Cloudinary**.

---

## 💾 Yêu Cầu Hệ Thống (Prerequisites)

Trước khi tiến hành cài đặt, máy tính của bạn cần được cài đặt sẵn các công cụ sau:
*   [Docker & Docker Compose](https://www.docker.com/products/docker-desktop/) (Khuyên dùng để cài đặt hạ tầng nhanh chóng).
*   [Java Development Kit (JDK) 17](https://www.oracle.com/java/technologies/downloads/#java17) hoặc mới hơn.
*   [Apache Maven 3.8+](https://maven.apache.org/) (nếu chạy local không qua Docker).
*   [Node.js 18+](https://nodejs.org/) & `npm` hoặc `yarn`.
*   [Python 3.10+](https://www.python.org/downloads/) (cho dịch vụ AI).

---

## 🚀 Hướng Dẫn Cài Đặt Và Chạy Hệ Thống

Bạn có thể chạy hệ thống theo hai cách: **Cách 1 (Nhanh nhất - Chạy hoàn toàn bằng Docker Compose)** hoặc **Cách 2 (Chạy từng phần bằng Local Dev để dễ lập trình/debug)**.

### Cấu hình biến môi trường trước khi chạy

Ở thư mục `/EcommerWebCar/.env`, hãy cấu hình các API Key và cấu hình IP phù hợp:
```env
PUBLIC_IP=localhost
KEYCLOAK_PORT=8180
EUREKA_PORT=8761
API_GATEWAY_PORT=8888
FRONTEND_PORT=3000

# Dịch vụ lưu trữ ảnh và thanh toán (Thay bằng Key cá nhân của bạn)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_email@gmail.com
SENDGRID_FROM_NAME=EcommerCar_Showroom

VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_HASH_SECRET=your_vnpay_hash_secret
```

Tương tự, ở `/EcommerWebCar/ai-service/.env`, cập nhật API Key cho AI:
```env
REDIS_URL=redis://localhost:6379
GOOGLE_API_KEY=AIzaSy... (API Key của Google Gemini)
OPEN_API_KEY=sk-... (API Key của OpenAI nếu dùng GPT)
SHOWROOM_API_URL=http://localhost:8888/api/v1  # Trỏ qua API Gateway
```

---

### 🐳 CÁCH 1: Chạy Nhanh Toàn Bộ Hệ Thống Với Docker Compose (Khuyên dùng)

Cách này sẽ kéo tất cả các container cơ sở dữ liệu, Keycloak, RabbitMQ, Redis, 7 microservices Java và React Frontend lên chạy đồng bộ chỉ với 1 câu lệnh.

1.  Mở Terminal và di chuyển vào thư mục dự án chứa file `docker-compose.yml`:
    ```bash
    cd EcommerWebCar
    ```
2.  Khởi chạy toàn bộ dịch vụ dưới chế độ chạy nền (detached mode):
    ```bash
    docker compose up -d
    ```
3.  Kiểm tra trạng thái hoạt động của các container:
    ```bash
    docker compose ps
    ```

> [!NOTE]  
> Quá trình tải các image và khởi tạo cơ sở dữ liệu ban đầu có thể mất từ 5-10 phút tùy thuộc vào tốc độ mạng của bạn. Sau khi khởi động thành công, bạn có thể truy cập ngay vào giao diện người dùng tại `http://localhost:3000`.

---

### 💻 CÁCH 2: Khởi Chạy Từng Dịch Vụ Thủ Công (Dành Cho Phát Triển & Debug)

Khi muốn chỉnh sửa mã nguồn của từng dịch vụ, việc chạy local trực tiếp trên IDE (IntelliJ IDEA, VS Code) sẽ tiện lợi hơn.

#### Bước 1: Khởi động cơ sở hạ tầng (Database, Message Broker, Cache)
Ta tận dụng Docker Compose để dựng nhanh các dịch vụ nền mà không cần cài đặt rườm rà trên máy thật.
1.  Di chuyển vào thư mục `EcommerWebCar`.
2.  Chỉ khởi động các dịch vụ hạ tầng cần thiết:
    ```bash
    docker compose up -d mongodb car_mysql keycloak rabbitmq car_redis
    ```

#### Bước 2: Chạy Service Registry (Eureka Server)
Mọi microservice Java đều cần đăng ký với Eureka Server trước, do đó đây là dịch vụ đầu tiên phải được bật.
1.  Di chuyển vào thư mục eureka-server:
    ```bash
    cd EcommerWebCar/eureka-server
    ```
2.  Khởi chạy dịch vụ:
    ```bash
    ../mvnw spring-boot:run
    ```
    *(Eureka Dashboard sẽ khả dụng tại `http://localhost:8761`)*

#### Bước 3: Khởi chạy API Gateway
1.  Di chuyển vào thư mục api-gateway:
    ```bash
    cd ../api-gateway
    ```
2.  Khởi chạy dịch vụ:
    ```bash
    ../mvnw spring-boot:run
    ```

#### Bước 4: Chạy các Backend Java Services
Lần lượt mở các terminal mới để khởi chạy các dịch vụ cốt lõi sau (hoặc mở dự án `EcommerWebCar` bằng IntelliJ IDEA và nhấn nút Run lần lượt):
*   **Identity Service**: `cd ../identity-service && ../mvnw spring-boot:run`
*   **Catalog Service**: `cd ../catalog-service && ../mvnw spring-boot:run`
*   **Ordering Service**: `cd ../ordering-service && ../mvnw spring-boot:run`
*   **Payment Service**: `cd ../payment-service && ../mvnw spring-boot:run`
*   **Chat Service**: `cd ../chat-service && ../mvnw spring-boot:run`
*   **Notification Service**: `cd ../notification-service && ../mvnw spring-boot:run`

#### Bước 5: Chạy AI Service (FastAPI)
Dịch vụ AI được viết bằng Python, do đó ta cần thiết lập môi trường ảo Python trước:
1.  Mở terminal mới và di chuyển vào thư mục AI:
    ```bash
    cd EcommerWebCar/ai-service
    ```
2.  Tạo và kích hoạt môi trường ảo (Virtual Environment):
    ```bash
    # Trên macOS/Linux:
    python3 -m venv venv
    source venv/bin/activate

    # Trên Windows:
    python -m venv venv
    venv\Scripts\activate
    ```
3.  Cài đặt các thư viện dependencies cần thiết:
    ```bash
    pip install -r requirements.txt
    ```
4.  Khởi chạy server FastAPI sử dụng Uvicorn:
    ```bash
    uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
    ```
    *(Tài liệu API Swagger của AI Service sẽ xuất hiện tại `http://localhost:8000/docs`)*

#### Bước 6: Khởi chạy Giao diện Frontend (React JS)
1.  Mở terminal mới và chuyển đến thư mục frontend của ứng dụng:
    ```bash
    cd carecommerapp
    ```
2.  Cài đặt các gói tài nguyên Node.js:
    ```bash
    yarn install
    # Hoặc nếu dùng npm:
    npm install
    ```
3.  Khởi chạy ứng dụng Frontend dưới môi trường dev:
    ```bash
    yarn start
    # Hoặc nếu dùng npm:
    npm start
    ```
    *(Mở trình duyệt truy cập `http://localhost:3000` để bắt đầu trải nghiệm)*

---

## 🔑 Hướng Dẫn Cấu Hình Keycloak (IAM)

Để hệ thống đăng nhập và phân quyền hoạt động chính xác, bạn cần cấu hình Keycloak:
1.  Truy cập vào Keycloak Admin Console tại địa chỉ: `http://localhost:8180` (Tài khoản: `admin` / Mật khẩu: `admin` như đã cấu hình trong docker-compose).
2.  Tạo một **Realm** mới tên là: `car-ecommerce-realm` (hoặc import file cấu hình json từ thư mục cấu hình nếu có).
3.  Trong Realm mới tạo, cấu hình các **Client**:
    *   `car-shop-client`: Loại client là *public* (để React Frontend kết nối lấy token).
    *   `backend-gateway-client`: Loại client là *confidential* (để API Gateway giải mã và xác thực token).
4.  Cấu hình các **Roles** bao gồm: `ROLE_USER` và `ROLE_ADMIN` để phân quyền tương ứng trên giao diện cũng như các API Endpoint.

---

## 🔗 Các Địa Chỉ Truy Cập Quan Trọng

Sau khi khởi chạy hoàn tất toàn bộ hệ thống, bạn có thể truy cập các dịch vụ qua các đường dẫn sau:

*   **💻 Giao Diện Người Dùng (React App)**: [http://localhost:3000](http://localhost:3000)
*   **🔍 Bảng Quản Trị Dịch Vụ Eureka**: [http://localhost:8761](http://localhost:8761)
*   **🔑 Quản Trị Tài Khoản Keycloak Console**: [http://localhost:8180](http://localhost:8180)
*   **🐇 Trang Quản Lý RabbitMQ Management**: [http://localhost:15672](http://localhost:15672) (User: `root` / Pass: `123456`)
*   **🤖 Swagger UI Tài Liệu API Dịch Vụ AI**: [http://localhost:8000/docs](http://localhost:8000/docs)
*   **🔀 Đầu Vào Cổng API Gateway**: [http://localhost:8888](http://localhost:8888)

---

## 🤝 Hướng Dẫn Đóng Góp (Contributing)
Mọi ý kiến đóng góp, báo cáo lỗi hoặc đề xuất tính năng mới đều được chào đón! Bạn vui lòng tuân theo các bước sau:
1.  Fork dự án này về tài khoản GitHub của bạn.
2.  Tạo một nhánh (branch) mới cho tính năng của bạn: `git checkout -b feature/tinh-nang-moi`.
3.  Commit các thay đổi của bạn kèm theo mô tả rõ ràng: `git commit -m "Thêm tính năng A"`.
4.  Push lên nhánh đó: `git push origin feature/tinh-nang-moi`.
5.  Mở một **Pull Request** trên kho lưu trữ gốc để được kiểm duyệt và gộp code.

---

## 📄 Bản Quyền (License)
Dự án được phân phối dưới giấy phép **MIT License**. Bạn hoàn toàn được phép sao chép, chỉnh sửa và sử dụng cho mục đích học tập và nghiên cứu phi thương mại.
Chúc bạn có những trải nghiệm tuyệt vời với **EcommerCar**! 🚀
