export const RESTORED_MARATHON_CHARACTER_SKILL_CONTRACT_VERSION = "restored-marathon-character-skill-001";
export const RESTORED_MARATHON_CHARACTER_SKILL_VERSION = RESTORED_MARATHON_CHARACTER_SKILL_CONTRACT_VERSION;

export const RESTORED_MARATHON_CHARACTER_RARITIES = Object.freeze(["common", "rare", "chaos", "legend"]);
export const RESTORED_MARATHON_CHARACTER_GRADES = Object.freeze(["D", "C", "B", "A", "S"]);
export const RESTORED_MARATHON_SKILL_TARGETS = Object.freeze(["self", "nearby", "cone", "trail", "global"]);

const SKILLS = Object.freeze([
  skill("skill:steady-boost", "Steady Boost", "self", 8, 0, 0, 0, "Short speed bump with light stamina cost."),
  skill("skill:slip-trail", "Slip Trail", "trail", 14, 1, 3.2, 0, "Drops a short slowing trail behind the runner."),
  skill("skill:side-bump", "Side Bump", "nearby", 10, 0, 2.4, 260, "Pushes nearby runners sideways, mostly useful in crowds."),
  skill("skill:input-scramble", "Input Scramble", "cone", 18, 1, 2.8, 420, "Briefly scrambles a target's movement direction."),
  skill("skill:checkpoint-hop", "Checkpoint Hop", "self", 0, 1, 0, 0, "One-use rare hop a little ahead of the saved checkpoint."),
  skill("skill:stamina-sip", "Stamina Sip", "nearby", 16, 1, 2.2, 240, "Steals a small amount of stamina from one nearby runner."),
  skill("skill:noise-burst", "Noise Burst", "global", 28, 1, 1.2, 0, "Large meme burst: everyone nearby slows, user also stalls."),
  skill("skill:guard-roll", "Guard Roll", "self", 18, 1, 0, 0, "Brief invulnerability with awkward steering.")
]);

export const RESTORED_MARATHON_MEME_CHARACTER_CATALOG = Object.freeze([
  character("runner:dororong", "도로롱 주자", "common", "skill:steady-boost", 102, "Tiny fast-footed homage runner."),
  character("runner:comment-berserker", "분노의 댓글러", "common", "skill:side-bump", 94, "Close-range nuisance with poor long-term value."),
  character("runner:recommend-fairy", "추천요정", "rare", "skill:checkpoint-hop", 88, "Rare checkpoint helper with one-use burst."),
  character("runner:night-regular", "새벽반 고인물", "rare", "skill:guard-roll", 96, "Stable late-race survivor."),
  character("runner:gallery-warden", "갤러리 수문장", "chaos", "skill:input-scramble", 90, "Disruptive cone skill, risky if overused."),
  character("runner:keyboard-warrior", "키보드워리어", "common", "skill:slip-trail", 92, "Leaves annoyance behind but loses pace."),
  character("runner:dopamine-sprinter", "도파민 질주러", "rare", "skill:stamina-sip", 104, "Short chaos duelist for mid-pack fights."),
  character("runner:meme-summoner", "밈 소환사", "legend", "skill:noise-burst", 84, "Very rare one-shot field disruption.")
]);

export function getRestoredMarathonSkill(skillId) {
  return SKILLS.find((item) => item.skillId === skillId) || SKILLS[0];
}

export function getRestoredMarathonCharacter(characterId) {
  return RESTORED_MARATHON_MEME_CHARACTER_CATALOG.find((item) => item.characterId === characterId)
    || RESTORED_MARATHON_MEME_CHARACTER_CATALOG[0];
}

export function assignRestoredMarathonCheckpointCharacter(options = {}) {
  const checkpointIndex = Math.max(1, Number(options.checkpointIndex || 1));
  const seed = String(options.seed || `${options.participantId || "runner"}:${checkpointIndex}`);
  const pool = characterPoolForCheckpoint(checkpointIndex);
  const character = weightedPick(pool, seed);
  const skill = getRestoredMarathonSkill(character.skillId);
  return Object.freeze({
    version: RESTORED_MARATHON_CHARACTER_SKILL_VERSION,
    participantId: options.participantId || "",
    checkpointIndex,
    character,
    skill,
    serverSeedHash: hashText(seed),
    authority: options.authority || "server_required"
  });
}

export function createRestoredMarathonCheckpointRewardPlan(stageCount = 9) {
  const count = Math.max(1, Math.min(64, Number(stageCount || 9)));
  return Object.freeze(Array.from({ length: count }, (_, index) => Object.freeze({
    checkpointIndex: index + 1,
    unlocksCharacter: true,
    maxGrade: maxGradeForCheckpoint(index + 1),
    legendEligible: index + 1 >= 8,
    authority: "server_required"
  })));
}

export function listRestoredMarathonCharacterGradePool(checkpointIndex = 1) {
  const maxRank = gradeRank(maxGradeForCheckpoint(checkpointIndex));
  return Object.freeze(RESTORED_MARATHON_MEME_CHARACTER_CATALOG.filter((item) => gradeRank(item.grade) <= maxRank));
}

