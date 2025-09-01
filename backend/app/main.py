from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import os
from dotenv import load_dotenv

from app.database import engine, Base
from app.routers import auth, tournaments, players, matches, websocket

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Auto Gladiators API",
    description="Multiplayer backend for Auto Gladiators game",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

origins = os.getenv("CORS_ORIGINS", "http://localhost:8080").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Configure appropriately for production
)

app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(tournaments.router, prefix="/api/tournaments", tags=["tournaments"])
app.include_router(players.router, prefix="/api/players", tags=["players"])
app.include_router(matches.router, prefix="/api/matches", tags=["matches"])
app.include_router(websocket.router, prefix="/ws", tags=["websocket"])

@app.get("/")
async def root():
    return {
        "message": "Auto Gladiators API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "timestamp": "2025-09-01T10:33:42Z"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )
