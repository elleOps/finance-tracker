from main import SessionLocal, Category

DEFAULT_CATEGORIES = ["Groceries", "Rent", "Salary", "Transport", "Entertainment", "Utilities"]

db = SessionLocal()

for name in DEFAULT_CATEGORIES:
    exists = db.query(Category).filter(Category.name == name).first()
    if not exists:
        db.add(Category(name=name))

db.commit()
db.close()
print("Seeded categories.")