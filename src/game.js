const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");

const ui = {
  time: document.querySelector("#time"),
  level: document.querySelector("#level"),
  score: document.querySelector("#score"),
  insights: document.querySelector("#insights"),
  healthText: document.querySelector("#healthText"),
  healthBar: document.querySelector("#healthBar"),
  xpText: document.querySelector("#xpText"),
  xpBar: document.querySelector("#xpBar"),
  loadout: document.querySelector("#loadout"),
  lessonToast: document.querySelector("#lessonToast"),
  mobilePause: document.querySelector("#mobilePause"),
  touchPad: document.querySelector("#touchPad"),
  touchKnob: document.querySelector("#touchKnob"),
  startOverlay: document.querySelector("#startOverlay"),
  startButton: document.querySelector("#startButton"),
  upgradeOverlay: document.querySelector("#upgradeOverlay"),
  upgradeChoices: document.querySelector("#upgradeChoices"),
  gameOverOverlay: document.querySelector("#gameOverOverlay"),
  gameOverTitle: document.querySelector("#gameOverTitle"),
  gameOverCopy: document.querySelector("#gameOverCopy"),
  restartButton: document.querySelector("#restartButton"),
};

const TAU = Math.PI * 2;
const keys = new Set();
const pointer = {
  x: 0,
  y: 0,
  startX: 0,
  startY: 0,
  dx: 0,
  dy: 0,
  id: null,
  active: false,
};

const weaponCatalog = {
  antibody: {
    name: "Antibody Orbit",
    icon: "A",
    color: "#8be08f",
    description: "Rotating antibodies shear nearby microbes.",
  },
  antibiotic: {
    name: "Antibiotic Pulse",
    icon: "+",
    color: "#78c7ff",
    description: "Timed radial doses weaken crowded colonies.",
  },
  phage: {
    name: "Phage Darts",
    icon: ">",
    color: "#ffd56f",
    description: "Bacteriophages seek the closest pathogen.",
  },
  lysosome: {
    name: "Lysosome Burst",
    icon: "*",
    color: "#ff7477",
    description: "Short-range enzymes punish anything too close.",
  },
};

const upgradeVisuals = {
  ...weaponCatalog,
  membrane: {
    name: "Membrane Repair",
    icon: "M",
    color: "#ff7477",
  },
  cilia: {
    name: "Cilia Motility",
    icon: "~",
    color: "#72dfc4",
  },
  magnet: {
    name: "Nutrient Gradient",
    icon: "N",
    color: "#d19bff",
  },
  culture: {
    name: "Culture Yield",
    icon: "Y",
    color: "#ffd56f",
  },
  gram: {
    name: "Gram Stain Prep",
    icon: "G",
    color: "#f6a6ff",
  },
  biofilm: {
    name: "Biofilm Breaker",
    icon: "B",
    color: "#9ddc7d",
  },
  sterile: {
    name: "Sterile Technique",
    icon: "S",
    color: "#b9e6ff",
  },
  quorum: {
    name: "Quorum Interference",
    icon: "Q",
    color: "#ffa987",
  },
};

