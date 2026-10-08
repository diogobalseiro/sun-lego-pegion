/**
 * Punch-in logic tests
 */

harness.addTest('Punch: canPunchToday with no history', () => {
    state.punchHistory = [];
    assertTrue(canPunchToday());
    return true;
});

harness.addTest('Punch: canPunchToday returns false when already punched', () => {
    const today = getToday();
    state.punchHistory = [{ date: today, time: '07:55', success: true }];
    assertFalse(canPunchToday());
    return true;
});

harness.addTest('Punch: on time earns estrela', () => {
    state.deadline = '08:00';
    state.totalEstrelas = 0;
    state.currentStreak = 0;
    state.punchHistory = [];
    
    const result = punchIn('07:55');
    assertTrue(result.success);
    assertEqual(state.totalEstrelas, 1);
    assertEqual(state.currentStreak, 1);
    assertEqual(state.punchHistory.length, 1);
    return true;
});

harness.addTest('Punch: late does not earn estrela', () => {
    state.deadline = '08:00';
    state.totalEstrelas = 5;
    state.currentStreak = 3;
    state.punchHistory = [];
    
    const result = punchIn('08:05');
    assertFalse(result.success);
    assertEqual(state.totalEstrelas, 5);
    assertEqual(state.currentStreak, 0);
    return true;
});

harness.addTest('Punch: cannot punch twice same day', () => {
    const today = getToday();
    state.deadline = '08:00';
    state.punchHistory = [{ date: today, time: '07:55', success: true }];
    
    const result = punchIn('07:50');
    assertFalse(result.success);
    assertEqual(state.punchHistory.length, 1);
    return true;
});

harness.addTest('Manual Punch: with valid time', () => {
    state.deadline = '08:00';
    state.totalEstrelas = 0;
    state.punchHistory = [];
    
    const result = manualPunch('07:55');
    assertTrue(result.success);
    assertEqual(state.totalEstrelas, 1);
    return true;
});
