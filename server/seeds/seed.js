const fs = require('fs');
const path = require('path');
const pool = require('../src/config/database');

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    await seedHeroes();
    await seedAbilities();
    await seedArtifacts();
    await seedEquipment();
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function seedHeroes() {
  console.log('Seeding heroes...');
  
  const heroesPath = path.join(__dirname, '../../heroes.js');
  const heroesContent = fs.readFileSync(heroesPath, 'utf8');
  
  const heroesMatch = heroesContent.match(/const heroes = (\[[\s\S]*?\]);/);
  if (!heroesMatch) {
    throw new Error('Could not parse heroes data');
  }
  
  const heroesData = eval(heroesMatch[1]);
  
  for (const hero of heroesData) {
    const query = `
      INSERT INTO heroes (
        name, class, base_health, base_attack, base_armor, base_speed,
        passive_ability_name, passive_ability_description,
        ultimate_ability_name, ultimate_ability_description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
    
    await pool.query(query, [
      hero.name,
      hero.type || hero.class,
      hero.stats?.health ?? hero.health ?? 0,
      hero.stats?.attack ?? hero.attack ?? 0,
      hero.stats?.armor ?? hero.armor ?? 0,
      hero.stats?.speed ?? hero.speed ?? 0,
      hero.abilities?.passive?.name || 'Passive Ability',
      hero.abilities?.passive?.description || 'Hero passive ability',
      hero.abilities?.ultimate?.name || 'Ultimate Ability',
      hero.abilities?.ultimate?.description || 'Hero ultimate ability'
    ]);
  }
  
  console.log(`✓ Seeded ${heroesData.length} heroes`);
}

async function seedAbilities() {
  console.log('Seeding abilities...');
  
  const abilitiesPath = path.join(__dirname, '../../abilities-shop.js');
  const abilitiesContent = fs.readFileSync(abilitiesPath, 'utf8');
  
  const tier1Match = abilitiesContent.match(/tier1Abilities:\s*\[([\s\S]*?)\]/);
  const tier2Match = abilitiesContent.match(/tier2Abilities:\s*\[([\s\S]*?)\]/);
  const tier3Match = abilitiesContent.match(/tier3Abilities:\s*\[([\s\S]*?)\]/);
  
  const abilities = [
    { name: 'Attack Boost I', effect: 'attack_boost', value: 15, tier: 1, cost: 100, emoji: '⚔️', description: 'Increases attack by 15' },
    { name: 'Attack Boost II', effect: 'attack_boost', value: 25, tier: 2, cost: 200, emoji: '⚔️', description: 'Increases attack by 25' },
    { name: 'Attack Boost III', effect: 'attack_boost', value: 40, tier: 3, cost: 300, emoji: '⚔️', description: 'Increases attack by 40' },
    { name: 'Health Boost I', effect: 'health_boost', value: 100, tier: 1, cost: 100, emoji: '❤️', description: 'Increases health by 100' },
    { name: 'Health Boost II', effect: 'health_boost', value: 200, tier: 2, cost: 200, emoji: '❤️', description: 'Increases health by 200' },
    { name: 'Health Boost III', effect: 'health_boost', value: 350, tier: 3, cost: 300, emoji: '❤️', description: 'Increases health by 350' },
    { name: 'Armor Boost I', effect: 'armor_boost', value: 10, tier: 1, cost: 100, emoji: '🛡️', description: 'Increases armor by 10' },
    { name: 'Armor Boost II', effect: 'armor_boost', value: 20, tier: 2, cost: 200, emoji: '🛡️', description: 'Increases armor by 20' },
    { name: 'Armor Boost III', effect: 'armor_boost', value: 35, tier: 3, cost: 300, emoji: '🛡️', description: 'Increases armor by 35' },
    { name: 'Speed Boost I', effect: 'speed_boost', value: 15, tier: 1, cost: 100, emoji: '💨', description: 'Increases speed by 15' },
    { name: 'Speed Boost II', effect: 'speed_boost', value: 25, tier: 2, cost: 200, emoji: '💨', description: 'Increases speed by 25' },
    { name: 'Speed Boost III', effect: 'speed_boost', value: 40, tier: 3, cost: 300, emoji: '💨', description: 'Increases speed by 40' },
    { name: 'Double Attack', effect: 'attack_multiplier', value: 100, tier: 3, cost: 400, emoji: '⚡', description: 'Doubles attack power' },
    { name: 'Fortify', effect: 'health_multiplier', value: 50, tier: 2, cost: 250, emoji: '🏰', description: 'Increases health by 50%' },
    { name: 'Damage Immunity', effect: 'damage_immunity', value: 1, tier: 3, cost: 500, emoji: '🛡️', description: 'Immune to damage for 1 turn' },
    { name: 'Death Save', effect: 'death_save', value: 1, tier: 3, cost: 400, emoji: '💀', description: 'Survive with 1 HP when killed' },
    { name: 'Counter Chance', effect: 'counter_chance', value: 30, tier: 2, cost: 200, emoji: '🔄', description: '30% chance to counter attack' },
    { name: 'Gold Bonus', effect: 'gold_bonus', value: 50, tier: 1, cost: 150, emoji: '💰', description: 'Gain 50% more gold at round end' }
  ];
  
  for (const ability of abilities) {
    const query = `
      INSERT INTO abilities (name, effect, value, tier, cost, emoji, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    
    await pool.query(query, [
      ability.name,
      ability.effect,
      ability.value,
      ability.tier,
      ability.cost,
      ability.emoji,
      ability.description
    ]);
  }
  
  console.log(`✓ Seeded ${abilities.length} abilities`);
}

async function seedArtifacts() {
  console.log('Seeding artifacts...');
  
  const artifacts = [
    { name: 'Mana Crystal', effect: 'mana_efficiency', value: 25, round_available: 1, emoji: '💎', description: 'Reduces mana cost by 25%' },
    { name: 'Gold Ring', effect: 'gold_bonus', value: 30, round_available: 1, emoji: '💍', description: 'Increases gold gain by 30%' },
    { name: 'Iron Shield', effect: 'damage_reduction', value: 15, round_available: 2, emoji: '🛡️', description: 'Reduces incoming damage by 15%' },
    { name: 'Swift Boots', effect: 'speed_boost', value: 20, round_available: 2, emoji: '👢', description: 'Increases movement speed by 20%' },
    { name: 'Power Gem', effect: 'attack_boost', value: 30, round_available: 3, emoji: '💠', description: 'Increases attack power by 30%' },
    { name: 'Life Orb', effect: 'health_boost', value: 150, round_available: 3, emoji: '🔮', description: 'Increases maximum health by 150' },
    { name: 'Dragon Scale', effect: 'damage_reduction', value: 25, round_available: 4, emoji: '🐉', description: 'Reduces incoming damage by 25%' },
    { name: 'Crown of Kings', effect: 'gold_bonus', value: 50, round_available: 4, emoji: '👑', description: 'Increases gold gain by 50%' },
    { name: 'Arcane Focus', effect: 'mana_efficiency', value: 40, round_available: 5, emoji: '🔯', description: 'Reduces mana cost by 40%' },
    { name: 'Titan Heart', effect: 'health_boost', value: 300, round_available: 5, emoji: '❤️', description: 'Increases maximum health by 300' }
  ];
  
  for (const artifact of artifacts) {
    const query = `
      INSERT INTO artifacts (name, effect, value, round_available, emoji, description)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    
    await pool.query(query, [
      artifact.name,
      artifact.effect,
      artifact.value,
      artifact.round_available,
      artifact.emoji,
      artifact.description
    ]);
  }
  
  console.log(`✓ Seeded ${artifacts.length} artifacts`);
}

async function seedEquipment() {
  console.log('Seeding equipment...');
  
  const equipment = [
    { name: 'Iron Sword', stat: 'attack', value: 12, tier: 1, emoji: '⚔️', description: 'A sturdy iron sword' },
    { name: 'Steel Sword', stat: 'attack', value: 20, tier: 2, emoji: '⚔️', description: 'A sharp steel sword' },
    { name: 'Legendary Blade', stat: 'attack', value: 35, tier: 3, emoji: '⚔️', description: 'A legendary weapon' },
    { name: 'Leather Armor', stat: 'armor', value: 8, tier: 1, emoji: '🛡️', description: 'Basic leather protection' },
    { name: 'Chain Mail', stat: 'armor', value: 15, tier: 2, emoji: '🛡️', description: 'Sturdy chain mail armor' },
    { name: 'Plate Armor', stat: 'armor', value: 25, tier: 3, emoji: '🛡️', description: 'Heavy plate armor' },
    { name: 'Health Potion', stat: 'health', value: 80, tier: 1, emoji: '🧪', description: 'Restores health' },
    { name: 'Greater Health Potion', stat: 'health', value: 150, tier: 2, emoji: '🧪', description: 'Greatly restores health' },
    { name: 'Elixir of Life', stat: 'health', value: 250, tier: 3, emoji: '🧪', description: 'Powerful life elixir' },
    { name: 'Swift Boots', stat: 'speed', value: 10, tier: 1, emoji: '👢', description: 'Increases movement speed' },
    { name: 'Winged Boots', stat: 'speed', value: 18, tier: 2, emoji: '👢', description: 'Magical speed boots' },
    { name: 'Boots of Haste', stat: 'speed', value: 30, tier: 3, emoji: '👢', description: 'Legendary speed boots' }
  ];
  
  for (const item of equipment) {
    const query = `
      INSERT INTO equipment (name, stat, value, tier, emoji, description)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    
    await pool.query(query, [
      item.name,
      item.stat,
      item.value,
      item.tier,
      item.emoji,
      item.description
    ]);
  }
  
  console.log(`✓ Seeded ${equipment.length} equipment items`);
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
