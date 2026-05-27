"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const root = path.resolve(__dirname, "..");
const checkpoints = Object.freeze([18, 36, 54, 74, 90, 100]);
const finishProgress = 100;

async function main() {
  const skills = await import(pathToFileURL(path.join(root, "src/restored/games/marathon-character-skill-contract.js")));
  const combat = await import(pathToFileURL(path.join(root, "src/restored/games/marathon-combat-contract.js")));

  const rewardPlan = skills.createRestoredMarathonCheckpointRewardPlan(9);
  assert.equal(rewardPlan.length, 9, "N-stage reward plan should support future rounds");
  assert.deepEqual([...skills.RESTORED_MARATHON_CHARACTER_GRADES], ["D", "C", "B", "A", "S"]);
  for (const grade of skills.RESTORED_MARATHON_CHARACTER_GRADES) {
    assert(skills.RESTORED_MARATHON_MEME_CHARACTER_CATALOG.some((item) => item.grade === grade), `${grade} grade must exist`);
  }
  assert(skills.listRestoredMarathonCharacterGradePool(1).every((item) => item.grade === "D"), "round 1 should start low grade");
  assert(skills.listRestoredMarathonCharacterGradePool(4).some((item) => item.grade === "B"), "middle rounds should unlock B grade");
  assert(skills.listRestoredMarathonCharacterGradePool(9).some((item) => item.grade === "S"), "late rounds should unlock S grade");

  const runners = Array.from({ length: 30 }, (_, index) => ({
    id: `runner:${index + 1}`,
    progress: 4 + index * 0.015,
    laneOffsetPx: ((index % 6) - 2.5) * 18,
    hp: 100,
    maxHp: 100,
    lastSafeCheckpointIndex: 0,
    nextCheckpointIndex: 0,
    finished: false,
    skillChargesRemaining: 0
  }));

  const seenGrades = new Set();
  let attackHits = 0;
  let downs = 0;
  let respawns = 0;
  let skillUses = 0;

  for (let tick = 0; tick < 420 && runners.some((runner) => !runner.finished); tick += 1) {
    for (const runner of runners) {
      if (runner.finished) continue;
      runner.progress = Math.min(finishProgress, runner.progress + 0.34 + (runner.id === "runner:1" ? 0.04 : 0));
      claimCheckpoints(runner, skills, seenGrades);
      if (runner.skillId && runner.skillChargesRemaining > 0 && runner.nextCheckpointIndex % 2 === 0) {
        const use = skills.createRestoredMarathonSkillUse({
          participantId: runner.id,
          characterId: runner.characterId,
          skillId: runner.skillId,
          chargesRemaining: runner.skillChargesRemaining
        });
        if (use.allowed) {
          skillUses += 1;
          if (use.consumesCharge) runner.skillChargesRemaining -= 1;
          if (use.skillId === "skill:checkpoint-hop") runner.progress = Math.min(finishProgress, runner.progress + 2.4);
        }
      }
      if (runner.progress >= finishProgress) runner.finished = true;
    }

    if ([26, 36, 46].includes(tick)) {
      const attacker = runners[0];
      const target = runners[1];
      target.progress = Math.max(target.progress, attacker.progress + 1.1);
      const action = combat.createRestoredMarathonAttackAction({
        attackerId: attacker.id,
        origin: { x: attacker.progress, y: 0 },
        aim: { x: 1, y: 0 }
      });
      const hit = combat.resolveRestoredMarathonAttackHit(action, {
        runnerId: target.id,
        position: { x: target.progress, y: 0 },
        hp: target.hp,
        maxHp: target.maxHp
      });
      if (hit.hit) {
        attackHits += 1;
        const damaged = combat.applyRestoredMarathonRunnerDamage({
          runnerId: target.id,
          hp: target.hp,
          maxHp: target.maxHp,
          lastSafeCheckpointIndex: target.lastSafeCheckpointIndex
        }, hit);
        target.hp = damaged.hp;
        if (damaged.down) {
          downs += 1;
          const respawn = combat.createRestoredMarathonCheckpointRespawn(damaged, { checkpointMeters: [0, ...checkpoints] });
          target.progress = respawn.progressMeters;
          target.hp = respawn.hp;
          target.lastSafeCheckpointIndex = respawn.checkpointIndex;
          target.nextCheckpointIndex = Math.max(target.nextCheckpointIndex, respawn.checkpointIndex);
          respawns += 1;
        }
      }
    }
  }

  assert.equal(runners.length, 30, "full-race smoke should keep 30 runners");
  assert(runners.every((runner) => runner.finished), "all 30 runners should finish after attacks and respawns");
  assert(attackHits >= 3, "mouse attack flow should hit during the full race");
  assert(downs >= 1 && respawns >= 1, "combat should down and checkpoint-respawn a runner");
  assert(skillUses > 0, "checkpoint character skills should be usable during the race");
  assert(seenGrades.has("D") && seenGrades.size >= 2, "race should observe checkpoint character grade changes");

  console.log("Singularity Race combat full-race smoke passed.");
  console.log(JSON.stringify({ finished: runners.length, attackHits, downs, respawns, skillUses, grades: [...seenGrades].sort() }, null, 2));
}

function claimCheckpoints(runner, skills, seenGrades) {
  while (runner.nextCheckpointIndex < checkpoints.length && runner.progress >= checkpoints[runner.nextCheckpointIndex]) {
    runner.lastSafeCheckpointIndex = runner.nextCheckpointIndex + 1;
    const reward = skills.assignRestoredMarathonCheckpointCharacter({
      participantId: runner.id,
      checkpointIndex: runner.nextCheckpointIndex + 1,
      seed: `${runner.id}:${runner.nextCheckpointIndex}`
    });
    runner.characterId = reward.character.characterId;
    runner.skillId = reward.skill.skillId;
    runner.skillChargesRemaining = reward.skill.maxCharges;
    seenGrades.add(reward.character.grade);
    runner.nextCheckpointIndex += 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
