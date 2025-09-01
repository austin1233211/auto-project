"""Database setup and initialization script"""

import os
import sys
import asyncio
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import Base, engine
from app.models import Player, PlayerStats, Tournament, TournamentParticipant, Match

def create_database_if_not_exists():
    """Create the database if it doesn't exist"""
    db_url = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/auto_gladiators")
    
    if db_url.startswith("postgresql://"):
        url_parts = db_url.replace("postgresql://", "").split("/")
        db_name = url_parts[-1] if len(url_parts) > 1 else "auto_gladiators"
        
        base_url = db_url.rsplit("/", 1)[0] + "/postgres"
        
        try:
            conn = psycopg2.connect(base_url.replace("postgresql://", "").replace("@", " host=").replace(":", " port=").replace("/postgres", " dbname=postgres"))
            conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            
            cursor = conn.cursor()
            
            cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", (db_name,))
            exists = cursor.fetchone()
            
            if not exists:
                print(f"Creating database: {db_name}")
                cursor.execute(f'CREATE DATABASE "{db_name}"')
                print(f"Database {db_name} created successfully")
            else:
                print(f"Database {db_name} already exists")
            
            cursor.close()
            conn.close()
            
        except Exception as e:
            print(f"Error creating database: {e}")
            print("Please ensure PostgreSQL is running and credentials are correct")
            return False
    
    return True

def run_schema_migrations():
    """Run database schema migrations"""
    try:
        print("Creating database tables...")
        
        Base.metadata.create_all(bind=engine)
        
        print("Database tables created successfully")
        
        schema_file = os.path.join(os.path.dirname(__file__), "..", "database", "schema.sql")
        if os.path.exists(schema_file):
            print("Running additional schema migrations...")
            
            with open(schema_file, 'r') as f:
                schema_sql = f.read()
            
            statements = [stmt.strip() for stmt in schema_sql.split(';') if stmt.strip()]
            
            with engine.connect() as conn:
                for statement in statements:
                    if statement and not statement.startswith('--'):
                        try:
                            conn.execute(text(statement))
                            conn.commit()
                        except Exception as e:
                            print(f"Warning: Could not execute statement: {statement[:50]}... Error: {e}")
            
            print("Schema migrations completed")
        
        return True
        
    except Exception as e:
        print(f"Error running migrations: {e}")
        return False

def seed_test_data():
    """Seed database with test data"""
    try:
        from app.database import SessionLocal
        from app.auth import get_password_hash
        
        db = SessionLocal()
        
        existing_user = db.query(Player).filter(Player.username == "testuser").first()
        if existing_user:
            print("Test data already exists")
            db.close()
            return True
        
        print("Seeding test data...")
        
        test_user = Player(
            username="testuser",
            email="test@example.com",
            password_hash=get_password_hash("testpass123")
        )
        
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        
        print(f"Created test user: {test_user.username} (ID: {test_user.id})")
        
        test_tournament = Tournament(
            name="Test Tournament",
            max_players=8,
            entry_fee=10,
            prize_pool=80
        )
        
        db.add(test_tournament)
        db.commit()
        db.refresh(test_tournament)
        
        print(f"Created test tournament: {test_tournament.name} (ID: {test_tournament.id})")
        
        db.close()
        print("Test data seeded successfully")
        return True
        
    except Exception as e:
        print(f"Error seeding test data: {e}")
        return False

def main():
    """Main setup function"""
    print("Auto Gladiators Database Setup")
    print("=" * 40)
    
    from dotenv import load_dotenv
    load_dotenv()
    
    if not create_database_if_not_exists():
        print("Failed to create database")
        sys.exit(1)
    
    if not run_schema_migrations():
        print("Failed to run migrations")
        sys.exit(1)
    
    if not seed_test_data():
        print("Failed to seed test data")
        sys.exit(1)
    
    print("\n" + "=" * 40)
    print("Database setup completed successfully!")
    print("\nYou can now start the API server with:")
    print("cd backend && python -m app.main")

if __name__ == "__main__":
    main()
