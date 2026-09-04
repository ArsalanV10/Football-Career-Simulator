import { useState, useMemo, useEffect } from "react";
import {
  Check,
  ChevronUp, ChevronDown, Play, X, Trophy,
  Wand2, Zap, Target, Shuffle, ArrowUpRight, Sparkles, Crosshair,
  Send, Rocket, Repeat, Radar, Wind, Lightbulb,
  Gauge, RotateCw, Star, Shield, Hand, HandMetal,
  Eye, Magnet, ShieldCheck, Swords, ShieldAlert, ChevronsUp,
  Activity, Timer, Move, TrendingUp, TrendingDown,
  Footprints, UserCheck, CornerUpRight, Compass,
  ShoppingBag, Dumbbell, Megaphone, Home, HeartPulse, AtSign,
  Brain, Car, GraduationCap, Plane, Briefcase, Download, Upload,
} from "lucide-react";

// All 193 UN member states (alphabetical), minus Israel; plus Palestine and Vatican City.
const NATIONS = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czechia",
  "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Italy",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe",
];

// ── International tournaments ────────────────────────────────────────────────
const TOURNAMENT_BREAK_GWS = [8, 16, 24, 32];
const REGION_TOURNAMENT = {
  EURO: { comp: "UEFA Euro", trophy: "UEFA Euro" },
  COPA: { comp: "Copa América", trophy: "Copa América" },
  GOLD: { comp: "CONCACAF Gold Cup", trophy: "CONCACAF Gold Cup" },
  AFCON: { comp: "Africa Cup of Nations", trophy: "Africa Cup of Nations" },
  ASIAN: { comp: "AFC Asian Cup", trophy: "AFC Asian Cup" },
};
const NATION_TOURNAMENT = {
  // UEFA Euro
  "England": "EURO", "Spain": "EURO", "Germany": "EURO", "France": "EURO", "Italy": "EURO",
  "Portugal": "EURO", "Netherlands": "EURO", "Croatia": "EURO", "Belgium": "EURO", "Poland": "EURO",
  "Serbia": "EURO", "Denmark": "EURO", "Sweden": "EURO", "Norway": "EURO", "Switzerland": "EURO",
  "Austria": "EURO", "Turkey": "EURO", "Ukraine": "EURO", "Wales": "EURO", "Scotland": "EURO", "Ireland": "EURO",
  // Copa América
  "Brazil": "COPA", "Argentina": "COPA", "Uruguay": "COPA", "Colombia": "COPA", "Chile": "COPA", "Ecuador": "COPA", "Peru": "COPA",
  // CONCACAF Gold Cup
  "United States": "GOLD", "Mexico": "GOLD", "Canada": "GOLD",
  // Africa Cup of Nations
  "Morocco": "AFCON", "Senegal": "AFCON", "Nigeria": "AFCON", "Ghana": "AFCON", "Egypt": "AFCON", "Cote d'Ivoire": "AFCON",
  // AFC Asian Cup
  "Japan": "ASIAN", "South Korea": "ASIAN", "Australia": "ASIAN",
};
const NATION_STARS = {
  "Brazil": 5, "Argentina": 5, "France": 4.5, "Spain": 4.5, "England": 4.5, "Portugal": 4.5, "Germany": 4.5,
  "Netherlands": 4, "Italy": 4, "Belgium": 4, "Croatia": 3.5, "Poland": 3.5, "Serbia": 3.5, "Denmark": 3.5,
  "Sweden": 3.5, "Norway": 3.5, "Switzerland": 3.5, "Austria": 3.5, "Turkey": 3, "Ukraine": 3.5, "Wales": 3,
  "Scotland": 3, "Ireland": 3, "Uruguay": 4, "Colombia": 3.5, "Chile": 3, "Ecuador": 3, "Peru": 2.5,
  "United States": 3.5, "Mexico": 3.5, "Canada": 3, "Morocco": 3.5, "Senegal": 3.5, "Nigeria": 3.5, "Ghana": 3,
  "Egypt": 3, "Cote d'Ivoire": 3.5, "Japan": 4, "South Korea": 3.5, "Australia": 3.5,
};
const INTl_COMPETITIONS = ["FIFA World Cup", "UEFA Euro", "Copa América", "CONCACAF Gold Cup", "Africa Cup of Nations", "AFC Asian Cup"];
function isTournamentYear(y) {
  return y % 4 === 0 || y % 4 === 2; // WC: 2026+4k · Continental: 2028+4k
}
function tournamentFor(year, nat) {
  const region = NATION_TOURNAMENT[nat];
  if (!region) return null;
  if (year % 4 === 2) return { comp: "FIFA World Cup", trophy: "FIFA World Cup", wc: true, region: null };
  const t = REGION_TOURNAMENT[region];
  return { comp: t.comp, trophy: t.trophy, wc: false, region };
}
function pickNationOpponent(t, ownNation) {
  const all = Object.keys(NATION_TOURNAMENT);
  const pool = t.wc ? all : all.filter((n) => REGION_TOURNAMENT[NATION_TOURNAMENT[n]].comp === t.comp);
  const opps = pool.filter((n) => n !== ownNation);
  const src = opps.length ? opps : pool;
  return src.length ? src[Math.floor(Math.random() * src.length)] : "Brazil";
}

// ── Press conferences ────────────────────────────────────────────────────────
const PRESS_OPTIONS = [
  { key: "pro", label: "Professional answer", summary: "trust +10% · fans −5%", trust: 10, fan: -5, mv: 1,
    ack: "Calm and respectful. The manager appreciates it — manager trust +10%, fan approval −5%." },
  { key: "fan", label: "Fan-favourite answer", summary: "trust −10% · fans +15%", trust: -10, fan: 15, mv: 1,
    ack: "The fans adore you — the manager, less so. Manager trust −10%, fan approval +15%." },
  { key: "cocky", label: "Arrogant / selfish answer", summary: "trust −15% · fans −10% · market value +10% spike", trust: -15, fan: -10, mv: 1.1,
    ack: "Brazen and headline-grabbing. Your market value spikes +10% this season, but the manager (−15% trust) and the fans (−10% approval) are unimpressed." },
];

const POSITIONS = [
  { key: "GK", label: "Goalkeeper" },
  { key: "CB", label: "Centre Back" },
  { key: "LB", label: "Left Back" },
  { key: "RB", label: "Right Back" },
  { key: "CDM", label: "Defensive Mid" },
  { key: "CM", label: "Central Mid" },
  { key: "CAM", label: "Attacking Mid" },
  { key: "LW", label: "Left Wing" },
  { key: "RW", label: "Right Wing" },
  { key: "ST", label: "Striker" },
];

const POSITION_WEIGHTS = {
  GK: { goal: 0.02, assist: 0.05 },
  CB: { goal: 0.10, assist: 0.20 },
  LB: { goal: 0.15, assist: 0.55 },
  RB: { goal: 0.15, assist: 0.55 },
  CDM: { goal: 0.20, assist: 0.50 },
  CM: { goal: 0.40, assist: 0.75 },
  CAM: { goal: 0.70, assist: 1.0 },
  LW: { goal: 0.80, assist: 0.85 },
  RW: { goal: 0.80, assist: 0.85 },
  ST: { goal: 1.0, assist: 0.50 },
};

// Difficulty presets, picked when you build your player.
const DIFFICULTIES = [
  { key: "easy", label: "Easy", desc: "You create more chances and opponents are less clinical." },
  { key: "normal", label: "Normal", desc: "The intended experience — goals are earned." },
  { key: "hard", label: "Hard", desc: "Goals are scarce and stronger clubs punish every mistake." },
];
const DIFFICULTY_MODS = {
  easy: { playerMul: 1.25, teamMul: 1.3, oppMul: 0.75 },
  normal: { playerMul: 1, teamMul: 1, oppMul: 1 },
  hard: { playerMul: 0.8, teamMul: 0.75, oppMul: 1.3 },
};

const OUTFIELD_CATEGORIES = [
  { key: "PACE", label: "Pace", attrs: [
    { key: "acceleration", label: "Acceleration" },
    { key: "sprintSpeed", label: "Sprint Speed" },
  ] },
  { key: "SHOOTING", label: "Shooting", attrs: [
    { key: "finishing", label: "Finishing" },
    { key: "longShots", label: "Long Shots" },
    { key: "shotPower", label: "Shot Power" },
    { key: "volleys", label: "Volleys" },
    { key: "penalties", label: "Penalties" },
    { key: "freeKickAccuracy", label: "Free Kick Accuracy" },
    { key: "positioning", label: "Positioning" },
  ] },
  { key: "PASSING", label: "Passing", attrs: [
    { key: "shortPassing", label: "Short Passing" },
    { key: "longPassing", label: "Long Passing" },
    { key: "curve", label: "Curve" },
    { key: "crossing", label: "Crossing" },
    { key: "vision", label: "Vision" },
  ] },
  { key: "DRIBBLING", label: "Dribbling", attrs: [
    { key: "agility", label: "Agility" },
    { key: "balance", label: "Balance" },
    { key: "reactions", label: "Reactions" },
    { key: "ballControl", label: "Ball Control" },
    { key: "dribbling", label: "Dribbling" },
  ] },
  { key: "DEFENDING", label: "Defending", attrs: [
    { key: "interception", label: "Interception" },
    { key: "headers", label: "Headers" },
    { key: "standingTackle", label: "Standing Tackles" },
    { key: "slidingTackle", label: "Sliding Tackles" },
    { key: "defensiveAwareness", label: "Defensive Awareness" },
  ] },
  { key: "PHYSICAL", label: "Physical", attrs: [
    { key: "strength", label: "Strength" },
    { key: "jumping", label: "Jumping" },
    { key: "stamina", label: "Stamina" },
    { key: "aggression", label: "Aggression" },
  ] },
  { key: "MENTAL", label: "Mental", attrs: [
    { key: "composure", label: "Composure" },
    { key: "anticipation", label: "Anticipation" },
    { key: "concentration", label: "Concentration" },
    { key: "decisions", label: "Decisions" },
    { key: "teamwork", label: "Teamwork" },
    { key: "workRate", label: "Work Rate" },
  ] },
];

const GK_ATTRS = [
  { key: "diving", label: "Diving" },
  { key: "handling", label: "Handling" },
  { key: "reflexes", label: "Reflexes" },
  { key: "kicking", label: "Kicking" },
  { key: "gkPositioning", label: "Positioning" },
  { key: "composure", label: "Composure" },
  { key: "strength", label: "Strength" },
  { key: "pace", label: "Pace" },
];

const GK_CATEGORIES = [{ key: "GOALKEEPING", label: "Goalkeeping", attrs: GK_ATTRS }];

const TEAMS_BIG = ["Real Madrid", "FC Barcelona", "Manchester City", "Manchester United", "Liverpool", "Bayern Munich", "Paris Saint-Germain", "Juventus", "Chelsea", "Arsenal", "Inter Milan", "AC Milan"];
const TEAMS_MEDIUM = ["Atletico Madrid", "Napoli", "AS Roma", "Borussia Dortmund", "RB Leipzig", "Ajax", "FC Porto", "Benfica", "Tottenham Hotspur", "West Ham United", "Villarreal", "Olympique Lyonnais", "Sevilla", "Atalanta", "Bayer Leverkusen", "Newcastle United", "Aston Villa", "Athletic Bilbao", "Valencia", "Lazio", "Fiorentina"];
const TEAMS_SMALL = ["Getafe", "Real Sociedad", "Brentford", "Crystal Palace", "Bologna", "Udinese", "Stade Rennais", "Toulouse FC", "Feyenoord", "Club Brugge", "Celtic", "Rangers", "FC Copenhagen", "Real Betis", "RC Lens"];

// Star rating per club out of 5 (supports 0.5 steps). Falls back to the tier default if a club is missing.
const TEAM_STARS = {
  "Real Madrid": 5, "Manchester City": 5, "Liverpool": 5, "Bayern Munich": 5, "Paris Saint-Germain": 5, "Inter Milan": 5,
  "FC Barcelona": 4.5, "Manchester United": 4.5, "Chelsea": 4.5, "Arsenal": 4.5, "AC Milan": 4.5, "Juventus": 4.5, "Atletico Madrid": 4.5, "Borussia Dortmund": 4.5, "Bayer Leverkusen": 4.5,
  "Tottenham Hotspur": 4, "Napoli": 4, "Atalanta": 4, "RB Leipzig": 4, "Ajax": 4, "Benfica": 4, "Newcastle United": 4, "AS Roma": 3.5, "West Ham United": 3.5, "Villarreal": 3.5, "Olympique Lyonnais": 3.5, "FC Porto": 3.5, "Real Sociedad": 3.5, "Celtic": 3.5, "Feyenoord": 3.5, "Sevilla": 3.5, "Aston Villa": 3.5, "Athletic Bilbao": 3.5, "Valencia": 3.5, "Lazio": 3.5, "Fiorentina": 3.5,
  "Real Betis": 3, "Brentford": 3, "Crystal Palace": 3, "Bologna": 3, "Udinese": 3, "Stade Rennais": 3, "RC Lens": 3, "Club Brugge": 3, "Rangers": 3,
  "Getafe": 2.5, "FC Copenhagen": 2.5, "Toulouse FC": 2,
};
const TIER_STAR_FALLBACK = { BIG: 4.5, MEDIUM: 3.5, SMALL: 2.5 };

// Extra domestic competitions a club competes in, beyond the league + main cup + continental slot.
const EXTRA_CUP_BY_LEAGUE = { "Premier League": "Carabao Cup" };
const SUPER_CUP_BY_TEAM = {
  "Real Madrid": "Supercopa de España", "FC Barcelona": "Supercopa de España", "Atletico Madrid": "Supercopa de España",
  "Manchester City": "FA Community Shield", "Liverpool": "FA Community Shield", "Arsenal": "FA Community Shield",
  "Inter Milan": "Supercoppa Italiana", "AC Milan": "Supercoppa Italiana", "Juventus": "Supercoppa Italiana", "Napoli": "Supercoppa Italiana",
  "Bayern Munich": "DFL-Supercup", "Borussia Dortmund": "DFL-Supercup", "Bayer Leverkusen": "DFL-Supercup",
  "Paris Saint-Germain": "Trophée des Champions",
};

// Contract length a club is willing to hand out, by tier.
const TIER_YEARS = { BIG: 4, MEDIUM: 3, SMALL: 2 };
function clubYears(tier) {
  return TIER_YEARS[tier] || 3;
}

const TIER_CHANCE = { BIG: 0.12, MEDIUM: 0.45, SMALL: 0.80 };
const TIER_LABEL = { BIG: "Elite academy — pro deals are rare", MEDIUM: "Established academy — a fair shot", SMALL: "Developing club — backs its youth" };
const TIER_WAGE_BASE = { BIG: 42000, MEDIUM: 15000, SMALL: 5000 };
const CONTINENTAL_BY_TIER = { BIG: "UEFA Champions League", MEDIUM: "UEFA Europa League", SMALL: "UEFA Conference League" };
const LEAGUE_WIN_CHANCE = { BIG: 0.32, MEDIUM: 0.14, SMALL: 0.05 };
const CUP_WIN_CHANCE = { BIG: 0.20, MEDIUM: 0.16, SMALL: 0.10 };
const CONTINENTAL_WIN_CHANCE = { BIG: 0.10, MEDIUM: 0.12, SMALL: 0.15 };

const TEAM_LEAGUE = {
  "Manchester City": "Premier League", "Manchester United": "Premier League", "Liverpool": "Premier League",
  "Chelsea": "Premier League", "Arsenal": "Premier League", "Tottenham Hotspur": "Premier League",
  "West Ham United": "Premier League", "Brentford": "Premier League", "Crystal Palace": "Premier League",
  "Newcastle United": "Premier League", "Aston Villa": "Premier League",
  "Real Madrid": "La Liga", "FC Barcelona": "La Liga", "Atletico Madrid": "La Liga", "Sevilla": "La Liga",
  "Villarreal": "La Liga", "Getafe": "La Liga", "Real Sociedad": "La Liga", "Real Betis": "La Liga",
  "Athletic Bilbao": "La Liga", "Valencia": "La Liga",
  "Juventus": "Serie A", "Inter Milan": "Serie A", "AC Milan": "Serie A", "Napoli": "Serie A",
  "AS Roma": "Serie A", "Atalanta": "Serie A", "Bologna": "Serie A", "Udinese": "Serie A",
  "Lazio": "Serie A", "Fiorentina": "Serie A",
  "Bayern Munich": "Bundesliga", "Borussia Dortmund": "Bundesliga", "RB Leipzig": "Bundesliga", "Bayer Leverkusen": "Bundesliga",
  "Paris Saint-Germain": "Ligue 1", "Olympique Lyonnais": "Ligue 1", "Stade Rennais": "Ligue 1", "Toulouse FC": "Ligue 1", "RC Lens": "Ligue 1",
  "Ajax": "Eredivisie", "Feyenoord": "Eredivisie",
  "FC Porto": "Primeira Liga", "Benfica": "Primeira Liga",
  "Club Brugge": "Belgian Pro League",
  "Celtic": "Scottish Premiership", "Rangers": "Scottish Premiership",
  "FC Copenhagen": "Danish Superliga",
};

const CUP_NAME_BY_LEAGUE = {
  "Premier League": "FA Cup", "La Liga": "Copa del Rey", "Serie A": "Coppa Italia",
  "Bundesliga": "DFB-Pokal", "Ligue 1": "Coupe de France", "Eredivisie": "KNVB Cup",
  "Primeira Liga": "Taça de Portugal", "Belgian Pro League": "Belgian Cup",
  "Scottish Premiership": "Scottish Cup", "Danish Superliga": "Danish Cup",
};

const SEASON_LENGTH = 38;
const COMPETITION_CYCLE = ["League", "League", "Cup", "League", "Continental", "League"];
const PLAYSTYLE_COST = 50;
const SAVE_KEY = "football-career-sim-save-v1";

function costAt(value) {
  // Upgrade cost by the attribute's current value:
  // 50–69 → 1 SP · 70–79 → 2 SP · 80–94 → 3 SP · 95+ → 5 SP.
  if (value < 70) return 1;
  if (value < 80) return 2;
  if (value < 95) return 3;
  return 5;
}

function costForSteps(startValue, n) {
  let total = 0;
  for (let i = 0; i < n; i++) total += costAt(startValue + i);
  return total;
}

const INJURIES = ["Sprained Ankle", "Torn Hamstring", "Groin Strain", "Knee Ligament Strain"];

