# Backend Python Development Context

## Overview

This document provides context for backend Python development, focusing on best practices, coding standards, and common patterns used in our projects. It serves as a reference for both new and experienced developers to maintain consistency and quality across our Python codebases.

## Python Coding Standards

We follow the PEP 8 style guide with some project-specific adaptations. The following sections outline our key coding standards.

### Code Layout

- Use **4 spaces** for indentation (no tabs)
- Maximum line length: **79 characters** for code, **72 characters** for docstrings/comments
- Break lines before binary operators for better readability
- Surround top-level functions and classes with **two blank lines**
- Surround method definitions inside classes with **one blank line**

```python
def top_level_function():
    """This is a top-level function."""
    return True


class ExampleClass:
    """Example class demonstrating our coding standards."""
    
    def method_one(self):
        """First method in the class."""
        return "result"
    
    def method_two(self):
        """Second method in the class."""
        result = (self.method_one()
                 + " with additional text"
                 + " to demonstrate line breaking")
        return result


def another_top_level_function():
    """Another top-level function with two blank lines above."""
    return False
```

### Naming Conventions

| Type | Convention | Examples |
|------|------------|----------|
| Functions | lowercase_with_underscores | `calculate_total()`, `get_user_data()` |
| Variables | lowercase_with_underscores | `user_count`, `response_data` |
| Classes | CapWords/CamelCase | `UserProfile`, `DatabaseConnection` |
| Constants | UPPERCASE_WITH_UNDERSCORES | `MAX_CONNECTIONS`, `API_BASE_URL` |
| Modules | lowercase_short | `utils.py`, `db_helpers.py` |
| Packages | lowercase_no_underscores | `mypackage` |
| Methods | lowercase_with_underscores | `save_to_database()`, `validate_input()` |
| Private attributes | _leading_underscore | `_private_var`, `_internal_method()` |

### Import Organization

Organize imports in the following order, with a blank line between each group:

1. Standard library imports
2. Third-party library imports
3. Local application/library imports

```python
# Standard library
import os
import sys
from datetime import datetime

# Third-party
import pandas as pd
import requests
from fastapi import FastAPI

# Local application
from app.models import User
from app.utils.helpers import format_response
```

### Documentation

- Use docstrings for all public modules, functions, classes, and methods
- Follow Google-style docstrings for consistency
- Include type hints for function parameters and return values

```python
def process_user_data(user_id: str, include_history: bool = False) -> dict:
    """
    Process and retrieve user data from the database.
    
    Args:
        user_id: The unique identifier for the user
        include_history: Whether to include user history in the response
        
    Returns:
        A dictionary containing the processed user data
        
    Raises:
        ValueError: If the user_id is invalid
        DatabaseError: If there's an issue connecting to the database
    """
    # Implementation
    pass
```

## Backend Development Best Practices

### API Design

- Follow RESTful principles for API endpoints
- Use appropriate HTTP methods (GET, POST, PUT, DELETE)
- Return consistent response structures
- Include proper error handling and status codes

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class UserCreate(BaseModel):
    username: str
    email: str
    full_name: str = None

@app.post("/users/", status_code=201)
async def create_user(user: UserCreate):
    try:
        # Create user in database
        new_user = await db.create_user(user.dict())
        return {"id": new_user.id, "username": new_user.username}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
```

### Database Interactions

- Use ORM (SQLAlchemy) for database operations when possible
- Implement connection pooling for efficiency
- Use transactions for operations that require atomicity
- Write migrations for database schema changes

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import User

async def get_user_by_email(db: AsyncSession, email: str) -> User:
    """Retrieve a user by email address."""
    query = select(User).where(User.email == email)
    result = await db.execute(query)
    return result.scalars().first()

async def create_user_transaction(db: AsyncSession, user_data: dict) -> User:
    """Create a new user within a transaction."""
    async with db.begin():
        user = User(**user_data)
        db.add(user)
        # Additional operations within the same transaction
        await db.flush()
        return user
```

### Error Handling

- Be specific about the exceptions you catch
- Create custom exception classes for application-specific errors
- Log exceptions with appropriate context
- Return user-friendly error messages in API responses

```python
class ResourceNotFoundError(Exception):
    """Raised when a requested resource is not found."""
    pass

class ValidationError(Exception):
    """Raised when input validation fails."""
    pass

try:
    user = await get_user_by_id(user_id)
    if not user:
        raise ResourceNotFoundError(f"User with ID {user_id} not found")
    # Process user
except ResourceNotFoundError as e:
    logger.warning(f"Resource not found: {str(e)}")
    raise HTTPException(status_code=404, detail=str(e))
except ValidationError as e:
    logger.warning(f"Validation error: {str(e)}")
    raise HTTPException(status_code=400, detail=str(e))
except Exception as e:
    logger.error(f"Unexpected error processing user {user_id}: {str(e)}", exc_info=True)
    raise HTTPException(status_code=500, detail="An unexpected error occurred")
```

