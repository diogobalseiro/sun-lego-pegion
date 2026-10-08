/**
 * Streak calculation tests
 */

harness.addTest('Streak: first success starts at 1', () => {
    state.deadline = '08:00';
    state.totalEstrelas = 0;
    state.currentStreak = 0;
    state.longestStreak = 0;
    state.punchHistory = [];
    
    punchIn('07:55');
    assertEqual(state.currentStreak, 1);
    assertEqual(state.longestStreak, 1);
    return true;
});

harness.addTest('Streak: late punch breaks streak to 0', () => {
    state.deadline = '08:00';
    state.currentStreak = 3;
    state.longestStreak = 3;
    state.punchHistory = [];
    
    punchIn('08:10');
    assertEqual(state.currentStreak, 0);
    assertEqual(state.longestStreak, 3);
    return true;
});

harness.addTest('Streak: getLast7Days returns correct count', () => {
    state.punchHistory = [];
    const today = getToday();
    for (let i = 0; i < 10; i++) {
        const day = new Date();
        day.setDate(day.getDate() - i);
        const dayStr = day.toISOString().split('T')[0];
        state.punchHistory.push({ date: dayStr, time: '07:55', success: true });
    }
    
    const last7 = getLast7Days();
    assertEqual(last7.length, 7);
    return true;
});

harness.addTest('Streak: longest streak tracks maximum', () => {
    state.currentStreak = 0;
    state.longestStreak = 0;
    state.punchHistory = [];
    state.deadline = '08:00';
    
    // Build streak of 5
    for (let i = 1; i <= 5; i++) {
        punchIn('07:55');
    }
    assertEqual(state.longestStreak, 5);
    
    // Build streak of 3
    state.currentStreak = 0;
    for (let i = 0; i < 3; i++) {
        punchIn('07:55');
    }
    assertEqual(state.longestStreak, 5);
    
    // Build streak of 7
    for (let i = 0; i < 7; i++) {
        punchIn('07:55');
    }
    assertEqual(state.longestStreak, 7);
    return true;
});