// One-time net-worth purchases that permanently boost the player.
const LUXURY_ITEMS = [
  { key: "PERSONAL_TRAINER", name: "Personal Trainer", icon: Dumbbell, price: 150000, desc: "Permanently cuts 1 SP off every attribute upgrade cost (minimum 1 SP).", note: "Attribute upgrades now cost 1 SP less." },
  { key: "PR_AGENT", name: "PR Agent", icon: Megaphone, price: 500000, desc: "Permanently multiplies your market value by 1.2x.", note: "Your market value is now boosted 1.2x." },
  { key: "LUXURY_MANSION", name: "Luxury Mansion", icon: Home, price: 2500000, desc: "The board respects your status — +15% success when requesting a higher contract.", note: "Contract requests now succeed 15% more often." },
  { key: "PR_FIRM", name: "Hire PR Firm", icon: Briefcase, price: 750000, desc: "Boosts background reputation odds by 20% during contract adjustments.", note: "The board now views your contract requests 20% more favourably." },
  { key: "SUPERCAR", name: "Buy a Supercar", icon: Car, price: 350000, desc: "Massive driver confidence gives a permanent +5% success check modifier across all Dribbling and Pace match options.", note: "All Dribbling and Pace match options now have +5% success." },
  { key: "SPORTS_PSYCHOLOGIST", name: "Sports Psychologist", icon: Brain, price: 1200000, desc: "Permanently adds an extra +8% success rate check to all Mental and Composure match options.", note: "Mental and Composure match options now have +8% success." },
  { key: "FOOTBALL_ACADEMY", name: "Invest in Football Academy", icon: GraduationCap, price: 5000000, desc: "Generates secure sports dividends, yielding +500 Banked SP at the start of every new season.", note: "You'll bank +500 SP at the start of every season." },
  { key: "PRIVATE_JET", name: "Buy a Private Jet", icon: Plane, price: 15000000, desc: "Elite status presence. Big Tier clubs are now 35% more likely to appear in your summer transfer window offers.", note: "Big Tier clubs now appear 35% more often in transfer windows." },
];

// Competitions where earned SP is doubled (continental football nights).
const CONTINENTAL_COMPETITIONS = ["UEFA Champions League", "UEFA Europa League", "UEFA Conference League"];

// Social media reaction pools for the fan sentiment feed.
const FAN_POSITIVE = [
  { handle: "@pundit_hub", body: "[Name] is completely running the league right now. Absolute star boy!" },
  { handle: "@topbins_show", body: "Another day, another [Name] masterclass against [opponent]. We are not worthy." },
  { handle: "@fan_faithful", body: "[Name] against [opponent] was different gravy tonight. Give him a lifetime deal." },
  { handle: "@statspark_fc", body: "[Name] is genuinely carrying this team right now — the numbers don't lie." },
];
const FAN_NEGATIVE = [
  { handle: "@ultras_zone", body: "Invisible performance today. Way overpaid for what we are seeing on the pitch." },
  { handle: "@tactics_hotseat", body: "Questions have to be asked of [Name] after that. Not acceptable at this level." },
  { handle: "@away_days_99", body: "Dropped points again. [Name] went missing when it mattered most." },
  { handle: "@red_card_weekly", body: "That is the second time [Name] has cost us this season. Losing patience fast." },
];
const FAN_NEUTRAL = [
  { handle: "@matchday_brief", body: "[Name] put in a steady shift against [opponent] — no fireworks, no disasters." },
  { handle: "@tactics_nerd", body: "Quiet afternoon for [Name]. Did the basics and kept it tidy." },
  { handle: "@pub_talk_fc", body: "Nothing to write home about from [Name] today, but nothing to complain about either." },
  { handle: "@statspark_fc", body: "[Name] was solid without being spectacular — decent numbers across the board." },
];

function fanComment(list, entry, playerName) {
  const pick = list[Math.floor(Math.random() * list.length)];
  return {
    handle: pick.handle,
    body: pick.body.replace(/\[Name\]/g, playerName).replace(/\[opponent\]/g, entry.opponent || "the opposition"),
  };
}

// 10-point Match Rating for a single appearance.
// Base 6. Your situation choice swings it: come off → 8, mess it up → 5.
// Goals/assists then set a guaranteed floor by contribution count:
// 1 goal = 7.5 · 1 assist = 6.5 · two contributions (goal+assist or a brace) = 9.0 · 3+ = 10.0.
function computeMatchRating(info) {
  let r = 6.0;
  if (info.choice === "success") r += 2.0;
  else if (info.choice === "fail") r -= 1.0;
  if (info.position === "GK" && info.cleanSheet) r += 1.3;

  const g = info.goals || 0;
  const a = info.assists || 0;
  const total = g + a;
  let floor = null;
  if (total === 1) floor = g === 1 ? 7.5 : 6.5;
  else if (total === 2) floor = 9.0;
  else if (total >= 3) floor = 10.0;
  if (floor != null) r = Math.max(r, floor);

  r -= (info.ownGoal || 0) * 1.0;
  r -= (info.red || 0) * 2.0;
  return Math.round(Math.max(1.0, Math.min(10.0, r)) * 10) / 10;
}

const SITUATIONS_OUTFIELD = [
  {
    key: "ONE_V_ONE",
    prompt: "You're through on goal — just the keeper to beat. What do you try?",
    options: [
      { key: "PLACEMENT", label: "Place it into the corner", resultType: "goal", base: 0.68, icon: Target, attrFn: (a) => a.finishing * 0.5 + a.composure * 0.5, playstyles: ["FINESSE_SHOT"] },
      { key: "CHIP", label: "Chip it over the keeper", resultType: "goal", base: 0.52, icon: ArrowUpRight, attrFn: (a) => a.composure * 0.6 + a.finishing * 0.4, playstyles: ["CHIP_SHOT"] },
      { key: "POWER", label: "Smash it near post", resultType: "goal", base: 0.58, icon: Zap, attrFn: (a) => a.shotPower * 0.6 + a.finishing * 0.4, playstyles: ["POWER_SHOT"] },
      { key: "SKILL_MOVE", label: "Dribble around the keeper", resultType: "goal", base: 0.55, icon: Star, attrFn: (a) => a.dribbling * 0.5 + a.agility * 0.5, playstyles: ["TRICKSTER", "TECHNICAL"] },
    ],
  },
  {
    key: "EDGE_OF_BOX",
    prompt: "You collect it 20 yards out with a sight of goal. What's the play?",
    options: [
      { key: "CURLER", label: "Curl a finesse shot into the far corner", resultType: "goal", base: 0.58, icon: Wand2, attrFn: (a) => a.finishing * 0.3 + a.curve * 0.4 + a.composure * 0.3, playstyles: ["FINESSE_SHOT"] },
      { key: "DRIVEN", label: "Strike it low and hard", resultType: "goal", base: 0.5, icon: Rocket, attrFn: (a) => a.shotPower * 0.6 + a.longShots * 0.4, playstyles: ["POWER_SHOT"] },
      { key: "SQUARE_PASS", label: "Square it to a teammate in space", resultType: "assist", base: 0.68, icon: Send, attrFn: (a) => a.vision * 0.5 + a.shortPassing * 0.5, playstyles: ["INCISIVE_PASS", "TIKI_TAKA"] },
      { key: "TAKE_TOUCH", label: "Take a touch and drive into the box", resultType: "goal", base: 0.48, icon: Gauge, attrFn: (a) => a.dribbling * 0.5 + a.agility * 0.5, playstyles: ["RAPID", "TECHNICAL"] },
    ],
  },
  {
    key: "FREE_KICK",
    prompt: "You've won a free kick in a dangerous position. How do you take it?",
    options: [
      { key: "DIRECT_CURL", label: "Curl it over the wall into the top corner", resultType: "goal", base: 0.55, icon: Crosshair, attrFn: (a) => a.freeKickAccuracy * 0.7 + a.curve * 0.3, playstyles: ["DEAD_BALL"] },
      { key: "LOW_DRIVEN", label: "Drive it low under the wall", resultType: "goal", base: 0.48, icon: Swords, attrFn: (a) => a.freeKickAccuracy * 0.5 + a.shotPower * 0.5, playstyles: ["DEAD_BALL", "POWER_SHOT"] },
      { key: "SHORT_PASS", label: "Play it short for a one-two", resultType: "assist", base: 0.62, icon: Repeat, attrFn: (a) => a.shortPassing * 0.5 + a.vision * 0.5, playstyles: ["TIKI_TAKA", "INCISIVE_PASS"] },
    ],
  },
  {
    key: "THROUGH_BALL",
    prompt: "You burst into the box with the ball at your feet and options around you.",
    options: [
      { key: "CUTBACK", label: "Cut it back for a teammate arriving late", resultType: "assist", base: 0.66, icon: Radar, attrFn: (a) => a.vision * 0.5 + a.shortPassing * 0.5, playstyles: ["INCISIVE_PASS", "TIKI_TAKA"] },
      { key: "FIRST_TIME", label: "Hit it first time", resultType: "goal", base: 0.52, icon: Sparkles, attrFn: (a) => a.shotPower * 0.4 + a.finishing * 0.4 + a.reactions * 0.2, playstyles: ["POWER_SHOT"] },
      { key: "PLACE_IT", label: "Take a touch and place it", resultType: "goal", base: 0.6, icon: Hand, attrFn: (a) => a.finishing * 0.5 + a.composure * 0.5, playstyles: ["FINESSE_SHOT"] },
    ],
  },
  {
    key: "PENALTY_KICK",
    prompt: "You step up to take a penalty. The keeper bounces on his line. Your move?",
    options: [
      { key: "SMASH_DOWN", label: "Smash it into the roof of the net", resultType: "goal", base: 0.62, icon: Swords, attrFn: (a) => a.penalties * 0.5 + a.shotPower * 0.5, playstyles: ["POWER_SHOT"] },
      { key: "LOW_CORNER", label: "Place it low into the corner", resultType: "goal", base: 0.68, icon: Target, attrFn: (a) => a.penalties * 0.6 + a.composure * 0.4, playstyles: ["FINESSE_SHOT"] },
      { key: "PANENKA", label: "Panenka — chip it gently down the middle", resultType: "goal", base: 0.48, icon: ArrowUpRight, attrFn: (a) => a.composure * 0.5 + a.penalties * 0.5, playstyles: ["CHIP_SHOT"] },
    ],
  },
  {
    key: "CORNER_ATTACK",
    prompt: "Your corner is about to be whipped in. Where do you attack it?",
    options: [
      { key: "FAR_POST_HEADER", label: "Attack the far post with a header", resultType: "goal", base: 0.58, icon: Crosshair, attrFn: (a) => a.headers * 0.6 + a.positioning * 0.4, playstyles: ["PRECISION_HEADER", "AERIAL_FORTRESS"] },
      { key: "NEAR_POST_FLICK", label: "Flick it on at the near post", resultType: "assist", base: 0.6, icon: Wind, attrFn: (a) => a.headers * 0.5 + a.positioning * 0.3 + a.reactions * 0.2, playstyles: ["PRECISION_HEADER", "AERIAL_FORTRESS"] },
      { key: "SHORT_CORNER", label: "Work a short corner and find a runner", resultType: "assist", base: 0.6, icon: Repeat, attrFn: (a) => a.vision * 0.5 + a.shortPassing * 0.5, playstyles: ["TIKI_TAKA", "INCISIVE_PASS"] },
    ],
  },
  {
    key: "WING_BYLINE",
    prompt: "You've driven to the byline with the full-back beaten. What now?",
    options: [
      { key: "CUTBACK_SQUARE", label: "Cut it back to the penalty spot", resultType: "assist", base: 0.66, icon: CornerUpRight, attrFn: (a) => a.vision * 0.5 + a.shortPassing * 0.5, playstyles: ["INCISIVE_PASS", "TIKI_TAKA"] },
      { key: "LOW_CROSS_FIZZ", label: "Fizz a low cross through the six-yard box", resultType: "assist", base: 0.58, icon: Wind, attrFn: (a) => a.crossing * 0.6 + a.curve * 0.4, playstyles: ["WHIPPED_PASS"] },
      { key: "NEAR_POST_SHOT", label: "Shoot across goal at the near post", resultType: "goal", base: 0.48, icon: Zap, attrFn: (a) => a.finishing * 0.4 + a.shotPower * 0.3 + a.composure * 0.3, playstyles: ["GAMECHANGER", "FINESSE_SHOT"] },
    ],
  },
  {
    key: "COUNTER_BREAK",
    prompt: "You win it deep and the whole defence is out of shape — full sprint time.",
    options: [
      { key: "GALLOP_AND_FINISH", label: "Run it all the way and finish yourself", resultType: "goal", base: 0.55, icon: Gauge, attrFn: (a) => a.sprintSpeed * 0.4 + a.finishing * 0.4 + a.composure * 0.2, playstyles: ["RAPID", "QUICK_STEP"] },
      { key: "SLIDE_TEAMMATE", label: "Slide a pass into your striker's run", resultType: "assist", base: 0.6, icon: Radar, attrFn: (a) => a.vision * 0.5 + a.longPassing * 0.5, playstyles: ["INCISIVE_PASS", "PINGED_PASS"] },
      { key: "EARLY_STRIKE", label: "Catch the keeper out from distance", resultType: "goal", base: 0.45, icon: Rocket, attrFn: (a) => a.longShots * 0.5 + a.shotPower * 0.5, playstyles: ["POWER_SHOT", "LONG_BALL_PASS"] },
    ],
  },
  {
    key: "PRESSURE_RECEIVE",
    prompt: "The ball is drilled into your feet with a defender right on your back.",
    options: [
      { key: "HOLD_LAYOFF", label: "Hold him off and lay it back to a runner", resultType: "assist", base: 0.62, icon: Repeat, attrFn: (a) => a.shortPassing * 0.4 + a.strength * 0.3 + a.balance * 0.3, playstyles: ["PRESS_PROVEN", "TIKI_TAKA"] },
      { key: "SPIN_TURN", label: "Spin your man and drive at goal", resultType: "goal", base: 0.55, icon: RotateCw, attrFn: (a) => a.dribbling * 0.4 + a.agility * 0.3 + a.finishing * 0.3, playstyles: ["TECHNICAL", "TRICKSTER"] },
      { key: "FIRST_TIME_FLICK", label: "Flick it first time into the channel", resultType: "assist", base: 0.52, icon: Sparkles, attrFn: (a) => a.ballControl * 0.4 + a.vision * 0.3 + a.reactions * 0.3, playstyles: ["FIRST_TOUCH", "INVENTIVE"] },
    ],
  },
  {
    key: "AERIAL_DUEL",
    prompt: "The ball hangs in the air inside the box — you and the defender both jump.",
    options: [
      { key: "POWER_HEADER", label: "Attack it with a powerful header", resultType: "goal", base: 0.6, icon: ChevronsUp, attrFn: (a) => a.headers * 0.6 + a.strength * 0.2 + a.jumping * 0.2, playstyles: ["PRECISION_HEADER", "AERIAL_FORTRESS"] },
      { key: "FLICK_ON", label: "Flick it on for a teammate behind you", resultType: "assist", base: 0.6, icon: Wind, attrFn: (a) => a.headers * 0.5 + a.positioning * 0.3 + a.vision * 0.2, playstyles: ["PRECISION_HEADER", "AERIAL_FORTRESS"] },
      { key: "CHEST_VOLLEY", label: "Kill it on your chest and volley", resultType: "goal", base: 0.5, icon: Move, attrFn: (a) => a.volleys * 0.5 + a.ballControl * 0.3 + a.composure * 0.2, playstyles: ["FIRST_TOUCH", "ACROBAT"] },
    ],
  },
  {
    key: "LAST_DITCH_DEFENCE",
    prompt: "They're through — you're the last defender and you have one chance to stop it.",
    options: [
      { key: "BLOCK_SHOT", label: "Throw yourself in front of the shot", resultType: "defence", base: 0.58, icon: ShieldCheck, attrFn: (a) => a.defensiveAwareness * 0.5 + a.reactions * 0.3 + a.strength * 0.2, playstyles: ["BLOCK", "GUARDIAN"] },
      { key: "STAND_TACKLE", label: "Time a perfect standing tackle", resultType: "defence", base: 0.6, icon: Shield, attrFn: (a) => a.standingTackle * 0.6 + a.anticipation * 0.4, playstyles: ["ANTICIPATE", "GUARDIAN"] },
      { key: "SLIDE_TACKLE", label: "Go to ground with a slide tackle", resultType: "defence", base: 0.45, icon: Swords, attrFn: (a) => a.slidingTackle * 0.5 + a.anticipation * 0.3 + a.aggression * 0.2, playstyles: ["BRUISER", "GUARDIAN"] },
    ],
  },
  {
    key: "TWO_V_ONE",
    prompt: "It's you and a striker against the last defender — perfect numbers.",
    options: [
      { key: "SQUARE_IT", label: "Square it for the tap-in", resultType: "assist", base: 0.68, icon: Send, attrFn: (a) => a.shortPassing * 0.5 + a.vision * 0.5, playstyles: ["INCISIVE_PASS", "TIKI_TAKA"] },
      { key: "GO_ALONE", label: "Keep it and beat the man yourself", resultType: "goal", base: 0.55, icon: Star, attrFn: (a) => a.dribbling * 0.5 + a.agility * 0.5, playstyles: ["TRICKSTER", "TECHNICAL"] },
      { key: "CHIP_KEEPER", label: "Chip the keeper from an angle", resultType: "goal", base: 0.5, icon: ArrowUpRight, attrFn: (a) => a.composure * 0.4 + a.finishing * 0.4 + a.curve * 0.2, playstyles: ["CHIP_SHOT", "FINESSE_SHOT"] },
    ],
  },
  {
    key: "WING_ISOLATION",
    prompt: "One-v-one on the wing — the full-back is backing off and waiting for you.",
    options: [
      { key: "KNOCK_AND_CROSS", label: "Knock it past him and whip a cross in", resultType: "assist", base: 0.6, icon: Wind, attrFn: (a) => a.acceleration * 0.4 + a.crossing * 0.4 + a.curve * 0.2, playstyles: ["RAPID", "WHIPPED_PASS"] },
      { key: "KNOCK_AND_SHOOT", label: "Knock it past him, cut in and shoot", resultType: "goal", base: 0.55, icon: Gauge, attrFn: (a) => a.acceleration * 0.3 + a.finishing * 0.4 + a.composure * 0.3, playstyles: ["RAPID", "QUICK_STEP"] },
      { key: "DROP_SHOULDER", label: "Drop the shoulder and cut inside", resultType: "goal", base: 0.5, icon: RotateCw, attrFn: (a) => a.dribbling * 0.5 + a.agility * 0.3 + a.finishing * 0.2, playstyles: ["TECHNICAL", "FINESSE_SHOT"] },
    ],
  },
  {
    key: "LOOSE_BALL_SCRAP",
    prompt: "A loose ball in midfield — fifty-fifty and nobody is backing out.",
    options: [
      { key: "WIN_AND_SPREAD", label: "Win it and spread it wide first time", resultType: "assist", base: 0.62, icon: Radar, attrFn: (a) => a.shortPassing * 0.4 + a.vision * 0.4 + a.strength * 0.2, playstyles: ["PINGED_PASS", "TIKI_TAKA"] },
      { key: "WIN_AND_SHIELD", label: "Win it and shield it until support arrives", resultType: "assist", base: 0.58, icon: HandMetal, attrFn: (a) => a.strength * 0.4 + a.balance * 0.3 + a.composure * 0.3, playstyles: ["PRESS_PROVEN", "ENFORCER"] },
      { key: "WIN_AND_DRIVE", label: "Win it and drive forward to shoot", resultType: "goal", base: 0.48, icon: Rocket, attrFn: (a) => a.longShots * 0.4 + a.shotPower * 0.3 + a.strength * 0.3, playstyles: ["POWER_SHOT", "ENFORCER"] },
    ],
  },
];

