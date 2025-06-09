# Enterprise Demo Application

This is an enterprise-level 3-tier application built with Python, Java, and React to demonstrate Amazon Q's powerful features.

## Architecture

The application follows a 3-tier architecture:

1. **Frontend (React)**: Presentation layer
2. **Backend API (Python/FastAPI)**: Business logic layer
3. **Data Service (Java/Spring Boot)**: Data access layer

## Features

- Complete separation of concerns between tiers
- RESTful API communication between layers
- Authentication and authorization
- CRUD operations for products
- Responsive UI with Material-UI
- Data filtering and search capabilities

## Tech Stack

### Frontend
- React 18
- React Router v6
- Material-UI v5
- Axios for API calls
- Context API for state management

### Backend API
- Python 3.9+
- FastAPI
- Pydantic for data validation
- JWT authentication

### Data Service
- Java 17
- Spring Boot 3.1
- Spring Data JPA
- H2 Database (for demo purposes)
- Lombok

## Getting Started

### Prerequisites
- Node.js 16+
- Python 3.9+
- Java 17+
- Maven 3.8+

### Running the Data Service (Java)

```bash
cd enterprise-demo/dataservice
mvn spring-boot:run
```

The data service will be available at http://localhost:8081

### Running the Backend API (Python)

```bash
cd enterprise-demo/backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend API will be available at http://localhost:8000

### Running the Frontend (React)

```bash
cd enterprise-demo/frontend
npm install
npm start
```

The frontend will be available at http://localhost:3000

## API Documentation

- Backend API Swagger UI: http://localhost:8000/docs
- Data Service API: http://localhost:8081/swagger-ui.html

## Demo Credentials

- Username: demo
- Password: password

## Project Structure

```
enterprise-demo/
├── frontend/                # React frontend
│   ├── public/              # Static files
│   └── src/                 # React source code
│       ├── components/      # Reusable components
│       ├── contexts/        # React contexts
│       ├── layouts/         # Page layouts
│       ├── pages/           # Page components
│       └── services/        # API services
│
├── backend/                 # Python FastAPI backend
│   ├── app/                 # Application package
│   │   ├── __init__.py
│   │   ├── main.py          # Main application entry
│   │   ├── models.py        # Pydantic models
│   │   └── auth.py          # Authentication logic
│   └── requirements.txt     # Python dependencies
│
└── dataservice/             # Java Spring Boot data service
    ├── src/                 # Source code
    │   ├── main/
    │   │   ├── java/        # Java code
    │   │   └── resources/   # Configuration files
    │   └── test/            # Test code
    └── pom.xml              # Maven configuration
```

## License

This project is licensed under the MIT License.
