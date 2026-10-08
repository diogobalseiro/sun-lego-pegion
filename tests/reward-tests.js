/**
 * Reward system tests
 */

harness.addTest('Rewards: default rewards exist', () => {
    state = { ...defaultState };
    assertEqual(state.rewards.length, 4);
    return true;
});

harness.addTest('Rewards: addReward creates new reward', () => {
    state.rewards = [...defaultRewards];
    const result = addReward('Novo Prémio', 10);
    assertTrue(result.success);
    assertEqual(state.rewards.length, 5);
    const newReward = state.rewards.find(r => r.name === 'Novo Prémio');
    assert(newReward !== undefined);
    assertEqual(newReward.cost, 10);
    return true;
});

harness.addTest('Rewards: removeReward removes by id', () => {
    state.rewards = [...defaultRewards];
    const initialCount = state.rewards.length;
    const result = removeReward(2);
    assertTrue(result.success);
    assertEqual(state.rewards.length, initialCount - 1);
    const removed = state.rewards.find(r => r.id === 2);
    assert(removed === undefined);
    return true;
});

harness.addTest('Rewards: tradeReward with enough estrelas', () => {
    state.totalEstrelas = 10;
    state.rewards = defaultRewards;
    const result = tradeReward(1);
    assertTrue(result.success);
    assertEqual(state.totalEstrelas, 7);
    assertEqual(state.redemptionLog.length, 1);
    return true;
});

harness.addTest('Rewards: tradeReward fails with insufficient estrelas', () => {
    state.totalEstrelas = 2;
    state.rewards = defaultRewards;
    const result = tradeReward(1);
    assertFalse(result.success);
    assertEqual(state.totalEstrelas, 2);
    return true;
});

harness.addTest('Rewards: tradeReward with exact amount', () => {
    state.totalEstrelas = 3;
    state.rewards = defaultRewards;
    const result = tradeReward(1);
    assertTrue(result.success);
    assertEqual(state.totalEstrelas, 0);
    return true;
});

harness.addTest('Rewards: getRecentRedemptions returns correct entries', () => {
    state.redemptionLog = [];
    state.redemptionLog.push({ date: '2024-01-01', rewardId: 1, rewardName: 'Test', cost: 3 });
    state.redemptionLog.push({ date: '2024-01-02', rewardId: 2, rewardName: 'Test2', cost: 5 });
    state.redemptionLog.push({ date: '2024-01-03', rewardId: 3, rewardName: 'Test3', cost: 8 });
    const recent = getRecentRedemptions(2);
    assertEqual(recent.length, 2);
    assertEqual(recent[0].rewardId, 3);
    return true;
});