const upgradeCatalog = [
  {
    id: "antibody",
    title: "Antibody Orbit",
    concept: "Antibodies",
    lessons: [
      {
        fact: "Antibodies bind specific antigens on a microbe, marking it for neutralization or cleanup by immune cells.",
        question: "What makes an antibody useful against a pathogen?",
        options: ["Specific antigen binding", "Random membrane tearing", "Making ATP"],
        correct: "Specific antigen binding",
      },
      {
        fact: "Antigens are molecular features the immune system can recognize, often on a pathogen surface.",
        question: "An antibody usually recognizes a specific what?",
        options: ["Antigen", "Ribosome", "Petri dish"],
        correct: "Antigen",
      },
      {
        fact: "Opsonization makes microbes easier for phagocytes to engulf by coating them with recognizable tags.",
        question: "Opsonization helps immune cells do what?",
        options: ["Engulf marked microbes", "Copy viral genomes", "Build peptidoglycan"],
        correct: "Engulf marked microbes",
      },
    ],
    description: "+1 antibody bead and faster orbit damage. Correct answer: extra orbit speed.",
    apply: (run, mastered) => {
      run.weapons.antibody.level += 1;
      if (mastered) {
        run.weapons.antibody.orbitBonus += 0.28;
      }
    },
  },
  {
    id: "antibiotic",
    title: "Antibiotic Pulse",
    concept: "Antibiotics",
    lessons: [
      {
        fact: "Many antibiotics exploit bacterial targets such as cell-wall synthesis or bacterial ribosomes, which human cells do not have in the same form.",
        question: "Which target is a classic antibiotic weak point?",
        options: ["Peptidoglycan cell wall", "Human nucleus", "Viral capsid only"],
        correct: "Peptidoglycan cell wall",
      },
      {
        fact: "Antibiotics act on bacteria, not viruses; viral infections require different prevention or treatment strategies.",
        question: "Antibiotics are mainly used against what?",
        options: ["Bacteria", "Viruses", "Prions"],
        correct: "Bacteria",
      },
      {
        fact: "Antibiotic resistance can spread when resistant cells survive and pass genes vertically or horizontally.",
        question: "What can selection pressure favor during antibiotic exposure?",
        options: ["Resistant bacteria", "Sterile agar", "Human mitochondria"],
        correct: "Resistant bacteria",
      },
    ],
    description: "Larger antibiotic waves with a shorter cooldown. Correct answer: instant pulse charge.",
    apply: (run, mastered) => {
      run.weapons.antibiotic.level += 1;
      if (mastered) {
        run.weapons.antibiotic.timer = 0;
      }
    },
  },
  {
    id: "phage",
    title: "Phage Darts",
    concept: "Bacteriophages",
    lessons: [
      {
        fact: "Bacteriophages are viruses that infect bacteria; they are usually host-specific rather than general-purpose cell attackers.",
        question: "A bacteriophage primarily infects what?",
        options: ["Bacteria", "Red blood cells", "Fungal hyphae"],
        correct: "Bacteria",
      },
      {
        fact: "In a lytic cycle, a phage uses the bacterial cell to make more phage particles and then lyses the host.",
        question: "What happens at the end of a lytic phage cycle?",
        options: ["The bacterium lyses", "The fungus sporulates", "The antibody divides"],
        correct: "The bacterium lyses",
      },
      {
        fact: "Phage host range depends on matching receptors on the bacterial surface.",
        question: "Phage specificity often depends on bacterial surface what?",
        options: ["Receptors", "Nuclei", "Cilia"],
        correct: "Receptors",
      },
    ],
    description: "More frequent homing phages with better impact. Correct answer: bonus dart damage.",
    apply: (run, mastered) => {
      run.weapons.phage.level += 1;
      if (mastered) {
        run.weapons.phage.timer = 0;
        run.player.phageBonus += 4;
      }
    },
  },
  {
    id: "lysosome",
    title: "Lysosome Burst",
    concept: "Lysosomes",
    lessons: [
      {
        fact: "Lysosomes contain digestive enzymes that help break down material after a cell engulfs it.",
        question: "What is the lysosome's main job here?",
        options: ["Digest engulfed material", "Store inherited DNA", "Build flagella"],
        correct: "Digest engulfed material",
      },
      {
        fact: "Phagocytosis is engulfment of particles or cells, followed by digestion after fusion with lysosome-like compartments.",
        question: "A macrophage uses phagocytosis to do what?",
        options: ["Engulf particles", "Make spores", "Perform Gram staining"],
        correct: "Engulf particles",
      },
      {
        fact: "Many digestive enzymes work best in acidic compartments, which helps separate digestion from the cytoplasm.",
        question: "Lysosomal enzymes often work best in what kind of compartment?",
        options: ["Acidic", "Frozen", "Gas-filled"],
        correct: "Acidic",
      },
    ],
    description: "Wider digestion zone around the macrophage. Correct answer: brief healing pulse.",
    apply: (run, mastered) => {
      run.weapons.lysosome.level += 1;
      if (mastered) {
        run.player.health = Math.min(run.player.maxHealth, run.player.health + 12);
      }
    },
  },
  {
    id: "membrane",
    title: "Membrane Repair",
    concept: "Cell membranes",
    lessons: [
      {
        fact: "The plasma membrane is a selective barrier, built largely from a phospholipid bilayer with embedded proteins.",
        question: "What best describes the plasma membrane?",
        options: ["Selective phospholipid barrier", "Rigid peptidoglycan shell", "Loose DNA cloud"],
        correct: "Selective phospholipid barrier",
      },
      {
        fact: "Membrane proteins can act as transporters, receptors, anchors, or enzymes.",
        question: "A membrane transporter mainly helps move what?",
        options: ["Substances across membranes", "DNA into agar", "Spores into viruses"],
        correct: "Substances across membranes",
      },
      {
        fact: "Osmosis is water movement across a semipermeable membrane toward higher solute concentration.",
        question: "Osmosis is movement of what?",
        options: ["Water", "Ribosomes", "Antibiotics only"],
        correct: "Water",
      },
    ],
    description: "Restore membrane integrity and raise max health. Correct answer: larger repair.",
    apply: (run, mastered) => {
      run.player.maxHealth += mastered ? 22 : 14;
      run.player.health = Math.min(run.player.maxHealth, run.player.health + (mastered ? 42 : 30));
    },
  },
  {
    id: "cilia",
    title: "Cilia Motility",
    concept: "Motility",
    lessons: [
      {
        fact: "Cilia and flagella help many cells or microbes move through liquid environments, though their structures differ by organism.",
        question: "What do cilia and flagella often support?",
        options: ["Movement through fluid", "Protein translation", "Antibody binding"],
        correct: "Movement through fluid",
      },
      {
        fact: "Many bacterial flagella rotate like propellers, while eukaryotic cilia bend using microtubules.",
        question: "Many bacterial flagella move by doing what?",
        options: ["Rotating", "Photosynthesizing", "Staining purple"],
        correct: "Rotating",
      },
      {
        fact: "Taxis describes directed movement toward or away from a stimulus.",
        question: "Directed movement in response to a stimulus is called what?",
        options: ["Taxis", "Lysis", "Conjugation"],
        correct: "Taxis",
      },
    ],
    description: "Move faster and slip through dense cultures. Correct answer: stronger speed gain.",
    apply: (run, mastered) => {
      run.player.speed += mastered ? 34 : 22;
    },
  },
  {
    id: "magnet",
    title: "Nutrient Gradient",
    concept: "Chemotaxis",
    lessons: [
      {
        fact: "Chemotaxis is movement guided by a chemical gradient; microbes may swim toward nutrients or away from harmful compounds.",
        question: "Following a nutrient gradient is called what?",
        options: ["Chemotaxis", "Binary fission", "Gram staining"],
        correct: "Chemotaxis",
      },
      {
        fact: "Positive chemotaxis means movement toward an attractant, such as a nutrient source.",
        question: "Moving toward a nutrient attractant is what kind of chemotaxis?",
        options: ["Positive", "Negative", "Stationary"],
        correct: "Positive",
      },
      {
        fact: "Chemical gradients can be sensed by receptor systems that compare signals across time or space.",
        question: "A chemotaxis system detects changes in what?",
        options: ["Chemical concentration", "Moon phase", "Agar color only"],
        correct: "Chemical concentration",
      },
    ],
    description: "Pull distant research motes toward the cell. Correct answer: wider collection field.",
    apply: (run, mastered) => {
      run.player.pickup += mastered ? 48 : 30;
    },
  },
  {
    id: "culture",
    title: "Culture Yield",
    concept: "Growth phases",
    lessons: [
      {
        fact: "A microbial culture changes over time: lag, exponential, stationary, and death phases reflect resource and waste pressure.",
        question: "When do microbes divide fastest in a fresh culture?",
        options: ["Exponential phase", "Death phase", "After sterilization"],
        correct: "Exponential phase",
      },
      {
        fact: "In stationary phase, nutrient limits and waste buildup make growth rate roughly balance death rate.",
        question: "What often limits growth in stationary phase?",
        options: ["Nutrients and waste", "Too many antibodies", "No cell membranes"],
        correct: "Nutrients and waste",
      },
      {
        fact: "Lag phase is an adjustment period before rapid division begins.",
        question: "What happens during lag phase?",
        options: ["Cells adapt before rapid growth", "All cells instantly die", "Viruses become bacteria"],
        correct: "Cells adapt before rapid growth",
      },
    ],
    description: "Harvest more research from each microbe. Correct answer: bigger yield gain.",
    apply: (run, mastered) => {
      run.player.xpBonus += mastered ? 0.3 : 0.18;
    },
  },
  {
    id: "gram",
    title: "Gram Stain Prep",
    concept: "Cell-wall structure",
    lessons: [
      {
        fact: "Gram-positive bacteria have a thick peptidoglycan layer that retains crystal violet stain.",
        question: "Gram-positive bacteria usually stain what color?",
        options: ["Purple", "Green", "Clear"],
        correct: "Purple",
      },
      {
        fact: "Gram-negative bacteria have a thinner peptidoglycan layer plus an outer membrane.",
        question: "Gram-negative bacteria are known for having what extra layer?",
        options: ["Outer membrane", "Nuclear envelope", "Fungal chitin wall"],
        correct: "Outer membrane",
      },
      {
        fact: "Gram staining is a differential stain, meaning it helps distinguish groups rather than staining all cells the same way.",
        question: "Gram stain is best described as what type of stain?",
        options: ["Differential", "Photosynthetic", "Sterilizing"],
        correct: "Differential",
      },
    ],
    description: "Improve targeting knowledge. Correct answer: larger global damage boost.",
    apply: (run, mastered) => {
      run.player.damageBonus += mastered ? 0.16 : 0.09;
    },
  },
  {
    id: "biofilm",
    title: "Biofilm Breaker",
    concept: "Biofilms",
    lessons: [
      {
        fact: "Biofilms are communities of microbes embedded in a protective extracellular matrix.",
        question: "A biofilm is protected by what?",
        options: ["Extracellular matrix", "A human nucleus", "Viral envelope only"],
        correct: "Extracellular matrix",
      },
      {
        fact: "Biofilms can make microbes harder to remove because cells adhere to surfaces and shield one another.",
        question: "Why can biofilms be difficult to clear?",
        options: ["Surface attachment and shielding", "They lack cells", "They are always sterile"],
        correct: "Surface attachment and shielding",
      },
      {
        fact: "Dental plaque is a familiar example of a biofilm.",
        question: "Dental plaque is an example of what?",
        options: ["Biofilm", "Capsid", "Pure agar"],
        correct: "Biofilm",
      },
    ],
    description: "Disrupt sticky colonies and slow enemies. Correct answer: stronger slow.",
    apply: (run, mastered) => {
      run.player.enemySlow = Math.min(0.35, run.player.enemySlow + (mastered ? 0.08 : 0.045));
    },
  },
  {
    id: "sterile",
    title: "Sterile Technique",
    concept: "Aseptic practice",
    lessons: [
      {
        fact: "Aseptic technique reduces unwanted contamination during lab work.",
        question: "Aseptic technique is mainly used to reduce what?",
        options: ["Contamination", "Cell division", "Stain color"],
        correct: "Contamination",
      },
      {
        fact: "Sterilization aims to eliminate all viable microbes, while disinfection reduces many microbes on surfaces.",
        question: "Which process aims to eliminate all viable microbes?",
        options: ["Sterilization", "Chemotaxis", "Fermentation"],
        correct: "Sterilization",
      },
      {
        fact: "Autoclaves use pressurized steam to sterilize many lab materials.",
        question: "An autoclave commonly uses what to sterilize?",
        options: ["Pressurized steam", "Blue light only", "Table sugar"],
        correct: "Pressurized steam",
      },
    ],
    description: "Reduce contamination pressure. Correct answer: stronger spawn reduction.",
    apply: (run, mastered) => {
      run.spawnControl = Math.min(0.34, run.spawnControl + (mastered ? 0.12 : 0.07));
    },
  },
  {
    id: "quorum",
    title: "Quorum Interference",
    concept: "Quorum sensing",
    lessons: [
      {
        fact: "Quorum sensing lets microbes coordinate behavior by sensing signaling molecules that build up with population density.",
        question: "Quorum sensing depends on what kind of molecules?",
        options: ["Chemical signals", "Antibodies", "Water only"],
        correct: "Chemical signals",
      },
      {
        fact: "Some bacteria use quorum sensing to coordinate virulence, light production, or biofilm formation.",
        question: "Quorum sensing can coordinate which behavior?",
        options: ["Biofilm formation", "Human breathing", "Mitosis in viruses"],
        correct: "Biofilm formation",
      },
      {
        fact: "Quorum means a threshold number; in microbiology it points to density-dependent group behavior.",
        question: "In quorum sensing, what does the cell population need to reach?",
        options: ["A threshold density", "Absolute zero", "A nucleus"],
        correct: "A threshold density",
      },
    ],
    description: "Jam group signaling and weaken contact damage. Correct answer: stronger resistance.",
    apply: (run, mastered) => {
      run.player.contactResist = Math.min(0.32, run.player.contactResist + (mastered ? 0.09 : 0.05));
    },
  },
];

