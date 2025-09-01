from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import json

from app.database import get_db
from app.models import Player, PlayerStats
from app.schemas import (
    ShopItemResponse, 
    PurchaseRequest, 
    PurchaseResponse,
    PlayerInventoryResponse,
    AbilityUpgradeRequest,
    AbilityUpgradeResponse
)
from app.auth import get_current_active_user
from app.shop_items import get_all_shop_items, get_shop_item_by_id
from app.economy import EconomyManager

router = APIRouter()
economy_manager = EconomyManager()

@router.get("/items", response_model=List[ShopItemResponse])
async def get_shop_items(
    category: str = None,
    rarity: str = None,
    db: Session = Depends(get_db),
    current_user: Player = Depends(get_current_active_user)
):
    """Get all available shop items with player-specific availability"""
    player_stats = db.query(PlayerStats).filter(PlayerStats.player_id == current_user.id).first()
    if not player_stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player stats not found"
        )
    
    all_items = get_all_shop_items()
    
    if category:
        all_items = [item for item in all_items if item["category"] == category]
    if rarity:
        all_items = [item for item in all_items if item["rarity"] == rarity]
    
    shop_items = []
    player_items = player_stats.items or []
    
    for item in all_items:
        owned_quantity = sum(1 for owned_item in player_items if owned_item.get("id") == item["id"])
        
        available = (
            player_stats.gold >= item["price"] and
            economy_manager.check_item_requirements(item, player_stats) and
            (item.get("max_quantity") is None or owned_quantity < item.get("max_quantity", 999))
        )
        
        shop_item = ShopItemResponse(
            **item,
            available=available,
            owned_quantity=owned_quantity
        )
        shop_items.append(shop_item)
    
    return shop_items

@router.post("/purchase", response_model=PurchaseResponse)
async def purchase_item(
    purchase: PurchaseRequest,
    db: Session = Depends(get_db),
    current_user: Player = Depends(get_current_active_user)
):
    """Purchase an item from the shop"""
    player_stats = db.query(PlayerStats).filter(PlayerStats.player_id == current_user.id).first()
    if not player_stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player stats not found"
        )
    
    item = get_shop_item_by_id(purchase.item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    
    total_cost = item["price"] * purchase.quantity
    
    if player_stats.gold < total_cost:
        return PurchaseResponse(
            success=False,
            message=f"Insufficient gold. Need {total_cost}, have {player_stats.gold}",
            new_gold_balance=player_stats.gold,
            item_purchased=item,
            quantity_purchased=0
        )
    
    if not economy_manager.check_item_requirements(item, player_stats):
        return PurchaseResponse(
            success=False,
            message="Requirements not met for this item",
            new_gold_balance=player_stats.gold,
            item_purchased=item,
            quantity_purchased=0
        )
    
    player_items = player_stats.items or []
    owned_quantity = sum(1 for owned_item in player_items if owned_item.get("id") == item["id"])
    max_quantity = item.get("max_quantity")
    
    if max_quantity and owned_quantity + purchase.quantity > max_quantity:
        return PurchaseResponse(
            success=False,
            message=f"Cannot purchase {purchase.quantity}. Max quantity: {max_quantity}, owned: {owned_quantity}",
            new_gold_balance=player_stats.gold,
            item_purchased=item,
            quantity_purchased=0
        )
    
    player_stats.gold -= total_cost
    
    for _ in range(purchase.quantity):
        purchased_item = {
            "id": item["id"],
            "name": item["name"],
            "category": item["category"],
            "effects": item["effects"],
            "purchased_at": "2025-09-01T11:08:00Z"  # Current timestamp
        }
        player_items.append(purchased_item)
    
    player_stats.items = player_items
    db.commit()
    
    return PurchaseResponse(
        success=True,
        message=f"Successfully purchased {purchase.quantity}x {item['name']}",
        new_gold_balance=player_stats.gold,
        item_purchased=item,
        quantity_purchased=purchase.quantity
    )

@router.get("/inventory", response_model=PlayerInventoryResponse)
async def get_player_inventory(
    db: Session = Depends(get_db),
    current_user: Player = Depends(get_current_active_user)
):
    """Get player's inventory and abilities"""
    player_stats = db.query(PlayerStats).filter(PlayerStats.player_id == current_user.id).first()
    if not player_stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player stats not found"
        )
    
    total_value = 0
    for item in (player_stats.items or []):
        shop_item = get_shop_item_by_id(item.get("id"))
        if shop_item:
            total_value += shop_item["price"]
    
    return PlayerInventoryResponse(
        items=player_stats.items or [],
        abilities=player_stats.abilities or [],
        total_value=total_value
    )

@router.post("/upgrade-ability", response_model=AbilityUpgradeResponse)
async def upgrade_ability(
    upgrade_request: AbilityUpgradeRequest,
    db: Session = Depends(get_db),
    current_user: Player = Depends(get_current_active_user)
):
    """Upgrade a player's ability"""
    player_stats = db.query(PlayerStats).filter(PlayerStats.player_id == current_user.id).first()
    if not player_stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player stats not found"
        )
    
    result = economy_manager.upgrade_ability(
        player_stats, 
        upgrade_request.ability_id, 
        upgrade_request.upgrade_type
    )
    
    if result["success"]:
        db.commit()
    
    return AbilityUpgradeResponse(
        success=result["success"],
        message=result["message"],
        new_gold_balance=player_stats.gold,
        upgraded_ability=result.get("upgraded_ability", {})
    )

@router.get("/categories")
async def get_shop_categories():
    """Get all available shop categories"""
    return {
        "categories": [
            {"id": "ability_upgrade", "name": "Ability Upgrades", "description": "Enhance your hero's abilities"},
            {"id": "stat_boost", "name": "Stat Boosts", "description": "Permanent stat improvements"},
            {"id": "consumable", "name": "Consumables", "description": "Single-use items for tournaments"}
        ]
    }

@router.get("/rarities")
async def get_shop_rarities():
    """Get all available item rarities"""
    return {
        "rarities": [
            {"id": "common", "name": "Common", "color": "#ffffff"},
            {"id": "rare", "name": "Rare", "color": "#0099ff"},
            {"id": "epic", "name": "Epic", "color": "#9933ff"},
            {"id": "legendary", "name": "Legendary", "color": "#ff9900"}
        ]
    }