const SITUATIONS_GK = [
  {
    key: "GK_SAVE",
    prompt: "The striker is through on goal, bearing down on you. How do you set up?",
    options: [
      { key: "NARROW_ANGLE", label: "Stand tall and narrow the angle", resultType: "save", base: 0.62, icon: Shield, attrFn: (a) => a.reflexes * 0.4 + a.gkPositioning * 0.6, playstyles: ["FOOTWORK"] },
      { key: "RUSH", label: "Rush out to close him down", resultType: "save", base: 0.55, icon: CornerUpRight, attrFn: (a) => a.pace * 0.4 + a.diving * 0.3 + a.gkPositioning * 0.3, playstyles: ["RUSH_OUT", "FOOTWORK"] },
      { key: "STAY_HOME", label: "Stay on your line and react", resultType: "save", base: 0.58, icon: Footprints, attrFn: (a) => a.reflexes * 0.6 + a.diving * 0.4, playstyles: ["FOOTWORK"] },
      { key: "DIVE_EARLY", label: "Dive early to smother the shot", resultType: "save", base: 0.5, icon: Compass, attrFn: (a) => a.diving * 0.6 + a.reflexes * 0.4, playstyles: ["FAR_REACH"] },
    ],
  },
  {
    key: "CROSS_CLAIM",
    prompt: "A cross is whipped into the six-yard box with attackers arriving. Your call?",
    options: [
      { key: "CLAIM_CATCH", label: "Attack it and catch it cleanly", resultType: "save", base: 0.62, icon: UserCheck, attrFn: (a) => a.handling * 0.5 + a.gkPositioning * 0.3 + a.strength * 0.2, playstyles: ["CROSS_CLAIMER"] },
      { key: "PUNCH_CLEAR", label: "Punch it clear under pressure", resultType: "save", base: 0.55, icon: Shield, attrFn: (a) => a.strength * 0.4 + a.handling * 0.3 + a.gkPositioning * 0.3, playstyles: ["CROSS_CLAIMER", "FOOTWORK"] },
      { key: "STAY_ON_LINE", label: "Hold your line and react", resultType: "save", base: 0.52, icon: Footprints, attrFn: (a) => a.reflexes * 0.5 + a.gkPositioning * 0.3 + a.composure * 0.2, playstyles: ["FOOTWORK"] },
    ],
  },
  {
    key: "LONG_RANGE_SHOT",
    prompt: "A midfielder lets fly from 25 yards — it's dipping towards the top corner.",
    options: [
      { key: "TIP_OVER", label: "Tip it over the bar", resultType: "save", base: 0.6, icon: Compass, attrFn: (a) => a.reflexes * 0.5 + a.diving * 0.3 + a.composure * 0.2, playstyles: ["FAR_REACH"] },
      { key: "CATCH_CLEAN", label: "Go for the clean catch", resultType: "save", base: 0.55, icon: Hand, attrFn: (a) => a.handling * 0.5 + a.reflexes * 0.3 + a.composure * 0.2, playstyles: ["FOOTWORK", "FAR_REACH"] },
      { key: "PARRY_WIDE", label: "Parry it wide to safety", resultType: "save", base: 0.5, icon: CornerUpRight, attrFn: (a) => a.diving * 0.5 + a.reflexes * 0.3 + a.strength * 0.2, playstyles: ["FAR_REACH"] },
    ],
  },
  {
    key: "WALL_FREE_KICK",
    prompt: "A free kick sits just outside the box — you have to set your wall and pick a side.",
    options: [
      { key: "DIVE_NEAR", label: "Set the wall and dive for the near post", resultType: "save", base: 0.58, icon: CornerUpRight, attrFn: (a) => a.diving * 0.4 + a.gkPositioning * 0.4 + a.reflexes * 0.2, playstyles: ["FAR_REACH"] },
      { key: "DIVE_FAR", label: "Guard the far corner", resultType: "save", base: 0.55, icon: Compass, attrFn: (a) => a.reflexes * 0.4 + a.diving * 0.4 + a.gkPositioning * 0.2, playstyles: ["FAR_REACH", "FOOTWORK"] },
      { key: "READ_LOW", label: "Anticipate the low shot under the wall", resultType: "save", base: 0.52, icon: Footprints, attrFn: (a) => a.gkPositioning * 0.5 + a.reflexes * 0.3 + a.composure * 0.2, playstyles: ["FOOTWORK"] },
    ],
  },
  {
    key: "PENALTY_SAVE",
    prompt: "A penalty against you — the striker places the ball and steps back. Read him.",
    options: [
      { key: "WAIT_REACT", label: "Hold your ground and react to the strike", resultType: "save", base: 0.6, icon: Shield, attrFn: (a) => a.reflexes * 0.6 + a.handling * 0.2 + a.composure * 0.2, playstyles: ["FOOTWORK"] },
      { key: "STAY_TALL", label: "Stay big in the middle of the goal", resultType: "save", base: 0.55, icon: UserCheck, attrFn: (a) => a.composure * 0.4 + a.handling * 0.3 + a.strength * 0.3, playstyles: ["FOOTWORK", "CROSS_CLAIMER"] },
      { key: "GUESS_EARLY", label: "Guess a corner and dive early", resultType: "save", base: 0.45, icon: Compass, attrFn: (a) => a.gkPositioning * 0.4 + a.reflexes * 0.3 + a.composure * 0.3, playstyles: ["RUSH_OUT", "FAR_REACH"] },
    ],
  },
  {
    key: "SWEEP_THROUGH_BALL",
    prompt: "A through ball is about to drop behind your defence — you're the last line.",
    options: [
      { key: "SWEEP_CLEAR", label: "Sprint out and clear it upfield", resultType: "save", base: 0.58, icon: CornerUpRight, attrFn: (a) => a.pace * 0.5 + a.gkPositioning * 0.3 + a.composure * 0.2, playstyles: ["RUSH_OUT"] },
      { key: "SMOTHER_LOW", label: "Smother it at the striker's feet", resultType: "save", base: 0.52, icon: Footprints, attrFn: (a) => a.pace * 0.4 + a.handling * 0.3 + a.diving * 0.3, playstyles: ["RUSH_OUT", "FOOTWORK"] },
      { key: "STAY_AND_SAVE", label: "Stay put and make the save yourself", resultType: "save", base: 0.5, icon: Shield, attrFn: (a) => a.reflexes * 0.5 + a.gkPositioning * 0.3 + a.pace * 0.2, playstyles: ["FOOTWORK"] },
    ],
  },
];

function generateSituation(position, avoidKey) {
  const pool = position === "GK" ? SITUATIONS_GK : SITUATIONS_OUTFIELD;
  if (pool.length > 1 && avoidKey) {
    const others = pool.filter((s) => s.key !== avoidKey);
    return others[Math.floor(Math.random() * others.length)];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

// Which attribute keys an option actually leans on, read straight from its scoring function.
function optionAttrKeys(opt) {
  if (!opt || !opt.attrFn) return [];
  const src = opt.attrFn.toString();
  const keys = [];
  const re = /a\.([A-Za-z_][A-Za-z0-9_]*)/g;
  let m;
  while ((m = re.exec(src))) if (!keys.includes(m[1])) keys.push(m[1]);
  return keys;
}

function computeOptionChance(opt, attributes, selectedPlaystyles, mods = {}) {
  const list = opt.playstyles || (opt.playstyle ? [opt.playstyle] : []);
  const raw = opt.attrFn(attributes);
  // Higher attributes for the move genuinely raise the odds of it coming off.
  const attrBonus = ((Math.min(99, Math.max(1, raw)) - 50) / 50) * 0.45;
  let psBonus = 0;
  list.forEach((k) => {
    if (selectedPlaystyles.includes(k)) psBonus += 0.09;
  });
  psBonus = Math.min(0.24, psBonus);

  // Permanent luxury perk modifiers.
  let extra = 0;
  const luxuries = mods.luxuries || [];
  if (luxuries.includes("SUPERCAR")) {
    const keys = optionAttrKeys(opt);
    const paceKeys = ["acceleration", "sprintSpeed", "pace"];
    const dribbleKeys = ["agility", "dribbling", "ballControl", "balance"];
    if (keys.some((k) => paceKeys.includes(k) || dribbleKeys.includes(k))) extra += 0.05;
  }
  if (luxuries.includes("SPORTS_PSYCHOLOGIST")) {
    const keys = optionAttrKeys(opt);
    const mentalKeys = ["composure", "concentration", "anticipation", "decisions"];
    if (keys.some((k) => mentalKeys.includes(k))) extra += 0.08;
  }
  // Fan unrest: under 25% approval, concentration strain hurts every choice.
  if (mods.fanApproval != null && mods.fanApproval < 25) extra -= 0.05;

  // A little momentum luck so a well-matched move pays off more often than a coin flip.
  return Math.min(0.96, Math.max(0.3, opt.base + attrBonus + psBonus + extra + 0.05));
}

const PLAYSTYLE_CATEGORIES = [
  { key: "SCORING", label: "Scoring" },
  { key: "PASSING", label: "Passing" },
  { key: "DRIBBLING", label: "Ball Control & Dribbling" },
  { key: "DEFENDING", label: "Defending" },
  { key: "PHYSICAL", label: "Physical" },
  { key: "GOALKEEPING", label: "Goalkeeping" },
];

const PLAYSTYLES = [
  { key: "FINESSE_SHOT", category: "SCORING", name: "Finesse Shot", desc: "Curls precise, accurate finesse shots.", icon: Wand2 },
  { key: "POWER_SHOT", category: "SCORING", name: "Power Shot", desc: "Hits long-range shots with extra pace.", icon: Zap },
  { key: "DEAD_BALL", category: "SCORING", name: "Dead Ball", desc: "Bends free kicks and set pieces true.", icon: Target },
  { key: "TRIVELA", category: "SCORING", name: "Trivela", desc: "Whips outside-of-the-foot shots and passes.", icon: Shuffle },
  { key: "CHIP_SHOT", category: "SCORING", name: "Chip Shot", desc: "Lifts delicate chips over the keeper.", icon: ArrowUpRight },
  { key: "GAMECHANGER", category: "SCORING", name: "Gamechanger", desc: "Finds composed finishes in tight spaces.", icon: Sparkles },
  { key: "PRECISION_HEADER", category: "SCORING", name: "Precision Header", desc: "Directs headers on target with accuracy.", icon: Crosshair },

  { key: "INCISIVE_PASS", category: "PASSING", name: "Incisive Pass", desc: "Threads sharper, curving through-balls.", icon: Send },
  { key: "PINGED_PASS", category: "PASSING", name: "Pinged Pass", desc: "Fires fast, easy-to-control ground passes.", icon: Rocket },
  { key: "TIKI_TAKA", category: "PASSING", name: "Tiki Taka", desc: "Speeds up crisp one-touch passing.", icon: Repeat },
  { key: "LONG_BALL_PASS", category: "PASSING", name: "Long Ball Pass", desc: "Switches play with pinpoint long balls.", icon: Radar },
  { key: "WHIPPED_PASS", category: "PASSING", name: "Whipped Pass", desc: "Whips fast, bending crosses into the box.", icon: Wind },
  { key: "INVENTIVE", category: "PASSING", name: "Inventive", desc: "Adds unpredictable, creative passing angles.", icon: Lightbulb },

  { key: "RAPID", category: "DRIBBLING", name: "Rapid", desc: "Sprints with the ball at full pace.", icon: Gauge },
  { key: "TECHNICAL", category: "DRIBBLING", name: "Technical", desc: "Turns tighter with quicker close control.", icon: RotateCw },
  { key: "TRICKSTER", category: "DRIBBLING", name: "Trickster", desc: "Unlocks flashy skill moves and feints.", icon: Star },
  { key: "PRESS_PROVEN", category: "DRIBBLING", name: "Press Proven", desc: "Shields the ball under heavy pressure.", icon: Shield },
  { key: "FIRST_TOUCH", category: "DRIBBLING", name: "First Touch", desc: "Cushions fast balls cleanly under control.", icon: Hand },
  { key: "ENFORCER", category: "DRIBBLING", name: "Enforcer", desc: "Holds off challengers with strong shielding.", icon: HandMetal },

  { key: "ANTICIPATE", category: "DEFENDING", name: "Anticipate", desc: "Reads the game to win standing tackles.", icon: Eye },
  { key: "INTERCEPT", category: "DEFENDING", name: "Intercept", desc: "Cuts out passing lanes more often.", icon: Magnet },
  { key: "BLOCK", category: "DEFENDING", name: "Block", desc: "Reacts faster to block shots and passes.", icon: ShieldCheck },
  { key: "BRUISER", category: "DEFENDING", name: "Bruiser", desc: "Wins physical shoulder duels.", icon: Swords },
  { key: "GUARDIAN", category: "DEFENDING", name: "Guardian", desc: "Times hard tackles at speed.", icon: ShieldAlert },
  { key: "AERIAL_FORTRESS", category: "DEFENDING", name: "Aerial Fortress", desc: "Dominates headers inside the box.", icon: ChevronsUp },

  { key: "RELENTLESS", category: "PHYSICAL", name: "Relentless", desc: "Recovers stamina faster during matches.", icon: Activity },
  { key: "QUICK_STEP", category: "PHYSICAL", name: "Quick Step", desc: "Explodes into sprints from a standstill.", icon: Timer },
  { key: "ACROBAT", category: "PHYSICAL", name: "Acrobat", desc: "Pulls off acrobatic volleys and clearances.", icon: Move },
  { key: "LONG_THROW", category: "PHYSICAL", name: "Long Throw", desc: "Launches throw-ins deep into the box.", icon: TrendingUp },

  { key: "FOOTWORK", category: "GOALKEEPING", name: "Footwork", desc: "Reacts with quick feet at close range.", icon: Footprints },
  { key: "CROSS_CLAIMER", category: "GOALKEEPING", name: "Cross Claimer", desc: "Comes for crosses ahead of attackers.", icon: UserCheck },
  { key: "RUSH_OUT", category: "GOALKEEPING", name: "Rush Out", desc: "Closes down through-balls at speed.", icon: CornerUpRight },
  { key: "FAR_REACH", category: "GOALKEEPING", name: "Far Reach", desc: "Stretches further to reach long-range shots.", icon: Compass },
];

const PLAYSTYLE_BY_KEY = PLAYSTYLES.reduce((acc, p) => { acc[p.key] = p; return acc; }, {});

function shuffledPool() {
  const pool = [
    ...TEAMS_BIG.map((name) => ({ name, tier: "BIG" })),
    ...TEAMS_MEDIUM.map((name) => ({ name, tier: "MEDIUM" })),
    ...TEAMS_SMALL.map((name) => ({ name, tier: "SMALL" })),
  ];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

function allAttrsFor(position) {
  return position === "GK" ? GK_ATTRS : OUTFIELD_CATEGORIES.flatMap((c) => c.attrs);
}

function categoriesFor(position) {
  return position === "GK" ? GK_CATEGORIES : OUTFIELD_CATEGORIES;
}

function baseAttributes(position) {
  const obj = {};
  allAttrsFor(position).forEach((a) => { obj[a.key] = 50; });
  return obj;
}

function overallOf(attributes, position) {
  const attrs = allAttrsFor(position);
  if (!attrs.every((a) => attributes[a.key] !== undefined)) return 50;
  const sum = attrs.reduce((s, a) => s + attributes[a.key], 0);
  return Math.round(sum / attrs.length);
}

function countInCategory(selected, category) {
  return selected.filter((k) => PLAYSTYLE_BY_KEY[k].category === category).length;
}

function playstyleBonuses(selected, position) {
  const scoringN = countInCategory(selected, "SCORING");
  const passingN = countInCategory(selected, "PASSING");
  const dribblingN = countInCategory(selected, "DRIBBLING");
  const defendingN = countInCategory(selected, "DEFENDING");
  const physicalN = countInCategory(selected, "PHYSICAL");
  const gkN = countInCategory(selected, "GOALKEEPING");
  return {
    atkBonus: scoringN * 2 + dribblingN * 0.5,
    passBonus: passingN * 2 + dribblingN * 1,
    paceBonus: physicalN * 0.03 + dribblingN * 0.01,
    oppReduction: defendingN * 0.015 + (position === "GK" ? gkN * 0.02 : 0),
  };
}

function simulateMatch(attributes, position, selectedPlaystyles, difficulty = "normal") {
  const weights = POSITION_WEIGHTS[position];
  const bonus = playstyleBonuses(selectedPlaystyles, position);
  const dm = DIFFICULTY_MODS[difficulty] || DIFFICULTY_MODS.normal;
  let atk, pass, paceRaw;

  if (position === "GK") {
    atk = 5;
    pass = attributes.kicking || 50;
    paceRaw = attributes.pace || 50;
  } else {
    atk = (attributes.finishing + attributes.shotPower + attributes.longShots + attributes.volleys + attributes.positioning + attributes.composure) / 6;
    pass = (attributes.shortPassing + attributes.longPassing + attributes.vision + attributes.crossing + attributes.curve) / 5;
    paceRaw = (attributes.acceleration + attributes.sprintSpeed) / 2;
  }
  atk = Math.min(99, atk + bonus.atkBonus);
  pass = Math.min(99, pass + bonus.passBonus);

  const paceFactor = paceRaw / 99;
  const paceMultiplier = 0.75 + 0.35 * paceFactor + bonus.paceBonus;

  // Deliberately stingy: goals/assists are earned, not automatic. A 50-rated
  // striker averages well under half a goal a game from open play alone.
  const shotAttempts = Math.max(1, Math.round((0.45 + weights.goal * 2.2) * paceMultiplier));
  const assistAttempts = Math.max(1, Math.round((0.45 + weights.assist * 2.2) * paceMultiplier));
  const goalChance = Math.min(0.45, (atk / 99) * weights.goal * 0.16 * dm.playerMul);
  const assistChance = Math.min(0.4, (pass / 99) * weights.assist * 0.16 * dm.playerMul);

  let goals = 0;
  for (let i = 0; i < shotAttempts; i++) if (Math.random() < goalChance) goals++;
  let assists = 0;
  for (let i = 0; i < assistAttempts; i++) if (Math.random() < assistChance) assists++;

  const composure = attributes.composure;
  const concentration = position === "GK" ? attributes.composure : attributes.concentration;
  const aggression = position === "GK" ? 20 : attributes.aggression;

  const ownGoal = Math.random() < 0.02 * (1 - ((composure + concentration) / 2) / 140) ? 1 : 0;
  const red = Math.random() < Math.max(0, 0.015 + 0.04 * (aggression / 99) - 0.02 * (composure / 99)) ? 1 : 0;

  const points = 3 + goals * 5 + assists * 3 - ownGoal * 1 - red * 1;
  return { goals, assists, ownGoal, red, points, oppReduction: bonus.oppReduction };
}

function teamTierFor(name) {
  if (TEAMS_BIG.includes(name)) return "BIG";
  if (TEAMS_MEDIUM.includes(name)) return "MEDIUM";
  return "SMALL";
}

function teamStarsFor(name) {
  return ratingFor({ name, tier: teamTierFor(name) });
}

// Opponents come from your own league, so club strength genuinely varies week to week.
function pickOpponent(club) {
  const myLeague = TEAM_LEAGUE[club.name];
  let pool = Object.keys(TEAM_LEAGUE).filter((n) => TEAM_LEAGUE[n] === myLeague && n !== club.name);
  if (pool.length < 2) pool = [...TEAMS_BIG, ...TEAMS_MEDIUM, ...TEAMS_SMALL].filter((n) => n !== club.name);
  return pool[Math.floor(Math.random() * pool.length)];
}

// Every club in your club's league (including yours) — for the league table.
function leagueClubNames(team) {
  const lg = TEAM_LEAGUE[team.name];
  return Object.keys(TEAM_LEAGUE).filter((n) => TEAM_LEAGUE[n] === lg);
}

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Star-gap to scoring balance, folded with the difficulty modifiers.
// gap > 0 means the opponent is stronger.
function balanceFor(gap, difficulty) {
  const m = DIFFICULTY_MODS[difficulty] || DIFFICULTY_MODS.normal;
  const teamFactor = Math.max(0.15, Math.min(2.6, Math.pow(0.74, gap) * m.teamMul));
  const oppFactor = Math.max(0.35, Math.min(2.6, Math.pow(1.5, gap) * m.oppMul));
  return {
    teamChance: Math.max(0.02, Math.min(0.34, 0.15 * teamFactor)),
    oppChance: Math.max(0.03, Math.min(0.34, 0.16 * oppFactor)),
  };
}

function matchBalance(myStars, oppStars, difficulty) {
  return balanceFor(oppStars - myStars, difficulty);
}

// Win/draw/loss odds from two 5-attempt binomial goal distributions.
function predictOdds(teamChance, oppChance) {
  const binom = (n, p, k) => {
    let c = 1;
    for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i;
    return c * Math.pow(p, k) * Math.pow(1 - p, n - k);
  };
  const pt = [];
  const po = [];
  for (let k = 0; k <= 5; k++) {
    pt.push(binom(5, teamChance, k));
    po.push(binom(5, oppChance, k));
  }
  let win = 0;
  let draw = 0;
  let loss = 0;
  for (let t = 0; t <= 5; t++) {
    for (let o = 0; o <= 5; o++) {
      const p = pt[t] * po[o];
      if (t > o) win += p;
      else if (t === o) draw += p;
      else loss += p;
    }
  }
  const total = win + draw + loss || 1;
  const w = Math.round((win / total) * 100);
  const d = Math.round((draw / total) * 100);
  return { win: w, draw: d, loss: Math.max(0, 100 - w - d) };
}

function sortStandings(a, b) {
  if (b.pts !== a.pts) return b.pts - a.pts;
  const gd = b.gf - b.ga - (a.gf - a.ga);
  if (gd !== 0) return gd;
  return b.gf - a.gf;
}

function goalRoll(chance, attempts = 5) {
  let g = 0;
  for (let i = 0; i < attempts; i++) if (Math.random() < chance) g++;
  return g;
}

function fixtureFor(matchday, club) {
  const league = TEAM_LEAGUE[club.name] || "League";
  const slot = COMPETITION_CYCLE[(matchday - 1) % COMPETITION_CYCLE.length];
  if (slot === "Cup") return CUP_NAME_BY_LEAGUE[league] || "Domestic Cup";
  if (slot === "Continental") return CONTINENTAL_BY_TIER[club.tier];
  return league;
}

function computeWage(overall, tier) {
  const base = TIER_WAGE_BASE[tier];
  const weekly = Math.round((base * (overall / 60)) / 50) * 50;
  const bonus = weekly * 20;
  return { weekly, bonus };
}

// Currency choices for the profile screen — purely presentational, values never convert.
const CURRENCIES = [
  { key: "USD", label: "USD ($)", symbol: "$" },
  { key: "EUR", label: "EUR (€)", symbol: "€" },
  { key: "GBP", label: "GBP (£)", symbol: "£" },
];
let activeCurrency = "USD";

function formatMoney(n, cur) {
  const def = CURRENCIES.find((c) => c.key === (cur || activeCurrency)) || CURRENCIES[0];
  return def.symbol + Math.round(n || 0).toLocaleString("en-US");
}

function ratingFor(team) {
  return NATION_STARS[team.name] != null ? NATION_STARS[team.name]
    : TEAM_STARS[team.name] != null ? TEAM_STARS[team.name]
      : TIER_STAR_FALLBACK[team.tier] != null ? TIER_STAR_FALLBACK[team.tier] : 3;
}

// Full competition list for a club: league first, then continental, domestic cup(s) and any super cup.
function competitionList(team) {
  const league = TEAM_LEAGUE[team.name] || "League";
  const list = [league];
  if (team.tier) list.push(CONTINENTAL_BY_TIER[team.tier]);
  const cup = CUP_NAME_BY_LEAGUE[league];
  if (cup) list.push(cup);
  const extra = EXTRA_CUP_BY_LEAGUE[league];
  if (extra) list.push(extra);
  const sup = SUPER_CUP_BY_TEAM[team.name];
  if (sup) list.push(sup);
  return list;
}

function StarRow({ filled, size }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          size={size}
          color={filled ? "#E8A33D" : "rgba(242,240,233,0.32)"}
          fill={filled ? "#E8A33D" : "rgba(242,240,233,0.05)"}
          strokeWidth={filled ? 0.5 : 1.3}
        />
      ))}
    </span>
  );
}