let run = createRun();
let lastTime = performance.now();
let rafId = 0;
let lessonToastTimer = 0;

function createRun() {
  return {
    state: "menu",
    elapsed: 0,
    score: 0,
    insights: 0,
    nextSpawn: 1.25,
    spawnDebt: 0,
    spawnControl: 0,
    cameraShake: 0,
    levelChoices: [],
    usedQuestions: new Set(),
    passives: {},
    player: {
      x: 0,
      y: 0,
      radius: 23,
      speed: 210,
      health: 100,
      maxHealth: 100,
      level: 1,
      xp: 0,
      xpNeeded: 8,
      pickup: 92,
      xpBonus: 1,
      phageBonus: 0,
      damageBonus: 0,
      enemySlow: 0,
      contactResist: 0,
      invuln: 0,
    },
    weapons: {
      antibody: { level: 1, timer: 0, angle: 0, orbitBonus: 0 },
      antibiotic: { level: 0, timer: 1.5, pulse: 0 },
      phage: { level: 0, timer: 0 },
      lysosome: { level: 0, timer: 0 },
    },
    enemies: [],
    pickups: [],
    projectiles: [],
    bursts: [],
    motes: Array.from({ length: 120 }, () => ({
      x: rand(-1800, 1800),
      y: rand(-1200, 1200),
      r: rand(0.8, 2.2),
      a: rand(0.14, 0.48),
    })),
  };
}