export function createRestoredMarathonSkillUse(options = {}) {
  const character = getRestoredMarathonCharacter(options.characterId);
  const skill = getRestoredMarathonSkill(options.skillId || character.skillId);
  const chargesRemaining = Math.max(0, Number(options.chargesRemaining ?? skill.maxCharges));
  const cooldownRemainingMs = Math.max(0, Number(options.cooldownRemainingMs || 0));
  const hasCharge = skill.maxCharges === 0 || chargesRemaining > 0;
  const allowed = hasCharge && cooldownRemainingMs === 0;
  return Object.freeze({
    version: RESTORED_MARATHON_CHARACTER_SKILL_VERSION,
    participantId: options.participantId || "",
    characterId: character.characterId,
    skillId: skill.skillId,
    allowed,
    reason: allowed ? "" : !hasCharge ? "no_charges" : "cooldown",
    consumesCharge: skill.maxCharges > 0,
    movementStallMs: skill.target === "self" ? 120 : 420,
    payload: Object.freeze({
      target: skill.target,
      radiusMeters: skill.radiusMeters,
      rangeMeters: skill.rangeMeters,
      durationSeconds: skill.durationSeconds
    })
  });
}

export function validateRestoredMarathonCharacterSkillContract() {
  const errors = [];
  const reward = assignRestoredMarathonCheckpointCharacter({ participantId: "runner:test", checkpointIndex: 4, seed: "fixed" });
  const plan = createRestoredMarathonCheckpointRewardPlan(12);
  if (plan.length !== 12 || !plan[11].legendEligible) errors.push("N-stage reward plan should scale");
  if (plan[0].maxGrade !== "D" || plan[11].maxGrade !== "S") errors.push("D to S reward grades should scale");
  if (!reward.character.characterId || !reward.skill.skillId) errors.push("checkpoint reward must assign a character and skill");
  for (const grade of RESTORED_MARATHON_CHARACTER_GRADES) {
    if (!RESTORED_MARATHON_MEME_CHARACTER_CATALOG.some((item) => item.grade === grade)) errors.push(`${grade} grade needs a character`);
  }
  if (!listRestoredMarathonCharacterGradePool(9).some((item) => item.grade === "S")) errors.push("late stages should unlock S grade");
  const rare = RESTORED_MARATHON_MEME_CHARACTER_CATALOG.find((item) => item.rarity === "rare");
  const use = createRestoredMarathonSkillUse({ participantId: "runner:test", characterId: rare.characterId });
  if (!use.allowed || !use.consumesCharge) errors.push("rare skill should be one-use capable");
  const empty = createRestoredMarathonSkillUse({ participantId: "runner:test", characterId: rare.characterId, chargesRemaining: 0 });
  if (empty.allowed || empty.reason !== "no_charges") errors.push("empty one-use skill must be blocked");
  if (RESTORED_MARATHON_MEME_CHARACTER_CATALOG.length < 8) errors.push("catalog should have enough meme-style runners");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

function skill(skillId, label, target, cooldownSeconds, maxCharges, durationSeconds, radiusMeters, description) {
  return Object.freeze({ skillId, label, target, cooldownSeconds, maxCharges, durationSeconds, radiusMeters, rangeMeters: radiusMeters, description });
}

function character(characterId, label, rarity, skillId, speedRating, note) {
  return Object.freeze({ characterId, label, rarity, grade: gradeForCharacter(characterId, rarity), skillId, speedRating, note });
}

function characterPoolForCheckpoint(checkpointIndex) {
  return listRestoredMarathonCharacterGradePool(checkpointIndex);
}

function weightedPick(pool, seed) {
  const total = pool.reduce((sum, item) => sum + weightForGrade(item.grade), 0);
  let roll = hashText(seed) % total;
  for (const item of pool) {
    roll -= weightForGrade(item.grade);
    if (roll < 0) return item;
  }
  return pool[0];
}

function gradeForCharacter(characterId, rarity) {
  if (characterId === "runner:meme-summoner") return "S";
  if (characterId === "runner:gallery-warden" || characterId === "runner:dopamine-sprinter") return "A";
  if (rarity === "rare") return "B";
  if (characterId === "runner:keyboard-warrior") return "C";
  return "D";
}

function maxGradeForCheckpoint(checkpointIndex) {
  if (checkpointIndex >= 8) return "S";
  if (checkpointIndex >= 6) return "A";
  if (checkpointIndex >= 4) return "B";
  if (checkpointIndex >= 2) return "C";
  return "D";
}

function gradeRank(grade) {
  const index = RESTORED_MARATHON_CHARACTER_GRADES.indexOf(String(grade || "D").toUpperCase());
  return index < 0 ? 0 : index;
}

function weightForGrade(grade) {
  if (grade === "S") return 1;
  if (grade === "A") return 4;
  if (grade === "B") return 8;
  if (grade === "C") return 12;
  return 16;
}

function hashText(text) {
  let hash = 2166136261;
  for (const char of String(text)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return hash >>> 0;
}