function StarRating({ rating, size = 13 }) {
  const pct = (Math.max(0, Math.min(5, rating || 0)) / 5) * 100;
  return (
    <span style={{ position: "relative", display: "inline-flex", verticalAlign: "middle", lineHeight: 1 }}>
      <StarRow filled={false} size={size} />
      <span style={{ position: "absolute", top: 0, left: 0, height: "100%", overflow: "hidden", width: `${pct}%` }}>
        <StarRow filled size={size} />
      </span>
    </span>
  );
}

// Rough market-value curve (overall -> value). Sharpens steeply for elite ratings.
const MV_CURVE = [
  [45, 0.1e6], [50, 0.2e6], [55, 0.5e6], [58, 1e6], [60, 2e6], [63, 4e6], [66, 8e6],
  [69, 14e6], [72, 22e6], [75, 34e6], [78, 48e6], [81, 66e6], [84, 92e6], [87, 125e6], [90, 165e6], [93, 200e6],
];
function mvAtOverall(ov) {
  const o = Math.min(99, Math.max(35, ov));
  if (o <= MV_CURVE[0][0]) return MV_CURVE[0][1];
  for (let i = 1; i < MV_CURVE.length; i++) {
    const [a, va] = MV_CURVE[i - 1];
    const [b, vb] = MV_CURVE[i];
    if (o <= b) return va + ((o - a) / (b - a)) * (vb - va);
  }
  return MV_CURVE[MV_CURVE.length - 1][1];
}

// How much each career goal/assist is still worth — fades hard as a player ages.
function statValueScale(age) {
  if (age <= 18) return { goal: 1000000, assist: 350000 };
  if (age <= 22) return { goal: 600000, assist: 200000 };
  if (age <= 26) return { goal: 300000, assist: 100000 };
  if (age <= 33) return { goal: 150000, assist: 50000 };
  return null; // 33+: no more stat growth — the market only values you less.
}

function computeMarketValue(attributes, position, career, age, selectedPlaystyles, club) {
  if (!position || !Object.keys(attributes).length) return 0;
  const ov = overallOf(attributes, position);
  // Overall rating baseline...
  let val = mvAtOverall(ov);
  // ...plus career stats, each goal/assist weighted by the player's age bracket.
  const scale = statValueScale(age);
  if (scale) {
    val += (career.goals || 0) * scale.goal;
    val += (career.assists || 0) * scale.assist;
  } else {
    // Age 33+: the value only slides — down 12% for every ~10 matches played (≈ 38 a season).
    const seasonsOver = age - 33;
    const blocks = Math.floor((seasonsOver * SEASON_LENGTH) / 10);
    if (blocks > 0) val *= Math.pow(0.88, blocks);
  }
  // The bigger your club, the more the market pays.
  if (club) {
    if (club.tier === "BIG") val *= 2.0;
    else if (club.tier === "MEDIUM") val *= 1.4;
  }
  const step = 50000;
  return Math.max(0, Math.round(val / step) * step);
}

// Which tier of club comes calling depends on how much you're worth.
function tierForValue(mv) {
  const M = mv / 1e6;
  const r = Math.random();
  if (M < 1) return r < 0.15 ? "MEDIUM" : "SMALL";
  if (M < 5) return r < 0.1 ? "BIG" : r < 0.6 ? "MEDIUM" : "SMALL";
  if (M < 15) return r < 0.3 ? "BIG" : r < 0.85 ? "MEDIUM" : "SMALL";
  if (M < 40) return r < 0.52 ? "BIG" : r < 0.93 ? "MEDIUM" : "SMALL";
  return r < 0.75 ? "BIG" : r < 0.99 ? "MEDIUM" : "SMALL";
}

function computeSeasonOutcome(club, seasonGoals, seasonAssists, overall) {
  const league = TEAM_LEAGUE[club.name] || "League";
  const cupName = CUP_NAME_BY_LEAGUE[league] || "Domestic Cup";
  const trophies = [];
  if (Math.random() < LEAGUE_WIN_CHANCE[club.tier]) trophies.push(`${league} title`);
  if (Math.random() < CUP_WIN_CHANCE[club.tier]) trophies.push(`${cupName} winner`);
  if (Math.random() < CONTINENTAL_WIN_CHANCE[club.tier]) trophies.push(`${CONTINENTAL_BY_TIER[club.tier]} winner`);

  const individualAwards = [];
  const goldenBootChance = Math.min(0.85, Math.max(0, (seasonGoals - 8) * 0.05));
  if (seasonGoals >= 10 && Math.random() < goldenBootChance) individualAwards.push(`Golden Boot (${seasonGoals} goals)`);
  const ballonEligible = overall >= 84 && seasonGoals + seasonAssists >= 25;
  if (ballonEligible && Math.random() < 0.12) individualAwards.push("Ballon d'Or");

  return { trophies, individualAwards };
}