function startRun() {
  run = createRun();
  run.state = "playing";
  ui.startOverlay.classList.remove("show");
  ui.gameOverOverlay.classList.remove("show");
  ui.touchPad.classList.add("hint");
  syncLoadout();
}

function resize() {
  const ratio = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  pointer.x = window.innerWidth / 2;
  pointer.y = window.innerHeight / 2;
  pointer.startX = pointer.x;
  pointer.startY = pointer.y;
}

function update(dt) {
  if (run.state !== "playing") {
    return;
  }

  run.elapsed += dt;
  run.cameraShake = Math.max(0, run.cameraShake - dt * 16);
  updatePlayer(dt);
  updateWeapons(dt);
  spawnEnemies(dt);
  updateEnemies(dt);
  updateProjectiles(dt);
  updatePickups(dt);
  updateBursts(dt);
  checkLevelUp();
}

function updatePlayer(dt) {
  const p = run.player;
  let dx = 0;
  let dy = 0;
  if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
  if (keys.has("arrowright") || keys.has("d")) dx += 1;
  if (keys.has("arrowup") || keys.has("w")) dy -= 1;
  if (keys.has("arrowdown") || keys.has("s")) dy += 1;

  if (pointer.active) {
    const px = pointer.dx;
    const py = pointer.dy;
    const distance = Math.hypot(px, py);
    if (distance > 18) {
      const strength = Math.min(1, distance / 78);
      dx += (px / distance) * strength;
      dy += (py / distance) * strength;
    }
  }

  const length = Math.hypot(dx, dy) || 1;
  p.x += (dx / length) * p.speed * dt;
  p.y += (dy / length) * p.speed * dt;
  p.invuln = Math.max(0, p.invuln - dt);
}

function updateWeapons(dt) {
  const p = run.player;
  const antibody = run.weapons.antibody;
  antibody.angle += dt * (1.8 + antibody.level * 0.18 + antibody.orbitBonus);
  const count = Math.max(1, antibody.level + 1);
  const orbitRadius = 54 + antibody.level * 7;
  for (const enemy of run.enemies) {
    for (let i = 0; i < count; i += 1) {
      const angle = antibody.angle + (i / count) * TAU;
      const ax = p.x + Math.cos(angle) * orbitRadius;
      const ay = p.y + Math.sin(angle) * orbitRadius;
      if (dist(ax, ay, enemy.x, enemy.y) < enemy.radius + 15) {
        damageEnemy(enemy, (28 + antibody.level * 7) * dt, "#8be08f");
      }
    }
  }

  const antibiotic = run.weapons.antibiotic;
  if (antibiotic.level > 0) {
    antibiotic.timer -= dt;
    antibiotic.pulse = Math.max(0, antibiotic.pulse - dt);
    if (antibiotic.timer <= 0) {
      const radius = 135 + antibiotic.level * 26;
      antibiotic.pulse = 0.45;
      antibiotic.timer = Math.max(1.15, 3.9 - antibiotic.level * 0.34);
      run.bursts.push({ x: p.x, y: p.y, radius, age: 0, life: 0.42, color: "#78c7ff" });
      for (const enemy of run.enemies) {
        if (dist(p.x, p.y, enemy.x, enemy.y) < radius + enemy.radius) {
          damageEnemy(enemy, 18 + antibiotic.level * 9, "#78c7ff");
        }
      }
    }
  }

  const phage = run.weapons.phage;
  if (phage.level > 0) {
    phage.timer -= dt;
    if (phage.timer <= 0) {
      const shots = Math.min(5, 1 + Math.floor(phage.level / 2));
      for (let i = 0; i < shots; i += 1) {
        const target = nearestEnemy(p.x, p.y, i * 90);
        const angle = target ? Math.atan2(target.y - p.y, target.x - p.x) : rand(0, TAU);
        run.projectiles.push({
          x: p.x,
          y: p.y,
          vx: Math.cos(angle) * 470,
          vy: Math.sin(angle) * 470,
          radius: 5,
          damage: 20 + phage.level * 6 + p.phageBonus,
          life: 1.25,
          color: "#ffd56f",
        });
      }
      phage.timer = Math.max(0.36, 1.35 - phage.level * 0.11);
    }
  }

  const lysosome = run.weapons.lysosome;
  if (lysosome.level > 0) {
    const radius = 48 + lysosome.level * 12;
    for (const enemy of run.enemies) {
      if (dist(p.x, p.y, enemy.x, enemy.y) < radius + enemy.radius) {
        damageEnemy(enemy, (15 + lysosome.level * 5) * dt, "#ff7477");
      }
    }
  }
}

