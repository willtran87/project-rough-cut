// A recovery point owns its resources and permanent world changes together.
// Live pursuit, input, HUD and unfinished interactions are deliberately reset.
const progressFields = [
  'phase', 'nightOrderActionsCompleted', 'keyCollected', 'drainUnlocked',
  'sprinklerUsed', 'changeRequestCollected', 'appealUsed', 'reviewsCleared',
  'reviewRewards', 'filingReduction', 'reviewRewardChoices', 'reviewBallReserve',
  'reviewLightsOutTimer', 'golfBalls', 'recoverableBalls', 'nextRecoverableBallId',
  'ballsRecovered', 'ballThrowsUsed', 'noiseHazards', 'noiseHazardsTriggered',
  'noiseHazardsStepped', 'noiseHazardsTriggeredByBall', 'noiseHazardTutorialSeen',
  'maxDetection', 'pursuitSeconds', 'chaseCount', 'chaseBreaks', 'closeCalls',
  'closestJoeDistance', 'crouchedSeconds', 'razorCuts', 'riskPremiumBanked',
  'riskBreakBonuses', 'deliveryBonus', 'deliveryPeak', 'deliveryEvents',
  'sandSeconds', 'sandTrapCount', 'sandTrapSeconds', 'shotCraftCounts',
  'shotCraftEvents', 'appealActivationDistance', 'statusRequest',
];
const statisticFields = {
  crosswind:['windRuns','maskedSeconds','totalMaskedDistance'],
  nerveHold:['completions'], cadenceRead:['completions'],
};
const copy = value => structuredClone(value);

export function captureCourseCheckpoint(h, player, yaw) {
  const progress = {};
  for (const key of progressFields) if (h[key] !== undefined) progress[key] = copy(h[key]);
  const statistics = {};
  for (const [group,keys] of Object.entries(statisticFields)) {
    statistics[group] = Object.fromEntries(keys.map(key=>[key,h[group][key]]));
  }
  return {
    version: 2, x: player.x, y: player.y, yaw, pitch: player.pitch || 0,
    elapsed: h.elapsed,
    joe: {x:h.joe.x, y:h.joe.y, patrolIndex:h.joe.patrolIndex, patrolSeed:h.joe.patrolSeed},
    // Keep the small legacy summary for existing presentation/debug consumers.
    checks:[...h.nightOrderActionsCompleted], key:h.keyCollected,
    drain:h.drainUnlocked, balls:h.golfBalls,
    nightfallChecks:copy(h.engagement.experience.nightfall.checks),
    progress, statistics, engagement:copy(h.engagement), cleanChecks:[...h.fieldSignalBreakaway.completed],
  };
}

export function restoreCourseCheckpoint(h, player, checkpoint) {
  if (!checkpoint) return;
  Object.assign(player, {x:checkpoint.x, y:checkpoint.y, yaw:checkpoint.yaw, pitch:checkpoint.pitch || 0});
  h.elapsed = checkpoint.elapsed;
  if (checkpoint.progress) {
    for (const key of progressFields) if (checkpoint.progress[key] !== undefined) h[key] = copy(checkpoint.progress[key]);
    h.engagement = copy(checkpoint.engagement);
    h.fieldSignalBreakaway.completed = [...checkpoint.cleanChecks];
    for (const [group,values] of Object.entries(checkpoint.statistics || {})) Object.assign(h[group],values);
  }
  for (const key of ['x','y','patrolIndex','patrolSeed']) {
    if (checkpoint.joe[key] !== undefined) h.joe[key] = checkpoint.joe[key];
  }
  Object.assign(h.joe, {mode:'patrol', patrolPause:2, effectLastX:h.joe.x, effectLastY:h.joe.y});
}

export function courseCheckpointSafe(h, distance) {
  return !h.tutorialVisible && !h.rebuild.lab && !h.mapOpen &&
    !h.ballAim.active && !h.ballFlight && !h.ballRoll && !h.quietLog &&
    !h.escapeFiling.active && !h.escapeFiling.sealing && !h.statusRequest.active &&
    h.joe.mode === 'patrol' && !h.hasLineOfSight && !h.playerAudible &&
    h.detection < .12 && distance >= 110 && !h.distraction &&
    !h.engagement.inspection && h.engagement.closeEscape.remaining <= 0;
}
