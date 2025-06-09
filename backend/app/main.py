from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import requests
import os
from dotenv import load_dotenv

from app.models import ProductCreate, ProductResponse, ProductUpdate, UserCreate, UserResponse, Token
from app.auth import create_access_token, get_current_user, get_password_hash, verify_password

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Enterprise Demo Backend API",
    description="Business Logic Layer for Enterprise Demo Application",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data service URL
DATA_SERVICE_URL = os.getenv("DATA_SERVICE_URL", "http://localhost:8081/api")

# Mock user database for demo purposes
users_db = {}

@app.get("/")
def read_root():
    return {"message": "Welcome to Enterprise Demo Backend API"}

@app.get("/health")
def health_check():
    try:
        # Check if data service is available
        response = requests.get(f"{DATA_SERVICE_URL}/products")
        if response.status_code == 200:
            return {"status": "healthy", "data_service": "connected"}
        return {"status": "degraded", "data_service": "unavailable"}
    except Exception as e:
        return {"status": "degraded", "error": str(e)}

# Product endpoints
@app.get("/products", response_model=List[ProductResponse])
def get_products(category: Optional[str] = None, max_price: Optional[float] = None):
    try:
        if category:
            response = requests.get(f"{DATA_SERVICE_URL}/products/category/{category}")
        elif max_price:
            response = requests.get(f"{DATA_SERVICE_URL}/products/price/{max_price}")
        else:
            response = requests.get(f"{DATA_SERVICE_URL}/products")
        
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
                           detail=f"Data service unavailable: {str(e)}")

@app.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: int):
    try:
        response = requests.get(f"{DATA_SERVICE_URL}/products/{product_id}")
        if response.status_code == 404:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                               detail=f"Product with ID {product_id} not found")
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
                           detail=f"Data service unavailable: {str(e)}")

@app.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product: ProductCreate, current_user: UserResponse = Depends(get_current_user)):
    try:
        response = requests.post(
            f"{DATA_SERVICE_URL}/products",
            json=product.dict()
        )
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
                           detail=f"Data service unavailable: {str(e)}")

@app.put("/products/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product: ProductUpdate, current_user: UserResponse = Depends(get_current_user)):
    try:
        response = requests.put(
            f"{DATA_SERVICE_URL}/products/{product_id}",
            json=product.dict(exclude_unset=True)
        )
        if response.status_code == 404:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                               detail=f"Product with ID {product_id} not found")
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
                           detail=f"Data service unavailable: {str(e)}")

@app.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, current_user: UserResponse = Depends(get_current_user)):
    try:
        response = requests.delete(f"{DATA_SERVICE_URL}/products/{product_id}")
        if response.status_code == 404:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                               detail=f"Product with ID {product_id} not found")
        response.raise_for_status()
        return None
    except requests.RequestException as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
                           detail=f"Data service unavailable: {str(e)}")

# User authentication endpoints
@app.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate):
    if user.username in users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    users_db[user.username] = {
        "username": user.username,
        "email": user.email,
        "hashed_password": hashed_password,
        "disabled": False
    }
    
    return {
        "username": user.username,
        "email": user.email,
        "disabled": False
    }

@app.post("/token", response_model=Token)
def login_for_access_token(username: str, password: str):
    user = users_db.get(username)
    if not user or not verify_password(password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=UserResponse)
def read_users_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user