function spawnEnemies(dt) {
  run.nextSpawn -= dt;
  const minutes = run.elapsed / 60;
  const intensity = 0.62 + minutes * 0.85;
  run.spawnDebt += dt * intensity * 0.52 * (1 - run.spawnControl);

  if (run.nextSpawn <= 0 || run.spawnDebt >= 1) {
    const count = Math.min(7, 1 + Math.floor(run.spawnDebt));
    run.spawnDebt = Math.max(0, run.spawnDebt - count);
    run.nextSpawn = Math.max(0.12, 0.92 - minutes * 0.07);
    for (let i = 0; i < count; i += 1) {
      run.enemies.push(makeEnemy());
    }
  }
}

function makeEnemy() {
  const p = run.player;
  const edge = Math.floor(rand(0, 4));
  const margin = 80;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const x = edge === 0 ? -margin : edge === 1 ? w + margin : rand(-margin, w + margin);
  const y = edge === 2 ? -margin : edge === 3 ? h + margin : rand(-margin, h + margin);
  const worldX = p.x + x - w / 2;
  const worldY = p.y + y - h / 2;
  const phase = run.elapsed;
  const roll = Math.random();

  if (phase > 55 && roll < 0.16) {
    return {
      kind: "fungus",
      x: worldX,
      y: worldY,
      radius: rand(15, 18),
      speed: rand(48, 66) + phase * 0.11,
      health: 88 + phase * 1.65,
      maxHealth: 88 + phase * 1.65,
      damage: 12,
      color: "#d19bff",
      wiggle: rand(0, TAU),
    };
  }

  if (phase > 22 && roll < 0.36) {
    return {
      kind: "virus",
      x: worldX,
      y: worldY,
      radius: rand(7, 9),
      speed: rand(112, 150) + phase * 0.28,
      health: 22 + phase * 0.68,
      maxHealth: 22 + phase * 0.68,
      damage: 6,
      color: "#ffd56f",
      wiggle: rand(0, TAU),
    };
  }

  return {
    kind: "bacterium",
    x: worldX,
    y: worldY,
    radius: rand(10, 14),
    speed: rand(68, 96) + phase * 0.2,
    health: 32 + phase * 0.9,
    maxHealth: 32 + phase * 0.9,
    damage: 7,
    color: "#72dfc4",
    wiggle: rand(0, TAU),
  };
}

function updateEnemies(dt) {
  const p = run.player;
  for (const enemy of run.enemies) {
    enemy.wiggle += dt * 3;
    const angle = Math.atan2(p.y - enemy.y, p.x - enemy.x);
    const sway = Math.sin(enemy.wiggle) * 0.45;
    const speed = enemy.speed * (1 - p.enemySlow);
    enemy.x += Math.cos(angle + sway) * speed * dt;
    enemy.y += Math.sin(angle + sway) * speed * dt;

    const hitDistance = p.radius + enemy.radius - 2;
    if (dist(p.x, p.y, enemy.x, enemy.y) < hitDistance && p.invuln <= 0) {
      p.health -= enemy.damage * (1 - p.contactResist);
      p.invuln = 0.86;
      const away = Math.atan2(enemy.y - p.y, enemy.x - p.x);
      enemy.x += Math.cos(away) * 42;
      enemy.y += Math.sin(away) * 42;
      run.cameraShake = 7;
      if (p.health <= 0) {
        endRun();
      }
    }
  }

  run.enemies = run.enemies.filter((enemy) => enemy.health > 0);
}

function updateProjectiles(dt) {
  for (const projectile of run.projectiles) {
    projectile.life -= dt;
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;

    for (const enemy of run.enemies) {
      if (enemy.health > 0 && dist(projectile.x, projectile.y, enemy.x, enemy.y) < projectile.radius + enemy.radius) {
        damageEnemy(enemy, projectile.damage, projectile.color);
        projectile.life = 0;
        break;
      }
    }
  }

  run.projectiles = run.projectiles.filter((projectile) => projectile.life > 0);
}

