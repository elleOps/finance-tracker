from datetime import date
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import create_engine, Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from fastapi.middleware.cors import CORSMiddleware

# Database connection
SQLALCHEMY_DATABASE_URL = "sqlite:///./finance.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Models
class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    transactions = relationship("Transaction", back_populates="category")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=False)
    date = Column(Date, nullable=False, default=date.today)
    type = Column(String, nullable=False)  # "income" or "expense"
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)

    category = relationship("Category", back_populates="transactions")

from typing import List, Literal
from pydantic import BaseModel

# Pydantic schemas (request/repsonse shapes)
class CategoryCreate(BaseModel):
    name: str

class CategoryOut(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True

class TransactionCreate(BaseModel):
    amount: float
    description: str
    date: date
    type: Literal["income", "expense"]
    category_id: int

class TransactionUpdate(BaseModel):
    amount: float
    description: str
    date: date
    type: Literal["income", "expense"]
    category_id: int

class TransactionOut(BaseModel):
    id: int
    amount: float
    description: str
    date: date
    type: Literal["income", "expense"]
    category_id: int
    class Config:
        from_attributes = True

# App + database session dependency
app= FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],)

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoints
@app.post("/categories", response_model=CategoryOut)
def create_category(category: CategoryCreate, db=Depends(get_db)):
    new_category = Category(name=category.name)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category

@app.get("/categories", response_model=List[CategoryOut])
def list_categories(db=Depends(get_db)):
    return db.query(Category).all()

@app.post("/transactions", response_model=TransactionOut)
def create_transaction(transaction: TransactionCreate, db=Depends(get_db)):
    new_transaction = Transaction(**transaction.model_dump())
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    return new_transaction

@app.get("/transactions", response_model=List[TransactionOut])
def list_transactions(db=Depends(get_db)):
    return (
        db.query(Transaction)
        .order_by(Transaction.date.desc())
        .all()
    )

@app.put("/transactions/{transaction_id}", response_model=TransactionOut)
def update_transaction(
    transaction_id: int,
    transaction: TransactionUpdate,
    db=Depends(get_db),
):
    existing_transaction = (
        db.query(Transaction)
        .filter(Transaction.id == transaction_id)
        .first()
    )

    if existing_transaction is None:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found",
        )

    existing_transaction.amount = transaction.amount
    existing_transaction.description = transaction.description
    existing_transaction.date = transaction.date
    existing_transaction.type = transaction.type
    existing_transaction.category_id = transaction.category_id

    db.commit()
    db.refresh(existing_transaction)

    return existing_transaction

@app.get("/summary")
def get_summary(db=Depends(get_db)):
    transactions = db.query(Transaction).all()
    
    total_income = sum(
        t.amount for t in transactions if t.type == "income")
    
    total_expenses = sum(
        t.amount for t in transactions if t.type == "expense")
    
    return {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "balance": total_income - total_expenses,}

@app.delete("/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, db=Depends(get_db)):
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id
    ).first()

    if transaction is None:
        return {"error": "Transaction not found"}

    db.delete(transaction)
    db.commit()

    return {"deleted": transaction_id}