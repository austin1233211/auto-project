# Legacy Code

This directory contains code that is no longer used in the active codebase but is preserved for reference.

## ability-system/

**Status:** Deprecated  
**Reason:** Replaced by the current effect system in `src/core/ability-effects/`

This was an experimental ability system that was developed but never integrated into the main game. The current effect system (`src/core/ability-effects/`) is the active implementation with 195+ effects.

**Key Differences:**
- Legacy system used a different architecture
- Current system uses BaseEffect class and EffectRegistry pattern
- Current system is fully integrated with combat and stats calculator

**References:**
- Active effect system: `src/core/ability-effects/`
- Effect system guide: `docs/EFFECT_SYSTEM_GUIDE.md`

**Note:** This code is NOT referenced anywhere in the active codebase (verified by grep search). It is kept for historical reference only.