function updatePickups(dt) {
  const p = run.player;
  for (const pickup of run.pickups) {
    const distance = dist(p.x, p.y, pickup.x, pickup.y);
    if (distance < p.pickup) {
      const force = (1 - distance / p.pickup) * 420;
      pickup.x += ((p.x - pickup.x) / Math.max(1, distance)) * force * dt;
      pickup.y += ((p.y - pickup.y) / Math.max(1, distance)) * force * dt;
    }

    if (distance < p.radius + pickup.radius) {
      p.xp += pickup.value;
      run.score += Math.round(pickup.value * 10);
      pickup.collected = true;
    }
  }

  run.pickups = run.pickups.filter((pickup) => !pickup.collected);
}

function updateBursts(dt) {
  for (const burst of run.bursts) {
    burst.age += dt;
  }
  run.bursts = run.bursts.filter((burst) => burst.age < burst.life);
}

function damageEnemy(enemy, amount, color) {
  enemy.health -= amount * (1 + run.player.damageBonus);
  if (enemy.health <= 0 && !enemy.dead) {
    enemy.dead = true;
    const value = enemy.kind === "fungus" ? 5 : enemy.kind === "virus" ? 2 : 3;
    run.pickups.push({
      x: enemy.x,
      y: enemy.y,
      radius: 7,
      value: Math.max(1, Math.round(value * run.player.xpBonus)),
      color,
    });
    run.bursts.push({ x: enemy.x, y: enemy.y, radius: enemy.radius * 2.2, age: 0, life: 0.28, color });
  }
}

function checkLevelUp() {
  const p = run.player;
  if (p.xp < p.xpNeeded) {
    return;
  }

  p.xp -= p.xpNeeded;
  p.level += 1;
  p.xpNeeded = Math.ceil(p.xpNeeded * 1.34 + 4);
  run.state = "upgrade";
  run.levelChoices = chooseUpgrades();
  showUpgradeChoices();
}

function chooseUpgrades() {
  const weighted = upgradeCatalog
    .filter((upgrade) => {
      if (["antibiotic", "phage", "lysosome"].includes(upgrade.id)) {
        return run.player.level >= 2 || run.weapons[upgrade.id].level > 0;
      }
      return true;
    })
    .sort(() => Math.random() - 0.5);

  return weighted.slice(0, 3).map((upgrade) => ({
    ...upgrade,
    lesson: pickLesson(upgrade),
  }));
}

function pickLesson(upgrade) {
  const unseen = upgrade.lessons.filter((lesson) => !run.usedQuestions.has(lesson.question));
  const pool = unseen.length ? unseen : upgrade.lessons;
  const lesson = shuffle(pool)[0];
  run.usedQuestions.add(lesson.question);
  return lesson;
}

function showUpgradeChoices() {
  ui.upgradeChoices.innerHTML = "";
  for (const choice of run.levelChoices) {
    const meta = upgradeVisuals[choice.id];
    const card = document.createElement("article");
    card.className = "upgrade-card";
    card.innerHTML = `
      <i class="upgrade-icon" style="background: ${meta?.color ?? "#8be08f"}">${meta?.icon ?? "+"}</i>
      <div>
        <p class="concept">${choice.concept}</p>
        <strong>${choice.title}</strong>
      </div>
      <p class="fact">${choice.lesson.fact}</p>
      <p class="question">${choice.lesson.question}</p>
      <div class="answer-list"></div>
      <span class="upgrade-effect">${choice.description}</span>
    `;
    const answerList = card.querySelector(".answer-list");
    for (const option of shuffle(choice.lesson.options)) {
      const answer = document.createElement("button");
      answer.type = "button";
      answer.className = "answer-button";
      answer.textContent = option;
      answer.addEventListener("click", () => applyUpgrade(choice, option === choice.lesson.correct));
      answerList.append(answer);
    }
    ui.upgradeChoices.append(card);
  }
  ui.upgradeOverlay.classList.add("show");
}

function applyUpgrade(choice, mastered) {
  choice.apply(run, mastered);
  if (!run.weapons[choice.id]) {
    run.passives[choice.id] = (run.passives[choice.id] ?? 0) + 1;
  }
  if (mastered) {
    run.insights += 1;
    run.score += 25;
    showLesson(`Insight gained: ${choice.lesson.correct}. ${choice.concept} adaptation strengthened.`);
  } else {
    run.score += 8;
    showLesson(`Close call: the key idea was "${choice.lesson.correct}." Standard adaptation applied.`);
  }
  run.state = "playing";
  ui.upgradeOverlay.classList.remove("show");
  syncLoadout();
}

function showLesson(message) {
  window.clearTimeout(lessonToastTimer);
  ui.lessonToast.textContent = message;
  ui.lessonToast.classList.add("show");
  lessonToastTimer = window.setTimeout(() => {
    ui.lessonToast.classList.remove("show");
  }, 3400);
}

function endRun() {
  run.state = "gameover";
  ui.touchPad.classList.remove("active", "hint");
  const seconds = Math.floor(run.elapsed);
  ui.gameOverTitle.textContent = `Survived ${formatTime(seconds)}`;
  ui.gameOverCopy.textContent = `Final culture score: ${run.score}. Level ${run.player.level} macrophage with ${run.insights} microbiology insights and ${run.enemies.length} active pathogens in the dish.`;
  ui.gameOverOverlay.classList.add("show");
}

function nearestEnemy(x, y, skip) {
  return [...run.enemies]
    .sort((a, b) => dist(x, y, a.x, a.y) - dist(x, y, b.x, b.y))
    .at(skip) ?? null;
}

function render() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const p = run.player;
  const shakeX = run.cameraShake ? rand(-run.cameraShake, run.cameraShake) : 0;
  const shakeY = run.cameraShake ? rand(-run.cameraShake, run.cameraShake) : 0;

  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(w / 2 - p.x + shakeX, h / 2 - p.y + shakeY);
  drawDishBackground(w, h, p);
  drawPickups();
  drawBursts();
  drawProjectiles();
  drawEnemies();
  drawPlayer();
  drawWeaponPreview();
  ctx.restore();
  updateHud();
}