export default function App() {
  const [phase, setPhase] = useState("setup");
  const [name, setName] = useState("");
  const [nation, setNation] = useState("");
  const [position, setPosition] = useState("");
  const [academyOptions, setAcademyOptions] = useState([]);
  const [selectedAcademy, setSelectedAcademy] = useState(null);
  const [trialOptions, setTrialOptions] = useState([]);
  const [club, setClub] = useState(null);
  const [contractMessage, setContractMessage] = useState("");
  const [attributes, setAttributes] = useState({});
  const [bankedPoints, setBankedPoints] = useState(0);
  const [allocDrafts, setAllocDrafts] = useState({});
  const [activeAttrCategory, setActiveAttrCategory] = useState("PACE");
  const [selectedPlaystyles, setSelectedPlaystyles] = useState([]);
  const [activePlaystyleCategory, setActivePlaystyleCategory] = useState("SCORING");
  const [matchesPlayed, setMatchesPlayed] = useState(0);
  const [age, setAge] = useState(16);
  const [career, setCareer] = useState({ goals: 0, assists: 0, ownGoals: 0, reds: 0 });
  const [matchLog, setMatchLog] = useState([]);
  const [seasonNumber, setSeasonNumber] = useState(1);
  const [matchday, setMatchday] = useState(1);
  const [seasonMatches, setSeasonMatches] = useState([]);
  const [seasonHistory, setSeasonHistory] = useState([]);
  const [showSeasonView, setShowSeasonView] = useState(false);
  const [showCareerView, setShowCareerView] = useState(false);
  const [wageWeekly, setWageWeekly] = useState(0);
  const [signingBonus, setSigningBonus] = useState(0);
  const [transferOffers, setTransferOffers] = useState([]);
  const [seasonComplete, setSeasonComplete] = useState(false);
  const [showSeasonEndPopup, setShowSeasonEndPopup] = useState(false);
  const [lastSeasonRecap, setLastSeasonRecap] = useState(null);
  const [pendingSituation, setPendingSituation] = useState(null);
  const [lastSituationKey, setLastSituationKey] = useState(null);
  const [contract, setContract] = useState(null); // { years, signedSeason }
  const [freeAgentNow, setFreeAgentNow] = useState(false);
  const [netWorth, setNetWorth] = useState(0);
  const [wageMessage, setWageMessage] = useState("");
  const [wageRequestSeason, setWageRequestSeason] = useState(0);
  const [transferNote, setTransferNote] = useState("");
  const [fitness, setFitness] = useState(100); // 0-100, drains every match played
  const [injury, setInjury] = useState(null); // { label, weeksLeft }
  const [injuryNotice, setInjuryNotice] = useState(null); // { title, lines } popup
  const [purchasedLuxuries, setPurchasedLuxuries] = useState([]);
  const [showShop, setShowShop] = useState(false);
  const [shopMessage, setShopMessage] = useState("");
  const [fanApproval, setFanApproval] = useState(50); // 0-100 fan sentiment
  const [fanFeed, setFanFeed] = useState([]); // { handle, body, tone }
  const [difficulty, setDifficulty] = useState("normal");
  const [currency, setCurrency] = useState("USD"); // display symbol only — values never convert
  const [resultsLimit, setResultsLimit] = useState(5);
  const [fixturePreview, setFixturePreview] = useState(null); // { competition, opponent } for the next gameweek
  const [leagueTable, setLeagueTable] = useState([]); // current-season league standings
  const [managerTrust, setManagerTrust] = useState(60); // 0-100; below 25 = benched
  const [currentYear, setCurrentYear] = useState(2026); // calendar year, +1 every new season
  const [intlStats, setIntlStats] = useState({ apps: 0, goals: 0 });
  const [intlHonours, setIntlHonours] = useState([]); // { name, year, season }
  const [mvSpike, setMvSpike] = useState(1); // arrogant press answer: +10% value for the season
  const [pressQ, setPressQ] = useState(null); // { heading, question, ack }
  const [intlNotice, setIntlNotice] = useState(null); // { title, lines } international break popup
  const [setupMsg, setSetupMsg] = useState("");
  const [savedPreview, setSavedPreview] = useState(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const st = JSON.parse(raw);
      if (!st || !st.name || !st.attributes || typeof st.attributes !== "object" || !Object.keys(st.attributes).length) return null;
      return st;
    } catch (e) {
      return null;
    }
  });
  const fanColor = fanApproval >= 60 ? "#7BC67E" : fanApproval >= 25 ? "var(--floodlight)" : "var(--warn)";
  const fanStatus =
    fanApproval >= 70 ? "Loved by the fans" :
    fanApproval >= 45 ? "Fans are behind you" :
    fanApproval >= 25 ? "Fans are losing patience" : "Fan unrest — concentration strain";

  const overall = useMemo(() => (position ? overallOf(attributes, position) : 0), [attributes, position]);
  const benched = managerTrust < 25;
  const trustColor = managerTrust >= 60 ? "#7BC67E" : managerTrust >= 25 ? "var(--floodlight)" : "var(--warn)";
  // International tournament calendar: breaks only land in World Cup / continental years.
  const onIntlBreak = !!club && !seasonComplete && isTournamentYear(currentYear) && TOURNAMENT_BREAK_GWS.includes(matchday);
  const myTournament = club && !seasonComplete ? tournamentFor(currentYear, nation) : null;
  const intlCalledUp = onIntlBreak && !injury && !!myTournament && overall >= 72;
  const marketValue = useMemo(() => {
    if (!position) return 0;
    const base = computeMarketValue(attributes, position, career, age, selectedPlaystyles, club);
    const boosted = base * (purchasedLuxuries.includes("PR_AGENT") ? 1.2 : 1) * mvSpike;
    return Math.round(boosted / 50000) * 50000; // re-round so the PR Agent / value spikes keep clean €50k steps
  }, [attributes, position, career, age, selectedPlaystyles, purchasedLuxuries, club, mvSpike]);

  const hasTrainer = purchasedLuxuries.includes("PERSONAL_TRAINER");
  function attrCostAt(v) {
    return Math.max(1, costAt(v) - (hasTrainer ? 1 : 0));
  }
  function attrCostForSteps(start, n) {
    let t = 0;
    for (let i = 0; i < n; i++) t += attrCostAt(start + i);
    return t;
  }
  const fitColor = fitness >= 60 ? "#7BC67E" : fitness >= 30 ? "var(--floodlight)" : "var(--warn)";
  const contractEndSeason = contract ? contract.signedSeason + contract.years - 1 : null;
  const seasonsLeft = contract ? Math.max(0, contractEndSeason - seasonNumber + 1) : 0;
  const attrCategories = position ? categoriesFor(position) : OUTFIELD_CATEGORIES;
  const currentCategory = attrCategories.find((c) => c.key === activeAttrCategory) || attrCategories[0];

  function startSetup() {
    if (!name.trim() || !nation || !position) return;
    setActiveAttrCategory(position === "GK" ? "GOALKEEPING" : "PACE");
    setAcademyOptions(shuffledPool().slice(0, 5));
    setPhase("academy");
  }

  function chooseAcademy(team) {
    setSelectedAcademy(team);
    setContractMessage("");
    setPhase("contract");
  }

  function attemptContract(team, isTrial) {
    const chance = TIER_CHANCE[team.tier];
    const success = Math.random() < chance;
    if (success) {
      const currentOverall = Object.keys(attributes).length ? overallOf(attributes, position) : 50;
      const w = computeWage(currentOverall, team.tier);
      setAttributes((prev) => (Object.keys(prev).length ? prev : baseAttributes(position)));
      applyContract(team, { years: 3, weekly: w.weekly, bonus: w.bonus });
    } else {
      setContractMessage(
        isTrial
          ? `${team.name} passed as well. Here are three more clubs willing to take a look.`
          : `${team.name} didn't offer you a professional contract. Here are some clubs willing to give you a trial.`
      );
      setTrialOptions(shuffledPool().filter((t) => t.tier !== "BIG").slice(0, 3));
      setPhase("trial");
    }
  }

  // Sign for a club: opts = { years, weekly, bonus }
  function applyContract(team, opts) {
    setClub(team);
    setWageWeekly(opts.weekly);
    setSigningBonus(opts.bonus || 0);
    setContract({ years: opts.years, signedSeason: seasonNumber });
    setFreeAgentNow(false);
    setTransferNote("");
    setWageMessage("");
    if (opts.bonus) setNetWorth((w) => w + opts.bonus);
    setPhase("signed");
  }

  function continueFromSigned() {
    setPhase("hub");
    rollFixtureFor(matchday);
    setLeagueTable((prev) => (prev && prev.length ? prev : emptyLeagueTable()));
  }

  // --- League table + fixture helpers -------------------------------------
  function emptyLeagueTable() {
    if (!club) return [];
    return leagueClubNames(club).map((n) => ({ name: n, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 }));
  }

  function rollFixtureFor(md, team) {
    const c = team || club;
    if (!c) {
      setFixturePreview(null);
      return;
    }
    setFixturePreview({ competition: fixtureFor(md != null ? md : matchday, c), opponent: pickOpponent(c) });
  }

  function chooseCurrency(key) {
    const k = CURRENCIES.some((c) => c.key === key) ? key : "USD";
    activeCurrency = k;
    setCurrency(k);
  }

  // Applies a finished league result (and simulates everyone else's fixture)
  // and returns the freshly sorted table, or null when there's no league table.
  function advanceTable(myScore, oppScore) {
    if (!club) return null;
    const lgClubs = leagueClubNames(club);
    if (lgClubs.length < 2) return null;
    const rows = [...(leagueTable.length ? leagueTable : emptyLeagueTable())];
    const map = {};
    rows.forEach((r) => (map[r.name] = r));
    const apply = (name, gf, ga) => {
      const r = map[name];
      if (!r) return;
      r.played += 1;
      r.gf += gf;
      r.ga += ga;
      if (gf > ga) {
        r.won += 1;
        r.pts += 3;
      } else if (gf === ga) {
        r.drawn += 1;
        r.pts += 1;
      } else {
        r.lost += 1;
      }
    };
    apply(club.name, myScore, oppScore);
    const shuffled = shuffleArr(lgClubs.filter((n) => n !== club.name));
    for (let i = 0; i + 1 < shuffled.length; i += 2) {
      const a = shuffled[i];
      const b = shuffled[i + 1];
      const bal = matchBalance(teamStarsFor(a), teamStarsFor(b), difficulty);
      const ga = goalRoll(bal.teamChance);
      const gb = goalRoll(bal.oppChance);
      apply(a, ga, gb);
      apply(b, gb, ga);
    }
    return rows.sort(sortStandings);
  }

  // --- Save / load ---------------------------------------------------------
  function buildSave() {
    return {
      v: 2,
      phase: phase === "transfer" ? "transfer" : "hub",
      name, nation, position, club, contract, wageWeekly, signingBonus, netWorth,
      attributes, bankedPoints, allocDrafts, selectedPlaystyles, matchesPlayed, age,
      career, matchLog, seasonNumber, matchday, seasonMatches, seasonHistory,
      transferOffers, freeAgentNow, transferNote, wageRequestSeason, seasonComplete,
      fitness, injury, purchasedLuxuries, fanApproval, fanFeed, lastSeasonRecap,
      difficulty, currency, resultsLimit, fixturePreview, leagueTable,
      managerTrust, currentYear, intlStats, intlHonours, mvSpike,
    };
  }

  // Restores a whole career snapshot. Returns an error message, or null on success.
  function loadSaveData(data) {
    const s = data && data.state ? data.state : data;
    if (!s || typeof s !== "object" || !s.name || !s.position || !s.attributes || typeof s.attributes !== "object" || !Object.keys(s.attributes).length) {
      return "That doesn't look like a career save file — the data is missing player details.";
    }
    setPhase(s.phase === "transfer" ? "transfer" : "hub");
    setName(s.name || "");
    setNation(s.nation || "");
    setPosition(s.position || "");
    setClub(s.club || null);
    setContract(s.contract || null);
    setWageWeekly(s.wageWeekly || 0);
    setSigningBonus(s.signingBonus || 0);
    setNetWorth(s.netWorth || 0);
    setAttributes(s.attributes);
    setBankedPoints(s.bankedPoints || 0);
    setAllocDrafts(s.allocDrafts || {});
    setSelectedPlaystyles(Array.isArray(s.selectedPlaystyles) ? s.selectedPlaystyles : []);
    setMatchesPlayed(s.matchesPlayed || 0);
    setAge(s.age || 16);
    setCareer(s.career || { goals: 0, assists: 0, ownGoals: 0, reds: 0 });
    setMatchLog(Array.isArray(s.matchLog) ? s.matchLog : []);
    setSeasonNumber(s.seasonNumber || 1);
    setMatchday(s.matchday || 1);
    setSeasonMatches(Array.isArray(s.seasonMatches) ? s.seasonMatches : []);
    setSeasonHistory(Array.isArray(s.seasonHistory) ? s.seasonHistory : []);
    setTransferOffers(Array.isArray(s.transferOffers) ? s.transferOffers : []);
    setFreeAgentNow(!!s.freeAgentNow);
    setTransferNote(s.transferNote || "");
    setWageRequestSeason(s.wageRequestSeason || 0);
    setSeasonComplete(!!s.seasonComplete);
    setFitness(typeof s.fitness === "number" ? s.fitness : 100);
    setInjury(s.injury || null);
    setPurchasedLuxuries(Array.isArray(s.purchasedLuxuries) ? s.purchasedLuxuries : []);
    setFanApproval(typeof s.fanApproval === "number" ? s.fanApproval : 50);
    setFanFeed(Array.isArray(s.fanFeed) ? s.fanFeed : []);
    setLastSeasonRecap(s.lastSeasonRecap || null);
    setDifficulty(DIFFICULTIES.some((d) => d.key === s.difficulty) ? s.difficulty : "normal");
    chooseCurrency(s.currency || "USD");
    setManagerTrust(typeof s.managerTrust === "number" ? Math.max(0, Math.min(100, s.managerTrust)) : 60);
    setCurrentYear(typeof s.currentYear === "number" ? s.currentYear : 2026);
    setIntlStats(s.intlStats && typeof s.intlStats === "object" ? { apps: s.intlStats.apps || 0, goals: s.intlStats.goals || 0 } : { apps: 0, goals: 0 });
    setIntlHonours(Array.isArray(s.intlHonours) ? s.intlHonours : []);
    setMvSpike(typeof s.mvSpike === "number" ? s.mvSpike : 1);
    const lim = typeof s.resultsLimit === "number" ? s.resultsLimit : 5;
    setResultsLimit(Math.max(1, Math.min(10, Math.round(lim))));
    setLeagueTable(
      Array.isArray(s.leagueTable) && s.leagueTable.length
        ? s.leagueTable
        : s.club
          ? leagueClubNames(s.club).map((n) => ({ name: n, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 }))
          : []
    );
    const fxClub = s.club || null;
    const fxMd = s.matchday || 1;
    const fxOk = s.fixturePreview && typeof s.fixturePreview === "object" && s.fixturePreview.opponent && s.fixturePreview.competition;
    setFixturePreview(
      fxOk ? s.fixturePreview : fxClub ? { competition: fixtureFor(fxMd, fxClub), opponent: pickOpponent(fxClub) } : null
    );
    // reset transient screens
    setShowSeasonView(false);
    setShowCareerView(false);
    setShowSeasonEndPopup(false);
    setShowShop(false);
    setShopMessage("");
    setInjuryNotice(null);
    setPressQ(null);
    setIntlNotice(null);
    setPendingSituation(null);
    setSelectedAcademy(null);
    setActiveAttrCategory(position === "GK" ? "GOALKEEPING" : "PACE");
    return null;
  }

  function downloadSave() {
    const payload = JSON.stringify(buildSave(), null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `career-${(name || "player").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-s${seasonNumber}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handleUploadFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const msg = loadSaveData(data);
        if (msg) {
          setSetupMsg(msg);
        } else {
          setSetupMsg("");
          setSavedPreview(null);
        }
      } catch (err) {
        setSetupMsg("That file couldn't be read — it needs to be a .json career save.");
      }
    };
    reader.readAsText(file);
  }

  // Auto-save to this browser after every meaningful change (match, purchase, etc).
  useEffect(() => {
    if (!club || phase === "setup" || phase === "academy" || phase === "contract" || phase === "trial" || phase === "signed") return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(buildSave()));
    } catch (e) {
      /* storage full or blocked — ignore */
    }
  });

  // New suitors, with club size weighted by your market value.
  function generateExternalOffers(count) {
    const currentOverall = overallOf(attributes, position);
    const offers = [];
    const seen = new Set(club ? [club.name] : []);
    const jetBoost = purchasedLuxuries.includes("PRIVATE_JET");
    while (offers.length < count) {
      let tier = tierForValue(marketValue);
      if (jetBoost && tier !== "BIG" && Math.random() < 0.35) tier = "BIG";
      const arr = tier === "BIG" ? TEAMS_BIG : tier === "MEDIUM" ? TEAMS_MEDIUM : TEAMS_SMALL;
      const name = arr[Math.floor(Math.random() * arr.length)];
      if (seen.has(name)) continue;
      seen.add(name);
      const w = computeWage(currentOverall, tier);
      offers.push({ name, tier, isStay: false, weekly: w.weekly, bonus: w.bonus, years: clubYears(tier) });
    }
    return offers;
  }

  function generateTransferOffers(expired) {
    const offers = generateExternalOffers(2);
    if (!expired && club) {
      const bump = 1.1 + Math.min(0.25, (marketValue / 1e6) * 0.004);
      const stayWeekly = Math.round((computeWage(overallOf(attributes, position), club.tier).weekly * bump) / 50) * 50;
      offers.push({ name: club.name, tier: club.tier, isStay: true, weekly: stayWeekly, bonus: 0, years: clubYears(club.tier) });
    }
    for (let i = offers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [offers[i], offers[j]] = [offers[j], offers[i]];
    }
    return offers;
  }

  function waitForMoreOffers() {
    setTransferOffers(generateExternalOffers(3));
    setTransferNote("Still unsigned — three more clubs have now come forward.");
  }

  // Ask the board for a pay rise (once per season).
  function requestRaise() {
    if (!club || wageRequestSeason === seasonNumber || seasonComplete) return;
    const asked = Math.max(wageWeekly + 250, Math.round((wageWeekly * 1.3) / 50) * 50);
    const ceiling = computeWage(Math.min(99, overall + 10), club.tier).weekly;
    const recent = lastSeasonRecap;
    const perfBonus = recent ? recent.goals * 0.045 + recent.assists * 0.025 : 0;
    const valueBonus = Math.min(0.3, (marketValue / 1e6) * 0.012);
    const want = Math.min(0.95, Math.max(0.1, 0.28 + (overall - 58) * 0.02 + perfBonus + valueBonus));
    const wantFinal = Math.min(0.95, want * (purchasedLuxuries.includes("LUXURY_MANSION") ? 1.15 : 1) * (purchasedLuxuries.includes("PR_FIRM") ? 1.2 : 1));
    const accepted = asked <= ceiling * 1.35 && Math.random() < wantFinal;
    setWageRequestSeason(seasonNumber);
    if (accepted) {
      setWageWeekly(asked);
      setWageMessage(`${club.name} agreed — new wage ${formatMoney(asked)}/week.`);
    } else {
      setWageMessage(`${club.name} turned down the request for ${formatMoney(asked)}/week. Keep performing and try again next season.`);
    }
  }

  function adjustAttribute(key, delta) {
    setAttributes((prev) => {
      const current = prev[key];
      if (delta > 0) {
        if (current >= 99) return prev;
        const cost = attrCostAt(current);
        if (bankedPoints < cost) return prev;
        setBankedPoints((b) => b - cost);
        return { ...prev, [key]: current + 1 };
      } else {
        if (current <= 1) return prev;
        const refund = attrCostAt(current - 1);
        setBankedPoints((b) => b + refund);
        return { ...prev, [key]: current - 1 };
      }
    });
  }

  function canCommitAlloc(key) {
    const amt = parseInt(allocDrafts[key], 10);
    if (!amt || amt <= 0) return false;
    if (attributes[key] + amt > 99) return false;
    const cost = attrCostForSteps(attributes[key], amt);
    if (cost > bankedPoints) return false;
    return true;
  }

  function commitAlloc(key) {
    if (!canCommitAlloc(key)) return;
    const amt = parseInt(allocDrafts[key], 10);
    const cost = attrCostForSteps(attributes[key], amt);
    setAttributes((prev) => ({ ...prev, [key]: prev[key] + amt }));
    setBankedPoints((b) => b - cost);
    setAllocDrafts((prev) => ({ ...prev, [key]: "" }));
  }

  function canTogglePlaystyle(key) {
    const def = PLAYSTYLE_BY_KEY[key];
    const already = selectedPlaystyles.includes(key);
    if (already) return true;
    if (def.category === "GOALKEEPING" && position !== "GK") return false;
    if (bankedPoints < PLAYSTYLE_COST) return false;
    if (def.category !== "GOALKEEPING" && countInCategory(selectedPlaystyles, def.category) >= 3) return false;
    return true;
  }

  function togglePlaystyle(key) {
    if (!canTogglePlaystyle(key)) return;
    const already = selectedPlaystyles.includes(key);
    if (already) {
      setSelectedPlaystyles((prev) => prev.filter((k) => k !== key));
      setBankedPoints((b) => b + PLAYSTYLE_COST);
    } else {
      setSelectedPlaystyles((prev) => [...prev, key]);
      setBankedPoints((b) => b - PLAYSTYLE_COST);
    }
  }

  function startMatch() {
    if (!club || seasonComplete) return;
    const remaining = SEASON_LENGTH - matchday + 1;
    if (remaining <= 0) return;
    const template = generateSituation(position, lastSituationKey);
    const options = template.options.map((o) => ({
      ...o,
      chance: computeOptionChance(o, attributes, selectedPlaystyles, { luxuries: purchasedLuxuries, fanApproval }),
    }));
    setIntlNotice(null);
    setLastSituationKey(template.key);
    setPendingSituation({ ...template, options });
  }

  function resolveSituation(optionKey) {
    if (!pendingSituation || !club) return;
    const opt = pendingSituation.options.find((o) => o.key === optionKey);
    const success = Math.random() < opt.chance;
    const res = simulateMatch(attributes, position, selectedPlaystyles, difficulty);

    let goals = res.goals;
    let assists = res.assists;
    if (opt.resultType === "goal" && success) goals += 1;
    if (opt.resultType === "assist" && success) assists += 1;

    const competition = (fixturePreview && fixturePreview.competition) || fixtureFor(matchday, club);
    const opponent = (fixturePreview && fixturePreview.opponent) || pickOpponent(club);
    // Star gap + difficulty decide the balance: a 2.5-star side rarely beats a 4.5-star one.
    const bal = matchBalance(ratingFor(club), teamStarsFor(opponent), difficulty);
    const teammateGoals = goalRoll(bal.teamChance);
    let opponentGoals = goalRoll(Math.max(0.03, Math.min(0.34, bal.oppChance - res.oppReduction))) + res.ownGoal;
    if ((opt.resultType === "save" || opt.resultType === "defence") && success) {
      opponentGoals = Math.max(0, opponentGoals - 1);
    } else if ((opt.resultType === "save" || opt.resultType === "defence") && Math.random() < 0.6) {
      // You were beaten, but your side can still scramble it clear — no guaranteed concession.
      opponentGoals += 1;
    }
    const teamScore = goals + teammateGoals;
    const points = 3 + goals * 5 + assists * 3 - res.ownGoal * 1 - res.red * 1;
    const result = teamScore > opponentGoals ? "W" : teamScore < opponentGoals ? "L" : "D";
    const careerGoalsAfter = career.goals + goals;
    const cleanSheet = opponentGoals === 0;
    const rating = computeMatchRating({ position, goals, assists, cleanSheet, ownGoal: res.ownGoal, red: res.red, choice: success ? "success" : "fail" });

    const entry = {
      goals, assists, ownGoal: res.ownGoal, red: res.red, points,
      opponent, teamScore, opponentScore: opponentGoals, result,
      careerGoalsAfter, matchday, competition,
      cleanSheet, rating,
      situation: { label: opt.label, resultType: opt.resultType, success, chancePct: Math.round(opt.chance * 100) },
    };

    setPendingSituation(null);
    finalizeMatch(entry);
  }

  // Wrap up the season: recap, history, wages, and the end-of-season flag.
  function completeSeason(fullSeasonMatches, tableSnapshot) {
    const seasonGoals = fullSeasonMatches.reduce((s, m) => s + m.goals, 0);
    const seasonAssists = fullSeasonMatches.reduce((s, m) => s + m.assists, 0);
    const currentOverall = overallOf(attributes, position);
    const { trophies, individualAwards } = computeSeasonOutcome(club, seasonGoals, seasonAssists, currentOverall);
    const wageEarned = wageWeekly * 52;
    const contractEnded = !!contract && seasonNumber >= contract.signedSeason + contract.years - 1;
    const srcRows = tableSnapshot && tableSnapshot.length ? tableSnapshot : leagueTable;
    const finalTable = srcRows.length ? [...srcRows].sort(sortStandings) : null;
    const champion = finalTable && finalTable.length ? finalTable[0].name : null;
    const recap = {
      season: seasonNumber, club: club.name, leagueName: league, appearances: fullSeasonMatches.length,
      goals: seasonGoals, assists: seasonAssists, trophies, individualAwards, wageEarned, contractEnded,
      champion, finalTable,
    };
    setSeasonHistory((h) => [...h, recap]);
    setLastSeasonRecap(recap);
    setNetWorth((w) => w + wageEarned);
    setMatchday(SEASON_LENGTH);
    setSeasonComplete(true);
  }

  function finalizeMatch(entry) {
    // Continental nights bank double SP (Champions/Europa/Conference League).
    const isContinental = CONTINENTAL_COMPETITIONS.includes(entry.competition);
    const banked = isContinental ? entry.points * 2 : entry.points;
    const stored = { ...entry, points: banked, continentalBonus: isContinental };
    const isIntl = INTl_COMPETITIONS.includes(entry.competition);
    const trophyWon = isIntl && entry.matchday === 32 && entry.result === "W";
    setBankedPoints((b) => b + banked);
    setMatchesPlayed((m) => m + 1);
    setCareer((c) => ({ goals: c.goals + entry.goals, assists: c.assists + entry.assists, ownGoals: c.ownGoals + entry.ownGoal, reds: c.reds + entry.red }));
    setMatchLog((log) => [stored, ...log].slice(0, 10));
    const fullSeasonMatches = [...seasonMatches, stored];
    setSeasonMatches(fullSeasonMatches);

    // League fixtures update the table: your result plus everyone else's game.
    const isLeagueMatch = club && entry.competition === (TEAM_LEAGUE[club.name] || "League");
    const newTable = isLeagueMatch ? advanceTable(entry.teamScore, entry.opponentScore) : null;
    if (newTable) setLeagueTable(newTable);

    // Fan sentiment follows the match rating alone (a red card always stings on top).
    const fanTone = stored.red > 0 ? "negative" : stored.rating < 6 ? "negative" : stored.rating > 7 ? "positive" : "neutral";
    if (fanTone === "positive") {
      setFanApproval((a) => Math.min(100, a + 8));
      setFanFeed((f) => [{ tone: "positive", ...fanComment(FAN_POSITIVE, stored, name) }, ...f].slice(0, 8));
    } else if (fanTone === "negative") {
      setFanApproval((a) => Math.max(0, a - 10));
      setFanFeed((f) => [{ tone: "negative", ...fanComment(FAN_NEGATIVE, stored, name) }, ...f].slice(0, 8));
    } else {
      setFanFeed((f) => [{ tone: "neutral", ...fanComment(FAN_NEUTRAL, stored, name) }, ...f].slice(0, 8));
    }

    // Fitness drains 8-15% per match; Relentless players lose 4% less.
    const drain = 8 + Math.random() * 7 - (selectedPlaystyles.includes("RELENTLESS") ? 4 : 0);
    const newFit = Math.max(0, fitness - drain);
    setFitness(newFit);

    // Below 60% fitness, there's a real chance of picking up an injury.
    let rolledInjury = null;
    if (fitness < 60) {
      const risk = Math.min(0.35, 0.08 + (60 - fitness) * 0.005);
      if (Math.random() < risk) {
        const label = INJURIES[Math.floor(Math.random() * INJURIES.length)];
        const weeksLeft = 3 + Math.floor(Math.random() * 4); // 3-6 gameweeks out
        rolledInjury = { label, weeksLeft };
        setInjury(rolledInjury);
        setFitness(20);
      }
    }

    const nextMd = entry.matchday + 1;
    if (nextMd > SEASON_LENGTH) {
      completeSeason(fullSeasonMatches, newTable);
      if (!rolledInjury) setShowSeasonEndPopup(true);
    } else {
      setMatchday(nextMd);
      rollFixtureFor(nextMd);
      arriveAtBreak(nextMd);
    }

    // International caps, goals and honours (a GW32 win lifts the trophy).
    if (isIntl) {
      setIntlStats((s) => ({ apps: s.apps + 1, goals: s.goals + entry.goals }));
      if (trophyWon) {
        const trophyName = (myTournament && myTournament.trophy) || entry.competition;
        setIntlHonours((h) => (h.some((x) => x.name === trophyName && x.season === seasonNumber) ? h : [...h, { name: trophyName, year: currentYear, season: seasonNumber }]));
        setIntlNotice({
          title: "International triumph",
          lines: [`${name} helped ${nation} win the ${trophyName}!`, "The trophy joins your career cabinet — a career-defining honour."],
        });
      }
    }

    if (rolledInjury) {
      setInjuryNotice({
        title: "Injury blow",
        lines: [
          `Pushing through on a tired body caught up with you — you suffered a ${rolledInjury.label} during the match.`,
          `Fitness has dropped to 20% and you're ruled out for ${rolledInjury.weeksLeft} gameweek${rolledInjury.weeksLeft === 1 ? "" : "s"}. You can only rest and rehab until it clears.`,
        ],
      });
    }

    // Post-match press conferences follow headline games: a goal, a red card, or a sub-5.5 display.
    if (entry.goals > 0 || entry.red > 0 || entry.rating < 5.5) {
      const heading = entry.red > 0 ? "Red-card fallout" : entry.goals > 0 ? "Match-winner in the room" : "Post-match inquisition";
      const question =
        entry.red > 0
          ? `After that red card against ${entry.opponent}, the reporters crowd around: "Reckless challenge — any regrets?"`
          : entry.goals > 0
            ? `You found the net against ${entry.opponent} in the ${entry.competition}. A reporter asks: "Big moment tonight — who deserves the credit?"`
            : `It was a quiet ${entry.competition} display against ${entry.opponent}. A reporter asks: "What went wrong out there?"`;
      setPressQ({ heading, question, ack: null });
    }
  }

  // Skip a gameweek: +35% fitness, 0 SP, and never any injury risk.
  function restMatch() {
    if (!club || seasonComplete) return;
    const recoveredTo = Math.min(100, fitness + 35);
    setFitness(recoveredTo);
    const nextMd = matchday + 1;
    let recoveryNotice = null;
    if (injury) {
      const left = injury.weeksLeft - 1;
      if (left <= 0) {
        setInjury(null);
        recoveryNotice = {
          title: "Fully recovered",
          lines: [`Your ${injury.label} has healed after ${injury.weeksLeft} gameweek${injury.weeksLeft === 1 ? "" : "s"} on the sidelines — you're cleared to play again.`],
        };
      } else {
        setInjury({ ...injury, weeksLeft: left });
      }
    }
    if (nextMd > SEASON_LENGTH) {
      completeSeason(seasonMatches, null);
      if (!recoveryNotice) setShowSeasonEndPopup(true);
    } else {
      setMatchday(nextMd);
      rollFixtureFor(nextMd);
      arriveAtBreak(nextMd);
    }
    if (recoveryNotice) setInjuryNotice(recoveryNotice);
  }

  // Called whenever a gameweek advances INTO an international tournament break week.
  function arriveAtBreak(md) {
    if (!club || md > SEASON_LENGTH || !isTournamentYear(currentYear) || !TOURNAMENT_BREAK_GWS.includes(md)) return;
    if (injury) {
      setIntlNotice({
        title: "International break",
        lines: ["International break — you were not selected for the tournament squad.", `You're still sidelined with a ${injury.label.toLowerCase()}, so the national team left you at home. Keep rehabbing to get back in the picture.`],
      });
      return;
    }
    const t = tournamentFor(currentYear, nation);
    if (!t) {
      setIntlNotice({
        title: "International break",
        lines: ["International break — you were not selected for the tournament squad.", `${nation} isn't part of this year's tournament. Train this week instead (+15% fitness, +2 SP).`],
      });
      return;
    }
    if (overall >= 72) {
      const opp = pickNationOpponent(t, nation);
      setFixturePreview({ competition: t.comp, opponent: opp });
      setIntlNotice({
        title: "International call-up",
        lines: [`Called up to represent ${nation} in the ${t.comp}!`, `You face ${opp} this gameweek${md === 32 ? " — win it and the trophy is yours" : ""}.`],
      });
    } else {
      setIntlNotice({
        title: "International break",
        lines: ["International break — you were not selected for the tournament squad.", "The national coaches want more from you. Train this week instead (+15% fitness, +2 SP)."],
      });
    }
  }

  // International break week when you weren't called up: forced training (+15% fitness, +2 SP).
  function intlTrainingWeek() {
    if (!club || seasonComplete || !onIntlBreak) return;
    setFitness((f) => Math.min(100, f + 15));
    setBankedPoints((b) => b + 2);
    setIntlNotice(null);
    const nextMd = matchday + 1;
    if (nextMd > SEASON_LENGTH) {
      completeSeason(seasonMatches, null);
      setShowSeasonEndPopup(true);
    } else {
      setMatchday(nextMd);
      rollFixtureFor(nextMd);
      arriveAtBreak(nextMd);
    }
  }

  // Benched players work hard instead of playing: +4 SP, +10% manager trust, −15% fitness.
  function workHard() {
    if (!club || seasonComplete) return;
    setFitness((f) => Math.max(5, f - 15));
    setBankedPoints((b) => b + 4);
    setManagerTrust((t) => Math.min(100, Math.max(0, t + 10)));
    setIntlNotice(null);
    const nextMd = matchday + 1;
    if (nextMd > SEASON_LENGTH) {
      completeSeason(seasonMatches, null);
      setShowSeasonEndPopup(true);
    } else {
      setMatchday(nextMd);
      rollFixtureFor(nextMd);
      arriveAtBreak(nextMd);
    }
  }

  function answerPress(key) {
    const o = PRESS_OPTIONS.find((p) => p.key === key);
    if (!o || !pressQ) return;
    setManagerTrust((t) => Math.min(100, Math.max(0, t + o.trust)));
    setFanApproval((a) => Math.min(100, Math.max(0, a + o.fan)));
    if (o.mv !== 1) setMvSpike((m) => Math.max(m, o.mv));
    setPressQ({ ...pressQ, ack: o.ack });
  }

  function buyLuxury(key) {
    const item = LUXURY_ITEMS.find((i) => i.key === key);
    if (!item || purchasedLuxuries.includes(key) || netWorth < item.price) return;
    setNetWorth((w) => w - item.price);
    setPurchasedLuxuries((p) => [...p, key]);
    setShopMessage(`${item.name} purchased — ${item.note}`);
  }

  function startNextSeason() {
    const finishedSeason = seasonNumber;
    const expired = !!contract && finishedSeason >= contract.signedSeason + contract.years - 1;
    setAge((a) => a + 1);
    setSeasonNumber((s) => s + 1);
    setCurrentYear((y) => y + 1); // calendar year advances — tournament years (2026/2028/2030…) come and go
    setMatchday(1);
    setSeasonMatches([]);
    setSeasonComplete(false);
    setShowSeasonEndPopup(false);
    setFreeAgentNow(expired);
    setLeagueTable([]); // new season, new table
    setMvSpike(1); // an arrogant-answer value spike lasts only until the next season
    setIntlNotice(null);
    // Football academy dividend: +500 banked SP at the start of every season.
    const academyOwned = purchasedLuxuries.includes("FOOTBALL_ACADEMY");
    setTransferNote(academyOwned ? "Your football academy paid its dividend: +500 SP banked." : "");
    if (academyOwned) setBankedPoints((b) => b + 500);
    setTransferOffers(generateTransferOffers(expired));
    setPhase("transfer");
  }

  const league = club ? (TEAM_LEAGUE[club.name] || "League") : "";
  const continental = club ? CONTINENTAL_BY_TIER[club.tier] : "";
  const cupName = club ? (CUP_NAME_BY_LEAGUE[league] || "Domestic Cup") : "";
  const difficultyLabel = (DIFFICULTIES.find((d) => d.key === difficulty) || DIFFICULTIES[1]).label;
  const nextFixture = (fixturePreview && fixturePreview.competition) || (club ? fixtureFor(matchday, club) : "");
  const previewOpponent = club && fixturePreview && fixturePreview.opponent ? fixturePreview.opponent : null;
  const previewOdds = (() => {
    if (!club || !previewOpponent) return null;
    const bal = matchBalance(ratingFor(club), teamStarsFor(previewOpponent), difficulty);
    return predictOdds(bal.teamChance, bal.oppChance);
  })();
  const sortedTable = [...leagueTable].sort(sortStandings);
  const leagueHasTable = !!club && leagueClubNames(club).length >= 2;
  // Top 10 standings, but always keep the player's own club visible (pinned below the cut)
  // so it stays highlighted even when the side is outside the top 10.
  const myTableIdx = sortedTable.findIndex((r) => r.name === club.name);
  const tableRows = sortedTable.slice(0, 10).map((r, i) => ({ r, rank: i + 1, pinned: false }));
  if (myTableIdx >= 10) tableRows.push({ r: sortedTable[myTableIdx], rank: myTableIdx + 1, pinned: true });
  const careerTrophyCount = seasonHistory.reduce((s, h) => s + h.trophies.length, 0) + intlHonours.length;

  return (
    <div className="root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Work+Sans:wght@400;500;600&display=swap');
        .root {
          --pitch-dark:#0D1B14; --pitch-mid:#152B1E; --turf:#1B4332; --chalk:#F2F0E9;
          --floodlight:#E8A33D; --warn:#C1443B; --muted:#7C9184;
          background:var(--pitch-dark); color:var(--chalk); min-height:100vh;
          font-family:'Work Sans',sans-serif; padding:32px 20px;
        }
        .root * { box-sizing:border-box; }
        .root button { color:inherit; }
        .wrap { max-width:660px; margin:0 auto; }
        .disp { font-family:'Oswald',sans-serif; }
        .eyebrow { font-family:'Oswald',sans-serif; color:var(--floodlight); font-size:13px; letter-spacing:0.06em; margin-bottom:6px; text-transform:uppercase; }
        .h1 { font-size:32px; font-weight:600; margin:0 0 4px; }
        .h2 { font-size:19px; font-weight:600; margin:0 0 12px; }
        .lead { color:var(--muted); font-size:15px; margin-bottom:20px; line-height:1.5; }
        .panel { background:var(--pitch-mid); border:1px solid rgba(124,145,132,0.35); border-radius:3px; padding:20px; margin-bottom:16px; }
        .field { margin-bottom:14px; }
        .label { display:block; font-size:13px; color:var(--muted); margin-bottom:6px; }
        input, select { width:100%; background:var(--pitch-dark); border:1px solid rgba(124,145,132,0.5); color:var(--chalk); padding:10px 12px; border-radius:2px; font-family:'Work Sans',sans-serif; font-size:15px; }
        input:focus, select:focus { outline:2px solid var(--floodlight); outline-offset:1px; }
        .btn { font-family:'Oswald',sans-serif; letter-spacing:0.02em; background:var(--floodlight); color:#1A1103; border:none; padding:12px 22px; border-radius:2px; font-size:15px; font-weight:600; cursor:pointer; }
        .btn:disabled { opacity:0.4; cursor:not-allowed; }
        .btn-ghost { background:transparent; border:1px solid var(--muted); color:var(--chalk); }
        .team-card { background:var(--pitch-dark); border:1px solid rgba(124,145,132,0.4); padding:14px; border-radius:2px; cursor:pointer; text-align:left; width:100%; }
        .team-card:hover { border-color:var(--floodlight); }
        .team-name { font-family:'Oswald',sans-serif; font-size:17px; }
        .team-tier { font-size:12px; color:var(--muted); margin-top:2px; }
        .team-wage { font-size:13px; color:var(--floodlight); margin-top:4px; }
        .stars-line { display:flex; align-items:center; gap:8px; margin-top:5px; }
        .comps-line { font-size:12px; color:var(--muted); margin-top:5px; line-height:1.45; }
        .row { display:flex; justify-content:space-between; align-items:center; padding:9px 0; border-bottom:1px solid rgba(124,145,132,0.2); gap:10px; flex-wrap:wrap; }
        .row:last-child { border-bottom:none; }
        .row-label { flex:1; min-width:110px; }
        .stepper { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
        .stepper button { background:var(--pitch-dark); border:1px solid var(--muted); color:var(--chalk); width:26px; height:26px; border-radius:2px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
        .stepper button:disabled { opacity:0.3; cursor:not-allowed; }
        .stat-val { font-size:17px; width:26px; text-align:center; }
        .alloc-input { width:44px; padding:4px 6px; font-size:13px; text-align:center; }
        .alloc-add { font-family:'Oswald',sans-serif; font-size:12px; padding:5px 9px; border:1px solid var(--floodlight); background:transparent; color:var(--floodlight); border-radius:2px; cursor:pointer; }
        .alloc-add:disabled { opacity:0.3; cursor:not-allowed; border-color:var(--muted); color:var(--muted); }
        .top-row { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:14px; flex-wrap:wrap; gap:10px; }
        .overall-badge { font-size:40px; color:var(--floodlight); line-height:1; }
        .pill { display:inline-block; font-size:12px; padding:3px 9px; border:1px solid var(--muted); border-radius:20px; color:var(--muted); margin-right:6px; margin-bottom:6px; }
        .pill-accent { border-color:var(--floodlight); color:var(--floodlight); }
        .log-entry { display:flex; justify-content:space-between; font-size:14px; padding:8px 0; border-bottom:1px solid rgba(124,145,132,0.2); }
        .log-entry:last-child { border-bottom:none; }
        .banked { color:var(--floodlight); }
        .quick-stats { display:flex; gap:22px; margin-top:16px; flex-wrap:wrap; }
        .quick-stat-label { font-size:12px; color:var(--muted); }
        .quick-stat-val { font-size:20px; }
        .modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex; align-items:flex-start; justify-content:center; padding:40px 16px; z-index:50; overflow-y:auto; }
        .modal { background:var(--pitch-mid); border:1px solid rgba(124,145,132,0.4); border-radius:4px; padding:22px; max-width:620px; width:100%; }
        .modal-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
        .modal-close { background:transparent; border:none; color:var(--muted); cursor:pointer; }
        .season-table-row { display:grid; grid-template-columns:34px 1fr auto; gap:10px; align-items:center; padding:8px 0; border-bottom:1px solid rgba(124,145,132,0.2); font-size:13px; }
        .season-table-row:last-child { border-bottom:none; }
        .career-season-block { border-bottom:1px solid rgba(124,145,132,0.25); padding:14px 0; }
        .career-season-block:last-child { border-bottom:none; }
        .trophy-line { font-size:13px; color:var(--floodlight); margin-top:4px; display:flex; align-items:center; gap:6px; }
        .award-line { font-size:13px; color:var(--chalk); margin-top:3px; display:flex; align-items:center; gap:6px; }
        .season-complete-box { text-align:center; padding:10px 0; }
        .fitness-bar { height:8px; border-radius:5px; background:rgba(124,145,132,0.22); overflow:hidden; margin-top:4px; }
        .fitness-fill { height:100%; border-radius:5px; transition:width 0.3s ease; }
        .cat-tabs { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:14px; }
        .cat-tab { font-family:'Oswald',sans-serif; font-size:12px; padding:6px 11px; border:1px solid var(--muted); background:transparent; color:var(--chalk); border-radius:2px; cursor:pointer; }
        .cat-tab.active { background:var(--turf); border-color:var(--floodlight); color:var(--floodlight); }
        .cat-tab:disabled { opacity:0.3; cursor:not-allowed; }
        .ps-grid { display:flex; flex-direction:column; gap:8px; }
        .ps-card { display:flex; align-items:center; gap:12px; background:var(--pitch-dark); border:1px solid rgba(124,145,132,0.4); border-radius:2px; padding:10px 12px; }
        .ps-icon-wrap { width:34px; height:34px; border-radius:2px; background:rgba(232,163,61,0.12); display:flex; align-items:center; justify-content:center; color:var(--floodlight); flex-shrink:0; }
        .ps-name { font-family:'Oswald',sans-serif; font-size:15px; }
        .ps-desc { font-size:12px; color:var(--muted); }
        .ps-select { font-family:'Oswald',sans-serif; font-size:12px; padding:7px 12px; border-radius:2px; cursor:pointer; white-space:nowrap; }
        .ps-select.on { background:var(--floodlight); border:1px solid var(--floodlight); color:#1A1103; }
        .ps-select.off { background:transparent; border:1px solid var(--muted); color:var(--chalk); }
        .ps-select:disabled { opacity:0.35; cursor:not-allowed; }
        .playstyle-badges { display:flex; gap:6px; flex-wrap:wrap; margin-top:4px; margin-bottom:6px; }
        .playstyle-badge { width:28px; height:28px; border-radius:3px; background:var(--floodlight); color:#1A1103; display:flex; align-items:center; justify-content:center; cursor:default; }
      `}</style>

      <div className="wrap">
        {phase === "setup" && (
          <>
            {savedPreview && (
              <div className="panel" style={{ borderColor: "rgba(232,163,61,0.55)" }}>
                <div className="eyebrow">Saved career found</div>
                <h2 className="h2 disp" style={{ margin: 0 }}>{savedPreview.name}</h2>
                <p className="lead" style={{ marginBottom: 12, fontSize: 14 }}>
                  {savedPreview.club ? savedPreview.club.name : "Free agent"} · Season {savedPreview.seasonNumber} · Gameweek {savedPreview.matchday} · Age {savedPreview.age}
                  {savedPreview.netWorth ? ` · ${formatMoney(savedPreview.netWorth, savedPreview.currency)} net worth` : ""}
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    className="btn"
                    onClick={() => {
                      const msg = loadSaveData(savedPreview);
                      if (msg) setSetupMsg(msg);
                      else setSavedPreview(null);
                    }}
                  >
                    Resume career
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
                      setSavedPreview(null);
                    }}
                  >
                    Start a new career instead
                  </button>
                </div>
              </div>
            )}
            <div className="eyebrow">Step 1 of 3 — Graduation</div>
            <h1 className="h1 disp">Build your player</h1>
            <p className="lead">You're sixteen, and your academy days are behind you. Before trials begin, tell us who you are.</p>
            <div className="panel">
              <div className="field">
                <label className="label">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jamie Osei" />
              </div>
              <div className="field">
                <label className="label">Nation</label>
                <select value={nation} onChange={(e) => setNation(e.target.value)}>
                  <option value="">Select nation</option>
                  {NATIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Position</label>
                <select value={position} onChange={(e) => setPosition(e.target.value)}>
                  <option value="">Select position</option>
                  {POSITIONS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Currency</label>
                <select value={currency} onChange={(e) => chooseCurrency(e.target.value)}>
                  {CURRENCIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Just the symbol — money values stay the same.</div>
              </div>
              <div className="field">
                <label className="label">Difficulty</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  {DIFFICULTIES.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
                </select>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                  {(DIFFICULTIES.find((d) => d.key === difficulty) || DIFFICULTIES[1]).desc}
                </div>
              </div>
              <button className="btn" disabled={!name.trim() || !nation || !position} onClick={startSetup}>
                Enter the academy pool
              </button>
            </div>
            <div className="panel">
              <div className="h2 disp" style={{ fontSize: 16 }}>Load a saved career</div>
              <p className="lead" style={{ marginBottom: 10, fontSize: 13 }}>
                Upload a save file (the .json you downloaded with "Save career") to pick up exactly where you left off — even on another device.
              </p>
              <label className="btn btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <Upload size={14} /> Choose save file…
                <input type="file" accept=".json,application/json" style={{ display: "none" }} onChange={handleUploadFile} />
              </label>
              {setupMsg && <div style={{ fontSize: 13, color: "var(--warn)", marginTop: 8 }}>{setupMsg}</div>}
            </div>
          </>
        )}

        {phase === "academy" && (
          <>
            <div className="eyebrow">Step 2 of 3 — Graduation</div>
            <h1 className="h1 disp">Choose your academy</h1>
            <p className="lead">Five clubs have room for a graduating sixteen-year-old. Pick where you spent your youth years — it's the club you'll try to sign with first.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {academyOptions.map((team) => (
                <button key={team.name} className="team-card" onClick={() => chooseAcademy(team)}>
                  <div className="team-name disp">{team.name}</div>
                  <div className="team-tier">{TIER_LABEL[team.tier]} · {TEAM_LEAGUE[team.name]}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {phase === "contract" && selectedAcademy && (
          <>
            <div className="eyebrow">Step 3 of 3 — Pro contract</div>
            <h1 className="h1 disp">{selectedAcademy.name}</h1>
            <p className="lead">
              {selectedAcademy.tier === "BIG" && "It's a huge academy — first-team opportunities are scarce, and the club rarely hands a graduate a pro deal on the spot."}
              {selectedAcademy.tier === "MEDIUM" && "A respected academy with a reasonable pathway into the first team."}
              {selectedAcademy.tier === "SMALL" && "A smaller club that leans on its academy — they're often willing to back a young player."}
            </p>
            <div className="panel" style={{ textAlign: "center" }}>
              <button className="btn" onClick={() => attemptContract(selectedAcademy, false)}>Ask for a professional contract</button>
            </div>
          </>
        )}

        {phase === "trial" && (
          <>
            <div className="eyebrow">Trials</div>
            <h1 className="h1 disp">Find a club</h1>
            <p className="lead">{contractMessage}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {trialOptions.map((team) => (
                <button key={team.name} className="team-card" onClick={() => attemptContract(team, true)}>
                  <div className="team-name disp">{team.name}</div>
                  <div className="team-tier">{TIER_LABEL[team.tier]} · {TEAM_LEAGUE[team.name]}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {phase === "signed" && club && (
          <>
            <div className="eyebrow">Contract signed</div>
            <h1 className="h1 disp">{club.name}</h1>
            <p className="lead" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <span style={{ color: "var(--chalk)" }}>{TEAM_LEAGUE[club.name] || "League"}</span>
              <StarRating rating={ratingFor(club)} />
              <span style={{ fontSize: 12, color: "var(--muted)" }}>{ratingFor(club).toFixed(1)} / 5</span>
            </p>
            <div className="panel">
              <div className="row">
                <span className="row-label">Weekly wage</span>
                <span className="disp" style={{ fontSize: 22, color: "var(--floodlight)" }}>{formatMoney(wageWeekly)}</span>
              </div>
              <div className="row">
                <span className="row-label">Contract</span>
                <span className="disp" style={{ fontSize: 18 }}>{contract ? `${contract.years}-year deal` : ""}</span>
              </div>
              {signingBonus > 0 && (
                <div className="row">
                  <span className="row-label">Signing bonus</span>
                  <span className="disp" style={{ fontSize: 22, color: "var(--floodlight)" }}>{formatMoney(signingBonus)}</span>
                </div>
              )}
              <div className="row">
                <span className="row-label">Net worth</span>
                <span className="disp" style={{ fontSize: 18, color: "var(--floodlight)" }}>{formatMoney(netWorth)}</span>
              </div>
            </div>
            <button className="btn" onClick={continueFromSigned}>Continue to career</button>
          </>
        )}

        {phase === "transfer" && (
          <>
            <div className="eyebrow">Season {seasonNumber - 1} complete</div>
            <h1 className="h1 disp">Transfer window</h1>
            <p className="lead">
              {freeAgentNow
                ? `Your contract with ${club?.name} has expired — you're a free agent. These clubs want to sign you.`
                : `Two clubs have come in with offers, and ${club?.name} wants to keep you too.`}
            </p>
            {transferNote && <p className="lead" style={{ color: "var(--floodlight)", marginBottom: 16 }}>{transferNote}</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {transferOffers.map((offer, i) => (
                <button key={offer.name + "-" + i} className="team-card" onClick={() => applyContract(offer, { years: offer.years, weekly: offer.weekly, bonus: offer.bonus })}>
                  <div className="team-name disp">
                    {offer.name}
                    {offer.isStay && <span style={{ color: "var(--floodlight)", fontSize: 13, marginLeft: 8 }}>(renewal)</span>}
                  </div>
                  <div className="team-tier">{TEAM_LEAGUE[offer.name] || "League"}</div>
                  <div className="stars-line">
                    <StarRating rating={ratingFor(offer)} />
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>{ratingFor(offer).toFixed(1)} / 5</span>
                  </div>
                  <div className="comps-line">{competitionList(offer).slice(1).join(" · ")}</div>
                  <div className="team-wage disp">
                    {formatMoney(offer.weekly)}/week{offer.years ? ` · ${offer.years}-year deal` : ""}{offer.bonus > 0 ? ` · ${formatMoney(offer.bonus)} signing bonus` : ""}
                  </div>
                </button>
              ))}
            </div>
            {freeAgentNow && (
              <div style={{ marginTop: 14, textAlign: "center" }}>
                <button className="btn btn-ghost" onClick={waitForMoreOffers}>Wait for more offers</button>
              </div>
            )}
          </>
        )}

        {phase === "hub" && (
          <>
            <div className="top-row">
              <div>
                <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  <span>{club?.name}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <StarRating rating={ratingFor(club)} size={12} />
                    <span style={{ opacity: 0.9 }}>({ratingFor(club).toFixed(1)}/5)</span>
                  </span>
                  <span>·</span>
                  <span>Season {seasonNumber} · Gameweek {matchday} of {SEASON_LENGTH} · {currentYear}</span>
                </div>
                <h1 className="h1 disp">{name}</h1>
                <div>
                  <span className="pill">{POSITIONS.find((p) => p.key === position)?.label}</span>
                  <span className="pill">{nation}</span>
                  <span className="pill">Age {age}</span>
                </div>
                <div>
                  <span className="pill pill-accent">{league}</span>
                  <span className="pill pill-accent">{continental}</span>
                  <span className="pill pill-accent">{cupName}</span>
                  <span className="pill">{difficultyLabel} difficulty</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                  <span className="quick-stat-label" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>Manager trust</span>
                  <span className="disp" style={{ color: trustColor, fontSize: 15 }}>{Math.round(managerTrust)}%</span>
                  <div style={{ width: 90, height: 6, borderRadius: 3, background: "rgba(124,145,132,0.25)", overflow: "hidden" }}>
                    <div style={{ height: "100%", background: trustColor, width: `${Math.max(0, Math.min(100, managerTrust))}%` }} />
                  </div>
                  {benched ? (
                    <span style={{ fontSize: 12, color: "var(--warn)", fontWeight: 600 }}>Benched — work hard to win back the manager</span>
                  ) : managerTrust >= 70 ? (
                    <span style={{ fontSize: 12, color: "#7BC67E" }}>Manager&apos;s favourite</span>
                  ) : managerTrust <= 40 ? (
                    <span style={{ fontSize: 12, color: "var(--floodlight)" }}>Falling out of favour</span>
                  ) : null}
                </div>
                {selectedPlaystyles.length > 0 && (
                  <div className="playstyle-badges">
                    {selectedPlaystyles.map((key) => {
                      const def = PLAYSTYLE_BY_KEY[key];
                      const Icon = def.icon;
                      return (
                        <span key={key} className="playstyle-badge" title={def.name}>
                          <Icon size={15} />
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="overall-badge disp">{overall}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>Overall</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
              <button className="btn btn-ghost" style={{ padding: "8px 14px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }} onClick={downloadSave}>
                <Download size={14} /> Save career (file)
              </button>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>Progress auto-saves in this browser after every match — use the file for backups or another device.</span>
            </div>

            <div className="panel">
              <div className="h2 disp">Match day</div>
              {!seasonComplete ? (
                <>
                  {onIntlBreak ? (
                    <div style={{ marginBottom: 14 }}>
                      {intlCalledUp ? (
                        <p className="lead" style={{ marginBottom: previewOpponent ? 8 : 0 }}>
                          International duty: <strong style={{ color: "var(--chalk)" }}>{nextFixture}</strong>
                          {previewOpponent ? <> vs <strong style={{ color: "var(--chalk)" }}>{previewOpponent}</strong></> : ""}
                          {matchday === 32 ? ". Win this and the trophy is yours." : ". Points earned are banked as normal."}
                        </p>
                      ) : (
                        <p className="lead" style={{ marginBottom: 0 }}>
                          International tournament break — {myTournament ? "the coaches didn't call you up this time" : `${nation} aren't competing in this year's tournament`}. The national staff have you on a training week instead.
                        </p>
                      )}
                      {intlCalledUp && previewOpponent && previewOdds && (
                        <div style={{ background: "var(--pitch-dark)", border: "1px solid rgba(124,145,132,0.3)", borderRadius: 2, padding: "10px 12px", fontSize: 13, marginTop: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                            <span style={{ color: "var(--muted)" }}>vs</span>
                            <span className="disp" style={{ fontSize: 15 }}>{previewOpponent}</span>
                            <StarRating rating={teamStarsFor(previewOpponent)} size={11} />
                            <span style={{ fontSize: 11, color: "var(--muted)" }}>{teamStarsFor(previewOpponent).toFixed(1)}/5</span>
                          </div>
                          <div style={{ marginTop: 6, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "baseline" }}>
                            <span><span className="disp" style={{ color: "#7BC67E", fontSize: 15 }}>{previewOdds.win}%</span> win</span>
                            <span><span className="disp" style={{ color: "var(--chalk)", fontSize: 15 }}>{previewOdds.draw}%</span> draw</span>
                            <span><span className="disp" style={{ color: "var(--warn)", fontSize: 15 }}>{previewOdds.loss}%</span> loss</span>
                            <span style={{ fontSize: 11, color: "var(--muted)" }}>predicted from nation strength · {difficultyLabel} difficulty</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ marginBottom: 14 }}>
                      <p className="lead" style={{ marginBottom: previewOpponent ? 8 : 0 }}>
                        Next up: <strong style={{ color: "var(--chalk)" }}>{nextFixture}</strong>
                        {previewOpponent ? <> vs <strong style={{ color: "var(--chalk)" }}>{previewOpponent}</strong></> : ""}
                        . Points earned are banked until you allocate them.
                      </p>
                      {previewOpponent && previewOdds && (
                        <div style={{ background: "var(--pitch-dark)", border: "1px solid rgba(124,145,132,0.3)", borderRadius: 2, padding: "10px 12px", fontSize: 13 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                            <span style={{ color: "var(--muted)" }}>vs</span>
                            <span className="disp" style={{ fontSize: 15 }}>{previewOpponent}</span>
                            <StarRating rating={teamStarsFor(previewOpponent)} size={11} />
                            <span style={{ fontSize: 11, color: "var(--muted)" }}>{teamStarsFor(previewOpponent).toFixed(1)}/5</span>
                          </div>
                          <div style={{ marginTop: 6, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "baseline" }}>
                            <span><span className="disp" style={{ color: "#7BC67E", fontSize: 15 }}>{previewOdds.win}%</span> win</span>
                            <span><span className="disp" style={{ color: "var(--chalk)", fontSize: 15 }}>{previewOdds.draw}%</span> draw</span>
                            <span><span className="disp" style={{ color: "var(--warn)", fontSize: 15 }}>{previewOdds.loss}%</span> loss</span>
                            <span style={{ fontSize: 11, color: "var(--muted)" }}>predicted from club strength · {difficultyLabel} difficulty</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="quick-stat-label" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: injury ? "var(--warn)" : undefined }}>
                        <HeartPulse size={13} /> {injury ? "Injured" : "Fitness"}
                      </span>
                      <span className="disp" style={{ color: fitColor, fontSize: 15 }}>
                        {injury ? `${injury.label} · out ${injury.weeksLeft} more GW` : `${Math.round(fitness)}%`}
                      </span>
                    </div>
                    <div className="fitness-bar">
                      <div className="fitness-fill" style={{ width: `${Math.min(100, Math.max(0, fitness))}%`, background: fitColor }} />
                    </div>
                    {injury && (
                      <div style={{ fontSize: 12, color: "var(--warn)", marginTop: 6 }}>You're sidelined with a {injury.label.toLowerCase()} — rest &amp; rehab (+35% fitness) until it clears.</div>
                    )}
                    {!injury && fitness < 60 && (
                      <div style={{ fontSize: 12, color: "var(--warn)", marginTop: 6 }}>Warning: playing under 60% fitness carries a real injury risk.</div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {!injury && onIntlBreak && intlCalledUp && (
                      <button className="btn" onClick={startMatch}>
                        <Play size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />
                        Play international match
                      </button>
                    )}
                    {!injury && onIntlBreak && !intlCalledUp && (
                      <button className="btn" onClick={intlTrainingWeek}>
                        Complete training week (+15% fit, +2 SP)
                      </button>
                    )}
                    {!injury && !onIntlBreak && benched && (
                      <button className="btn" onClick={workHard}>
                        Work hard in training
                      </button>
                    )}
                    {!injury && !onIntlBreak && !benched && (
                      <button className="btn" onClick={startMatch}>
                        <Play size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />
                        Play next match
                      </button>
                    )}
                    {(fitness < 100 || injury) && (
                      <button className="btn btn-ghost" onClick={restMatch}>
                        {injury ? "Rest & rehab" : "Rest this match"}
                      </button>
                    )}
                    <button className="btn btn-ghost" onClick={() => setShowSeasonView(true)}>View season</button>
                    <button className="btn btn-ghost" onClick={() => setShowCareerView(true)}>View career</button>
                  </div>
                  {onIntlBreak && !intlCalledUp && !injury && (
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
                      The national camp wants you fresh: this week gives +15% fitness and +2 SP — no match risk.
                    </div>
                  )}
                  {!onIntlBreak && benched && !injury && (
                    <div style={{ fontSize: 12, color: "var(--warn)", marginTop: 8 }}>
                      You&apos;re out of the matchday squad. Work hard to win the manager back: +4 SP, +10% manager trust, −15% fitness — no match minutes.
                    </div>
                  )}
                  {(fitness < 100 || injury) && (
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
                      Resting skips the gameweek, recovers 35% fitness, earns 0 SP and carries no injury risk.
                    </div>
                  )}
                </>
              ) : (
                <div className="season-complete-box">
                  <p className="lead" style={{ marginBottom: 12 }}>Season {seasonNumber} is complete.</p>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                    <button className="btn" onClick={() => setShowSeasonEndPopup(true)}>Start next season</button>
                    <button className="btn btn-ghost" onClick={() => setShowSeasonView(true)}>View season</button>
                    <button className="btn btn-ghost" onClick={() => setShowCareerView(true)}>View career</button>
                  </div>
                </div>
              )}
              <div className="quick-stats">
                <div><div className="quick-stat-label">Matches</div><div className="quick-stat-val disp">{matchesPlayed}</div></div>
                <div><div className="quick-stat-label">Goals</div><div className="quick-stat-val disp">{career.goals}</div></div>
                <div><div className="quick-stat-label">Assists</div><div className="quick-stat-val disp">{career.assists}</div></div>
                <div><div className="quick-stat-label">Own goals</div><div className="quick-stat-val disp">{career.ownGoals}</div></div>
                <div><div className="quick-stat-label">Red cards</div><div className="quick-stat-val disp">{career.reds}</div></div>
                <div><div className="quick-stat-label">Trophies</div><div className="quick-stat-val disp banked">{careerTrophyCount}</div></div>
                <div><div className="quick-stat-label">Banked SP</div><div className="quick-stat-val disp banked">{bankedPoints}</div></div>
              </div>
            </div>

            {leagueHasTable && (
              <div className="panel">
                <div className="h2 disp" style={{ margin: 0 }}>League table · {league}</div>
                {sortedTable.length === 0 ? (
                  <p className="lead" style={{ marginBottom: 0, fontSize: 13 }}>No fixtures played yet — the table fills in as your season runs.</p>
                ) : (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "26px 1fr 24px 24px 24px 24px 30px 30px 30px", gap: 4, fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", padding: "4px 6px", borderBottom: "1px solid rgba(124,145,132,0.2)" }}>
                      <span>#</span><span>Club</span><span style={{ textAlign: "right" }}>P</span><span style={{ textAlign: "right" }}>W</span><span style={{ textAlign: "right" }}>D</span><span style={{ textAlign: "right" }}>L</span><span style={{ textAlign: "right" }}>GF</span><span style={{ textAlign: "right" }}>GA</span><span style={{ textAlign: "right" }}>Pts</span>
                    </div>
                    {tableRows.map(({ r, rank, pinned }) => (
                      <div key={r.name} style={{ marginTop: pinned ? 6 : 0, borderTop: pinned ? "1px dashed rgba(124,145,132,0.35)" : "none", paddingTop: pinned ? 6 : 0, display: "grid", gridTemplateColumns: "26px 1fr 24px 24px 24px 24px 30px 30px 30px", gap: 4, fontSize: 12, padding: pinned ? "6px 6px 4px" : "4px 6px", borderBottom: "1px solid rgba(124,145,132,0.12)", background: r.name === club.name ? "rgba(232,163,61,0.08)" : "transparent" }}>
                        <span className="disp" style={{ color: "var(--muted)" }}>{rank}</span>
                        <span className="disp" style={{ color: r.name === club.name ? "var(--floodlight)" : undefined, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}{pinned ? " (you)" : ""}</span>
                        <span style={{ textAlign: "right" }}>{r.played}</span>
                        <span style={{ textAlign: "right" }}>{r.won}</span>
                        <span style={{ textAlign: "right" }}>{r.drawn}</span>
                        <span style={{ textAlign: "right" }}>{r.lost}</span>
                        <span style={{ textAlign: "right" }}>{r.gf}</span>
                        <span style={{ textAlign: "right" }}>{r.ga}</span>
                        <span className="disp" style={{ textAlign: "right", color: "var(--floodlight)", fontWeight: 600 }}>{r.pts}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="panel">
              <div className="h2 disp">Social Media &amp; Fan Sentiment</div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 8, flexWrap: "wrap" }}>
                  <span className="quick-stat-label" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <AtSign size={13} /> Fan approval
                  </span>
                  <span className="disp" style={{ color: fanColor, fontSize: 15 }}>
                    {Math.round(fanApproval)}% · <span style={{ fontSize: 12, opacity: 0.9 }}>{fanStatus}</span>
                  </span>
                </div>
                <div className="fitness-bar">
                  <div className="fitness-fill" style={{ width: `${Math.round(fanApproval)}%`, background: fanColor }} />
                </div>
                {fanApproval < 25 && (
                  <div style={{ fontSize: 12, color: "var(--warn)", marginTop: 6 }}>
                    ⚠️ Concentration strain: every match option is −5% success until approval climbs back above 25%.
                  </div>
                )}
              </div>
              {fanFeed.length === 0 ? (
                <div style={{ fontSize: 13, color: "var(--muted)" }}>No reactions yet — your first match will get the fans talking.</div>
              ) : (
                <div>
                  {fanFeed.slice(0, 5).map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: 9, padding: "7px 0", borderTop: "1px solid rgba(124,145,132,0.18)", fontSize: 13, lineHeight: 1.5, alignItems: "flex-start" }}>
                      <span style={{ color: f.tone === "positive" ? "#7BC67E" : f.tone === "negative" ? "var(--warn)" : "var(--muted)", flexShrink: 0, marginTop: 2 }}>
                        {f.tone === "positive" ? <TrendingUp size={15} /> : f.tone === "negative" ? <TrendingDown size={15} /> : <AtSign size={15} />}
                      </span>
                      <span>
                        <span className="disp" style={{ color: f.tone === "positive" ? "#7BC67E" : f.tone === "negative" ? "var(--warn)" : "var(--muted)", fontWeight: 600, marginRight: 5 }}>{f.handle}</span>
                        {f.body}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="panel">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                <div className="h2 disp" style={{ margin: 0 }}>Contract &amp; finances</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="btn btn-ghost" style={{ padding: "7px 14px", fontSize: 13 }} onClick={requestRaise} disabled={wageRequestSeason === seasonNumber || seasonComplete}>
                    Request higher contract
                  </button>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "7px 14px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}
                    onClick={() => { setShowShop((s) => !s); setShopMessage(""); }}
                  >
                    <ShoppingBag size={13} /> {showShop ? "Close Luxury Shop" : "Open Luxury Shop"}
                  </button>
                </div>
              </div>
              <div className="quick-stats" style={{ marginTop: 8 }}>
                <div><div className="quick-stat-label">Weekly wage</div><div className="quick-stat-val disp banked">{formatMoney(wageWeekly)}</div></div>
                <div><div className="quick-stat-label">Net worth</div><div className="quick-stat-val disp banked">{formatMoney(netWorth)}</div></div>
                <div><div className="quick-stat-label">Market value</div><div className="quick-stat-val disp">{formatMoney(marketValue)}</div></div>
                <div><div className="quick-stat-label">Contract</div><div className="quick-stat-val disp">{seasonsLeft > 0 ? `${seasonsLeft} season${seasonsLeft === 1 ? "" : "s"} left` : "Expired"}</div></div>
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
                {contract ? `${contract.years}-year deal${contractEndSeason ? ` · runs to the end of season ${contractEndSeason}` : ""}` : "Free agent"}
              </div>
              {wageMessage && <div style={{ fontSize: 13, color: "var(--floodlight)", marginTop: 6 }}>{wageMessage}</div>}
              {showShop && (
                <div style={{ borderTop: "1px solid rgba(124,145,132,0.25)", marginTop: 14, paddingTop: 12 }}>
                  <div className="disp" style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>Luxury shop</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
                    Spend your net worth on permanent perks — you currently have <span className="disp" style={{ color: "var(--floodlight)" }}>{formatMoney(netWorth)}</span>.
                  </div>
                  {LUXURY_ITEMS.map((item) => {
                    const owned = purchasedLuxuries.includes(item.key);
                    const Icon = item.icon;
                    const affordable = netWorth >= item.price;
                    return (
                      <div className="ps-card" key={item.key} style={{ marginBottom: 8 }}>
                        <div className="ps-icon-wrap"><Icon size={17} /></div>
                        <div style={{ flex: 1 }}>
                          <div className="ps-name">{item.name}</div>
                          <div className="ps-desc">{item.desc}</div>
                        </div>
                        {owned ? (
                          <span style={{ fontSize: 12, color: "#7BC67E", fontWeight: 600, whiteSpace: "nowrap" }}>✓ Purchased</span>
                        ) : (
                          <button className={"ps-select " + (affordable ? "on" : "off")} onClick={() => buyLuxury(item.key)} disabled={!affordable}>
                            {formatMoney(item.price)}
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {shopMessage && <div style={{ fontSize: 13, color: "var(--floodlight)", marginTop: 6 }}>{shopMessage}</div>}
                </div>
              )}
            </div>

            <div className="panel">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                <div className="h2 disp" style={{ margin: 0 }}>Previous results</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--muted)" }}>
                  Show
                  <select value={resultsLimit} onChange={(e) => setResultsLimit(Number(e.target.value))} style={{ width: "auto", minWidth: 0, padding: "5px 6px", fontSize: 13 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  results
                </div>
              </div>
              {matchLog.length === 0 ? (
                <p className="lead" style={{ marginBottom: 0, fontSize: 13 }}>No matches played yet — your results will appear here.</p>
              ) : (
                matchLog.slice(0, resultsLimit).map((m, i) => (
                  <div className="log-entry" key={i} style={{ flexDirection: "column", alignItems: "stretch", gap: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                      <span className="disp" style={{ color: m.result === "W" ? "var(--floodlight)" : m.result === "L" ? "var(--warn)" : "var(--chalk)" }}>
                        {m.result} · GW{m.matchday} · {m.competition} · {club?.name} {m.teamScore}–{m.opponentScore} {m.opponent}
                      </span>
                      <span className="banked">+{m.points} SP</span>
                    </div>
                    {m.continentalBonus && (
                      <div style={{ fontSize: 12, color: "#4ADE80", fontWeight: 600 }}>🇪🇺 Continental Double SP Bonus Applied!</div>
                    )}
                    <div style={{ fontSize: 13, color: "var(--muted)" }}>
                      You: {m.goals} goal{m.goals !== 1 ? "s" : ""}, {m.assists} assist{m.assists !== 1 ? "s" : ""}
                      {m.ownGoal > 0 ? ", 1 own goal" : ""}
                      {m.red > 0 ? ", red card" : ""}
                      {" · "}Career goals: {m.careerGoalsAfter}
                    </div>
                    {m.rating != null && (
                      <div style={{ fontSize: 13, marginTop: 2 }}>
                        Match rating: <span className="disp" style={{ color: "var(--floodlight)", fontWeight: 600 }}>{m.rating.toFixed(1)}</span><span style={{ color: "var(--muted)" }}>/10{m.cleanSheet ? " · clean sheet" : ""}</span>
                      </div>
                    )}
                    {m.situation && (
                      <div style={{ fontSize: 12, color: m.situation.success ? "var(--floodlight)" : "var(--warn)" }}>
                        ⚡ {m.situation.label} — {m.situation.success ? "came off" : "didn't come off"} ({m.situation.chancePct}% chance)
                      </div>
                    )}
                  </div>
                )))}
            </div>

            <div className="panel">
              <div className="h2 disp">
                Attributes <span style={{ fontSize: 13, color: "var(--muted)", fontFamily: "'Work Sans'" }}>— {bankedPoints} points to spend</span>
              </div>
              <div className="cat-tabs">
                {attrCategories.map((c) => (
                  <button key={c.key} className={"cat-tab" + (activeAttrCategory === c.key ? " active" : "")} onClick={() => setActiveAttrCategory(c.key)}>
                    {c.label}
                  </button>
                ))}
              </div>
              {currentCategory.attrs.map((a) => {
                const val = attributes[a.key];
                const nextCost = attrCostAt(val);
                const draftAmt = parseInt(allocDrafts[a.key], 10);
                const draftCost = draftAmt > 0 ? attrCostForSteps(val, draftAmt) : null;
                return (
                  <div className="row" key={a.key}>
                    <span className="row-label">{a.label}</span>
                    <div className="stepper">
                      <button onClick={() => adjustAttribute(a.key, -1)} disabled={val <= 1}><ChevronDown size={14} /></button>
                      <span className="stat-val disp">{val}</span>
                      <button title={`Costs ${nextCost} SP`} onClick={() => adjustAttribute(a.key, 1)} disabled={bankedPoints < nextCost || val >= 99}><ChevronUp size={14} /></button>
                      <input
                        className="alloc-input"
                        type="number"
                        min="1"
                        placeholder="+N"
                        value={allocDrafts[a.key] || ""}
                        onChange={(e) => setAllocDrafts((prev) => ({ ...prev, [a.key]: e.target.value }))}
                      />
                      <button className="alloc-add" onClick={() => commitAlloc(a.key)} disabled={!canCommitAlloc(a.key)}>Add</button>
                      {draftCost !== null && <span style={{ fontSize: 11, color: "var(--muted)" }}>{draftCost} SP</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="panel">
              <div className="h2 disp">
                Playstyles <span style={{ fontSize: 13, color: "var(--muted)", fontFamily: "'Work Sans'" }}>— {PLAYSTYLE_COST} SP each, max 3 per category{position === "GK" ? " (no cap on Goalkeeping)" : ""}</span>
              </div>
              <div className="cat-tabs">
                {PLAYSTYLE_CATEGORIES.filter((c) => c.key !== "GOALKEEPING" || position === "GK").map((c) => (
                  <button key={c.key} className={"cat-tab" + (activePlaystyleCategory === c.key ? " active" : "")} onClick={() => setActivePlaystyleCategory(c.key)}>
                    {c.label} ({countInCategory(selectedPlaystyles, c.key)}{c.key === "GOALKEEPING" ? "" : "/3"})
                  </button>
                ))}
              </div>
              <div className="ps-grid">
                {PLAYSTYLES.filter((p) => p.category === activePlaystyleCategory).map((p) => {
                  const Icon = p.icon;
                  const selected = selectedPlaystyles.includes(p.key);
                  const can = canTogglePlaystyle(p.key);
                  return (
                    <div className="ps-card" key={p.key}>
                      <div className="ps-icon-wrap"><Icon size={17} /></div>
                      <div style={{ flex: 1 }}>
                        <div className="ps-name">{p.name}</div>
                        <div className="ps-desc">{p.desc}</div>
                      </div>
                      <button
                        className={"ps-select " + (selected ? "on" : "off")}
                        onClick={() => togglePlaystyle(p.key)}
                        disabled={!can}
                      >
                        {selected ? "Selected" : `Select · ${PLAYSTYLE_COST} SP`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {showSeasonView && (
          <div className="modal-backdrop" onClick={() => setShowSeasonView(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <div className="h2 disp" style={{ margin: 0 }}>Season {seasonNumber} — {club?.name}</div>
                <button className="modal-close" onClick={() => setShowSeasonView(false)}><X size={20} /></button>
              </div>
              {seasonMatches.length === 0 ? (
                <p className="lead" style={{ marginBottom: 0 }}>No matches played yet this season.</p>
              ) : (
                <div>
                  {seasonMatches.map((m, i) => (
                    <div className="season-table-row" key={i}>
                      <span className="disp" style={{ color: "var(--muted)" }}>{m.matchday}</span>
                      <span>
                        <span style={{ color: m.result === "W" ? "var(--floodlight)" : m.result === "L" ? "var(--warn)" : "var(--chalk)" }} className="disp">{m.result}</span>
                        {" "}{m.competition} · vs {m.opponent} ({m.teamScore}–{m.opponentScore})
                        <span style={{ color: "var(--muted)" }}> — {m.goals}G {m.assists}A{m.ownGoal ? " · OG" : ""}{m.red ? " · RC" : ""}</span>
                      </span>
                      <span className="banked disp">+{m.points}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {showCareerView && (
          <div className="modal-backdrop" onClick={() => setShowCareerView(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <div className="h2 disp" style={{ margin: 0 }}>Career — {name}</div>
                <button className="modal-close" onClick={() => setShowCareerView(false)}><X size={20} /></button>
              </div>
              {seasonHistory.length === 0 ? (
                <p className="lead" style={{ marginBottom: 0 }}>No completed seasons yet. Finish your first season to see it here.</p>
              ) : (
                <div>
                  {seasonHistory.slice().reverse().map((h, i) => (
                    <div className="career-season-block" key={i}>
                      <div className="disp" style={{ fontSize: 16 }}>Season {h.season} — {h.club}</div>
                      <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
                        {h.appearances} appearances · {h.goals} goals · {h.assists} assists{h.wageEarned ? ` · ${formatMoney(h.wageEarned)} earned` : ""}
                      </div>
                      {h.trophies.length > 0 ? (
                        h.trophies.map((t, j) => (
                          <div className="trophy-line" key={j}><Trophy size={13} />{t}</div>
                        ))
                      ) : (
                        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>No trophies this season</div>
                      )}
                      {h.individualAwards.map((aw, j) => (
                        <div className="award-line" key={j}><Trophy size={13} color="var(--floodlight)" />{aw}</div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              {intlStats.apps > 0 || intlHonours.length > 0 ? (
                <div style={{ borderTop: "1px dashed rgba(124,145,132,0.3)", marginTop: 12, paddingTop: 12 }}>
                  <div className="disp" style={{ fontSize: 16, marginBottom: 4 }}>International duty</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>
                    {intlStats.apps} cap{intlStats.apps === 1 ? "" : "s"} · {intlStats.goals} goal{intlStats.goals === 1 ? "" : "s"}
                  </div>
                  {intlHonours.length > 0 &&
                    intlHonours.map((h, j) => (
                      <div className="trophy-line" key={j}><Trophy size={13} color="var(--floodlight)" />{h.name} — {h.year}</div>
                    ))}
                </div>
              ) : null}
            </div>
          </div>
        )}

        {pendingSituation && (
          <div className="modal-backdrop">
            <div className="modal">
              <div className="modal-head">
                <div className="h2 disp" style={{ margin: 0 }}>Match situation</div>
              </div>
              <p className="lead" style={{ marginBottom: 8 }}>{pendingSituation.prompt}</p>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
                Pick an option — its chance is shown. The gold icons are the preferred playstyles for that choice; a green tick above an icon means you own it and it boosts the chance.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {pendingSituation.options.map((o) => {
                  const Icon = o.icon;
                  const chancePct = Math.round(o.chance * 100);
                  return (
                    <button key={o.key} className="team-card" style={{ display: "flex", alignItems: "flex-start", gap: 12 }} onClick={() => resolveSituation(o.key)}>
                      <div className="ps-icon-wrap" style={{ marginTop: 2 }}><Icon size={17} /></div>
                      <div style={{ flex: 1 }}>
                        <div className="team-name disp" style={{ color: "var(--floodlight)" }}>{o.label}</div>
                        <div className="team-tier" style={{ color: chancePct >= 60 ? "#7BC67E" : chancePct >= 40 ? "var(--chalk)" : "var(--warn)", fontWeight: 600 }}>{chancePct}% chance</div>
                        {(o.playstyles || []).length > 0 && (
                          <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                            {(o.playstyles || []).map((psKey) => {
                              const ps = PLAYSTYLE_BY_KEY[psKey];
                              if (!ps) return null;
                              const PsIcon = ps.icon;
                              const owned = selectedPlaystyles.includes(psKey);
                              return (
                                <div key={psKey} style={{ textAlign: "center", position: "relative", width: 56 }}>
                                  {owned && (
                                    <span style={{ position: "absolute", top: -5, left: "50%", marginLeft: -7, color: "#4ADE80", zIndex: 2, background: "var(--pitch-dark)", borderRadius: 10 }}>
                                      <Check size={14} />
                                    </span>
                                  )}
                                  <div style={{ width: 30, height: 30, margin: "0 auto", borderRadius: 2, background: "rgba(232,163,61,0.14)", border: owned ? "1px solid #4ADE80" : "1px solid rgba(232,163,61,0.45)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--floodlight)" }}>
                                    <PsIcon size={15} />
                                  </div>
                                  <div style={{ fontSize: 9, lineHeight: 1.2, marginTop: 3, color: owned ? "#7BC67E" : "var(--muted)", fontWeight: owned ? 600 : 400 }}>{ps.name}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {showSeasonEndPopup && lastSeasonRecap && (
          <div className="modal-backdrop">
            <div className="modal">
              <div className="modal-head">
                <div className="h2 disp" style={{ margin: 0 }}>Season {lastSeasonRecap.season} complete</div>
              </div>
              <p className="lead" style={{ marginBottom: 10 }}>
                {lastSeasonRecap.appearances} appearances for {lastSeasonRecap.club} · {lastSeasonRecap.goals} goals · {lastSeasonRecap.assists} assists
              </p>
              {lastSeasonRecap.trophies.length > 0 ? (
                lastSeasonRecap.trophies.map((t, i) => (
                  <div className="trophy-line" key={i}><Trophy size={14} />{t}</div>
                ))
              ) : (
                <div style={{ fontSize: 13, color: "var(--muted)" }}>No trophies this season</div>
              )}
              {lastSeasonRecap.individualAwards.map((aw, i) => (
                <div className="award-line" key={i}><Trophy size={14} color="var(--floodlight)" />{aw}</div>
              ))}
              {lastSeasonRecap.wageEarned > 0 && (
                <div className="award-line" style={{ marginTop: 10 }}>
                  <span className="banked disp">{formatMoney(lastSeasonRecap.wageEarned)}</span> earned in wages this season (52 weeks)
                </div>
              )}
              {lastSeasonRecap.contractEnded && (
                <div className="trophy-line" style={{ marginTop: 6 }}>Your contract has run out — you'll enter the market as a free agent.</div>
              )}
              {lastSeasonRecap.champion && (
                <div className="trophy-line" style={{ marginTop: 6 }}>
                  <Trophy size={14} />
                  {lastSeasonRecap.champion === club?.name
                    ? `Champions of ${lastSeasonRecap.leagueName || league} — incredible season!`
                    : `${lastSeasonRecap.champion} won the ${lastSeasonRecap.leagueName || league}.`}
                </div>
              )}
              <div style={{ marginTop: 18, textAlign: "center" }}>
                <div className="h2 disp" style={{ fontSize: 20, marginBottom: 14 }}>Start next season?</div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  <button className="btn" onClick={startNextSeason}>Yes</button>
                  <button className="btn btn-ghost" onClick={() => setShowSeasonEndPopup(false)}>Not yet</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {injuryNotice && (
          <div className="modal-backdrop">
            <div className="modal">
              <div className="modal-head">
                <div className="h2 disp" style={{ margin: 0, color: "var(--warn)" }}>{injuryNotice.title}</div>
              </div>
              {injuryNotice.lines.map((line, i) => (
                <p className="lead" key={i} style={{ marginBottom: i === injuryNotice.lines.length - 1 ? 4 : 10 }}>{line}</p>
              ))}
              <div style={{ marginTop: 14, textAlign: "center" }}>
                <button className="btn" onClick={() => setInjuryNotice(null)}>Continue</button>
              </div>
            </div>
          </div>
        )}

        {intlNotice && (
          <div className="modal-backdrop">
            <div className="modal">
              <div className="modal-head">
                <div className="h2 disp" style={{ margin: 0 }}>{intlNotice.title}</div>
              </div>
              {intlNotice.lines.map((line, i) => (
                <p className="lead" key={i} style={{ marginBottom: i === intlNotice.lines.length - 1 ? 4 : 10 }}>{line}</p>
              ))}
              <div style={{ marginTop: 14, textAlign: "center" }}>
                <button className="btn" onClick={() => setIntlNotice(null)}>Continue</button>
              </div>
            </div>
          </div>
        )}

        {pressQ && (
          <div className="modal-backdrop">
            <div className="modal">
              <div className="modal-head">
                <div className="h2 disp" style={{ margin: 0 }}>{pressQ.heading}</div>
              </div>
              {pressQ.ack ? (
                <>
                  <p className="lead" style={{ marginBottom: 4 }}>{pressQ.ack}</p>
                  <div style={{ marginTop: 14, textAlign: "center" }}>
                    <button className="btn" onClick={() => setPressQ(null)}>Continue</button>
                  </div>
                </>
              ) : (
                <>
                  <p className="lead" style={{ marginBottom: 12 }}>{pressQ.question}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {PRESS_OPTIONS.map((o) => (
                      <button key={o.key} className="team-card" onClick={() => answerPress(o.key)}>
                        <div className="team-name disp" style={{ color: "var(--floodlight)" }}>{o.label}</div>
                        <div className="team-tier" style={{ fontSize: 12, color: "var(--muted)" }}>{o.summary}</div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