### Authentication and Authorization

- Use JWT or OAuth2 for authentication
- Implement role-based access control
- Store passwords using strong hashing algorithms (bcrypt, Argon2)
- Use HTTPS for all API endpoints

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await get_user_by_username(username)
    if user is None:
        raise credentials_exception
    return user

@app.get("/users/me")
async def read_users_me(current_user = Depends(get_current_user)):
    return current_user
```

### Asynchronous Programming

- Use async/await for I/O-bound operations
- Implement proper error handling in async code
- Be aware of common async pitfalls (e.g., blocking the event loop)

```python
import asyncio
from aiohttp import ClientSession

async def fetch_data(url: str) -> dict:
    """Fetch data from an external API asynchronously."""
    async with ClientSession() as session:
        async with session.get(url) as response:
            if response.status != 200:
                raise ValueError(f"API returned status code {response.status}")
            return await response.json()

async def fetch_multiple_resources(urls: list[str]) -> list[dict]:
    """Fetch multiple resources concurrently."""
    tasks = [fetch_data(url) for url in urls]
    return await asyncio.gather(*tasks, return_exceptions=True)
```

### Testing

- Write unit tests for all business logic
- Use pytest as the testing framework
- Implement integration tests for API endpoints
- Use fixtures and mocks appropriately

```python
import pytest
from unittest.mock import patch, MagicMock

@pytest.fixture
def mock_db_session():
    """Fixture providing a mock database session."""
    session = MagicMock()
    yield session

def test_get_user_by_email(mock_db_session):
    # Arrange
    mock_db_session.execute.return_value.scalars.return_value.first.return_value = {
        "id": "123", "email": "test@example.com", "username": "testuser"
    }
    email = "test@example.com"
    
    # Act
    result = get_user_by_email(mock_db_session, email)
    
    # Assert
    assert result["email"] == email
    assert result["username"] == "testuser"
    mock_db_session.execute.assert_called_once()
```

### Performance Optimization

- Use connection pooling for databases
- Implement caching for frequently accessed data
- Optimize database queries (indexing, query optimization)
- Use pagination for large result sets

```python
from functools import lru_cache
from redis import Redis

redis_client = Redis(host='localhost', port=6379, db=0)

@lru_cache(maxsize=100)
def get_cached_config(config_name: str) -> dict:
    """Get configuration with in-memory caching."""
    # Implementation
    pass

async def get_user_list(page: int = 1, page_size: int = 20):
    """Get paginated list of users."""
    skip = (page - 1) * page_size
    query = select(User).offset(skip).limit(page_size)
    result = await db.execute(query)
    users = result.scalars().all()
    
    # Get total count for pagination metadata
    count_query = select(func.count()).select_from(User)
    total = await db.execute(count_query)
    total_count = total.scalar()
    
    return {
        "items": users,
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "pages": (total_count + page_size - 1) // page_size
    }
```

### Logging

- Use structured logging
- Include contextual information in log messages
- Configure appropriate log levels for different environments
- Implement log rotation

```python
import logging
import json
from datetime import datetime

logger = logging.getLogger(__name__)

def log_request(request_id: str, user_id: str, endpoint: str, params: dict):
    """Log API request with structured data."""
    log_data = {
        "timestamp": datetime.utcnow().isoformat(),
        "request_id": request_id,
        "user_id": user_id,
        "endpoint": endpoint,
        "params": params
    }
    logger.info(f"API Request: {json.dumps(log_data)}")
```

## Tools and Environment

### Development Tools

- **Code Linting**: flake8, pylint
- **Code Formatting**: black, isort
- **Type Checking**: mypy
- **Testing**: pytest, pytest-cov
- **Documentation**: Sphinx
- **Dependency Management**: Poetry or pip-tools

### CI/CD Pipeline

- Run linting and type checking
- Execute unit and integration tests
- Generate test coverage reports
- Build and deploy application
- Run security scans

### Monitoring and Observability

- Implement health check endpoints
- Use structured logging
- Set up metrics collection (Prometheus)
- Configure distributed tracing (OpenTelemetry)
- Set up alerting for critical issues

## Conclusion

Following these guidelines will help ensure that our Python backend code is consistent, maintainable, and robust. While this document provides a comprehensive overview, it's important to adapt these practices to the specific needs of each project.

Remember that code quality is a shared responsibility. Regular code reviews, pair programming, and continuous learning are essential parts of our development process.

For more detailed information, refer to the following resources:
- [PEP 8 Style Guide](https://peps.python.org/pep-0008/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Python Testing with pytest](https://docs.pytest.org/)