function drawDishBackground(w, h, p) {
  const left = p.x - w / 2 - 80;
  const right = p.x + w / 2 + 80;
  const top = p.y - h / 2 - 80;
  const bottom = p.y + h / 2 + 80;

  const gradient = ctx.createRadialGradient(p.x, p.y, 80, p.x, p.y, Math.max(w, h) * 0.7);
  gradient.addColorStop(0, "#121b1b");
  gradient.addColorStop(0.55, "#0c1114");
  gradient.addColorStop(1, "#080a0d");
  ctx.fillStyle = gradient;
  ctx.fillRect(left, top, right - left, bottom - top);

  ctx.strokeStyle = "rgba(180, 230, 205, 0.045)";
  ctx.lineWidth = 1;
  const grid = 96;
  for (let x = Math.floor(left / grid) * grid; x < right; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
  }
  for (let y = Math.floor(top / grid) * grid; y < bottom; y += grid) {
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
  }

  for (const mote of run.motes) {
    const mx = wrap(mote.x, p.x - 1900, p.x + 1900);
    const my = wrap(mote.y, p.y - 1300, p.y + 1300);
    ctx.fillStyle = `rgba(206, 244, 202, ${mote.a})`;
    ctx.beginPath();
    ctx.arc(mx, my, mote.r, 0, TAU);
    ctx.fill();
  }
}

