# Microbe Survivors

A static browser prototype for a microbiology-themed survivor game. You play as a macrophage in a petri dish, collect research motes, level up, and evolve lab-themed weapons against bacteria, virions, and fungal spores.

## Play

Open `index.html` in a browser, or serve the folder with a static server:

```bash
python3 -m http.server 5174
```

Then visit `http://localhost:5174`.

## Controls

- Move with `WASD` or arrow keys.
- On mobile, drag anywhere on the playfield to move.
- Press `Space` to pause.

## Current Features

- Full-screen responsive canvas playfield.
- Procedural enemy waves that ramp over time.
- Auto weapons: Antibody Orbit, Antibiotic Pulse, Phage Darts, and Lysosome Burst.
- XP pickups, leveling, randomized evolution choices, health, score, pause, and restart.
- Learning-skewed upgrades: each evolution card pulls from a question bank, tracks seen questions during the run, and avoids repeats until a topic is exhausted.
- General microbiology upgrades now include Gram Stain Prep, Biofilm Breaker, Sterile Technique, and Quorum Interference.