function drawPlayer() {
  const p = run.player;
  const flash = p.invuln > 0 && Math.floor(p.invuln * 20) % 2 === 0;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.fillStyle = flash ? "#ffffff" : "#e6ffe1";
  ctx.strokeStyle = "#8be08f";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < 24; i += 1) {
    const angle = (i / 24) * TAU;
    const radius = p.radius + Math.sin(run.elapsed * 4 + i) * 2.6;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(62, 125, 74, 0.58)";
  ctx.beginPath();
  ctx.arc(-6, -4, 7, 0, TAU);
  ctx.arc(8, 7, 5, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawWeaponPreview() {
  const p = run.player;
  const antibody = run.weapons.antibody;
  const count = Math.max(1, antibody.level + 1);
  const orbitRadius = 54 + antibody.level * 7;
  for (let i = 0; i < count; i += 1) {
    const angle = antibody.angle + (i / count) * TAU;
    ctx.fillStyle = "#8be08f";
    ctx.beginPath();
    ctx.arc(p.x + Math.cos(angle) * orbitRadius, p.y + Math.sin(angle) * orbitRadius, 9, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  if (run.weapons.lysosome.level > 0) {
    ctx.strokeStyle = "rgba(255, 116, 119, 0.22)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 48 + run.weapons.lysosome.level * 12, 0, TAU);
    ctx.stroke();
  }
}

function drawEnemies() {
  for (const enemy of run.enemies) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.rotate(enemy.wiggle * 0.2);
    ctx.shadowBlur = enemy.kind === "virus" ? 12 : 8;
    ctx.shadowColor = enemy.color;
    ctx.fillStyle = enemy.color;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.58)";
    ctx.lineWidth = 2;

    if (enemy.kind === "virus") {
      drawVirus(enemy.radius);
    } else if (enemy.kind === "fungus") {
      drawFungus(enemy.radius);
    } else {
      drawBacterium(enemy.radius);
    }

    ctx.shadowBlur = 0;

    const width = enemy.radius * 2;
    const health = Math.max(0, enemy.health / enemy.maxHealth);
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(-enemy.radius, enemy.radius + 8, width, 3);
    ctx.fillStyle = "#e6ffe1";
    ctx.fillRect(-enemy.radius, enemy.radius + 8, width * health, 3);
    ctx.restore();
  }
}

function drawBacterium(radius) {
  ctx.beginPath();
  ctx.ellipse(0, 0, radius * 1.35, radius * 0.72, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
  for (let i = -1; i <= 1; i += 1) {
    ctx.beginPath();
    ctx.moveTo(-radius * 0.65, i * 5);
    ctx.quadraticCurveTo(0, i * 5 + 8, radius * 0.68, i * 5);
    ctx.stroke();
  }
}

function drawVirus(radius) {
  ctx.beginPath();
  for (let i = 0; i < 12; i += 1) {
    const angle = (i / 12) * TAU;
    ctx.moveTo(Math.cos(angle) * radius * 0.75, Math.sin(angle) * radius * 0.75);
    ctx.lineTo(Math.cos(angle) * radius * 1.22, Math.sin(angle) * radius * 1.22);
  }
  ctx.stroke();
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = (i / 10) * TAU;
    const r = i % 2 ? radius * 0.72 : radius;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawFungus(radius) {
  ctx.beginPath();
  ctx.arc(0, -radius * 0.2, radius, Math.PI, 0);
  ctx.quadraticCurveTo(radius * 0.72, radius * 0.8, 0, radius * 0.72);
  ctx.quadraticCurveTo(-radius * 0.72, radius * 0.8, -radius, -radius * 0.2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
  ctx.beginPath();
  ctx.moveTo(-radius * 0.55, radius * 0.45);
  ctx.quadraticCurveTo(0, radius * 0.75, radius * 0.55, radius * 0.45);
  ctx.stroke();
}

function drawProjectiles() {
  for (const projectile of run.projectiles) {
    ctx.fillStyle = projectile.color;
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, projectile.radius, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.72)";
    ctx.stroke();
  }
}

function drawPickups() {
  for (const pickup of run.pickups) {
    ctx.fillStyle = pickup.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = pickup.color;
    ctx.beginPath();
    ctx.arc(pickup.x, pickup.y, pickup.radius, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function drawBursts() {
  for (const burst of run.bursts) {
    const t = burst.age / burst.life;
    ctx.strokeStyle = hexToRgba(burst.color, 1 - t);
    ctx.lineWidth = 3 * (1 - t) + 1;
    ctx.beginPath();
    ctx.arc(burst.x, burst.y, burst.radius * (0.35 + t * 0.75), 0, TAU);
    ctx.stroke();
  }
}

function updateHud() {
  const p = run.player;
  ui.time.textContent = formatTime(Math.floor(run.elapsed));
  ui.level.textContent = p.level;
  ui.score.textContent = run.score;
  ui.insights.textContent = run.insights;
  ui.healthText.textContent = `${Math.max(0, Math.round((p.health / p.maxHealth) * 100))}%`;
  ui.healthBar.style.transform = `scaleX(${clamp(p.health / p.maxHealth, 0, 1)})`;
  ui.xpText.textContent = `${Math.floor(p.xp)} / ${p.xpNeeded}`;
  ui.xpBar.style.transform = `scaleX(${clamp(p.xp / p.xpNeeded, 0, 1)})`;
}

function syncLoadout() {
  ui.loadout.innerHTML = "";
  for (const [id, weapon] of Object.entries(run.weapons)) {
    if (weapon.level <= 0) continue;
    const meta = weaponCatalog[id];
    const item = document.createElement("div");
    item.className = "tool";
    item.innerHTML = `
      <i style="background: ${meta.color}">${meta.icon}</i>
      <span>${meta.name} ${weapon.level}</span>
    `;
    ui.loadout.append(item);
  }
  for (const [id, level] of Object.entries(run.passives)) {
    const meta = upgradeVisuals[id];
    if (!meta) continue;
    const item = document.createElement("div");
    item.className = "tool";
    item.innerHTML = `
      <i style="background: ${meta.color}">${meta.icon}</i>
      <span>${meta.name} ${level}</span>
    `;
    ui.loadout.append(item);
  }
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function loop(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  render();
  rafId = requestAnimationFrame(loop);
}

function pauseToggle() {
  if (run.state === "playing") {
    run.state = "paused";
    ui.touchPad.classList.remove("active", "hint");
    ui.startOverlay.querySelector(".kicker").textContent = "Assay paused";
    ui.startOverlay.querySelector("h2").textContent = "The culture is on ice.";
    ui.startOverlay.querySelector(".copy").textContent = "Resume when you are ready to keep the macrophage moving.";
    ui.startButton.textContent = "Resume Run";
    ui.startOverlay.classList.add("show");
    return;
  }

  if (run.state === "paused") {
    run.state = "playing";
    ui.startOverlay.classList.remove("show");
    ui.touchPad.classList.add("hint");
  }
}

function formatTime(seconds) {
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function dist(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function wrap(value, min, max) {
  const width = max - min;
  return ((((value - min) % width) + width) % width) + min;
}

function hexToRgba(hex, alpha) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

window.addEventListener("resize", resize);
window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  keys.add(key);
  if (key === " ") {
    event.preventDefault();
    pauseToggle();
  }
});
window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
canvas.addEventListener("pointermove", (event) => {
  if (!pointer.active || event.pointerId !== pointer.id) {
    return;
  }
  updatePointer(event);
});
canvas.addEventListener("pointerdown", (event) => {
  if (run.state !== "playing") {
    return;
  }
  pointer.active = true;
  pointer.id = event.pointerId;
  pointer.startX = event.clientX;
  pointer.startY = event.clientY;
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.dx = 0;
  pointer.dy = 0;
  ui.touchPad.classList.remove("hint");
  ui.touchPad.classList.add("active");
  ui.touchPad.style.left = `${event.clientX - 48}px`;
  ui.touchPad.style.top = `${event.clientY - 48}px`;
  ui.touchPad.style.bottom = "auto";
  updateTouchKnob();
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener("pointerup", endPointer);
canvas.addEventListener("pointercancel", endPointer);

function updatePointer(event) {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  const dx = event.clientX - pointer.startX;
  const dy = event.clientY - pointer.startY;
  const distance = Math.hypot(dx, dy);
  const maxDistance = 58;
  const scale = distance > maxDistance ? maxDistance / distance : 1;
  pointer.dx = dx * scale;
  pointer.dy = dy * scale;
  updateTouchKnob();
}

function updateTouchKnob() {
  ui.touchKnob.style.transform = `translate(calc(-50% + ${pointer.dx}px), calc(-50% + ${pointer.dy}px))`;
}

function endPointer(event) {
  if (event.pointerId !== pointer.id) {
    return;
  }
  pointer.active = false;
  pointer.id = null;
  pointer.dx = 0;
  pointer.dy = 0;
  updateTouchKnob();
  ui.touchPad.classList.remove("active");
  ui.touchPad.classList.add("hint");
  ui.touchPad.style.left = "";
  ui.touchPad.style.top = "";
  ui.touchPad.style.bottom = "";
}

ui.startButton.addEventListener("click", () => {
  if (run.state === "paused") {
    pauseToggle();
  } else {
    startRun();
  }
});
ui.restartButton.addEventListener("click", startRun);
ui.mobilePause.addEventListener("click", pauseToggle);

resize();
syncLoadout();
rafId = requestAnimationFrame(loop);
