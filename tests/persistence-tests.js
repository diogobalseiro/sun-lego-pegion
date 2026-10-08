/**
 * Persistence tests
 */

harness.addTest('Persistence: loadState with saved state', () => {
    try {
        const testState = {
            deadline: '09:00',
            totalEstrelas: 25,
            currentStreak: 5,
            rewards: [...defaultRewards, { id: 5, name: 'Test', cost: 20 }]
        };
        localStorage.setItem(STATE_KEY, JSON.stringify(testState));
    } catch (e) {
        return 'skip';
    }
    
    state = { ...defaultState };
    loadState();
    
    assertEqual(state.deadline, '09:00');
    assertEqual(state.totalEstrelas, 25);
    assertEqual(state.currentStreak, 5);
    
    try { localStorage.removeItem(STATE_KEY); } catch (e) {}
    return true;
});

harness.addTest('Persistence: loadState uses defaults when empty', () => {
    try { localStorage.removeItem(STATE_KEY); } catch (e) {}
    state = { ...defaultState };
    loadState();
    assertEqual(state.deadline, '08:00');
    assertEqual(state.totalEstrelas, 0);
    return true;
});

harness.addTest('Persistence: saveState writes correctly', () => {
    try { localStorage.clear(); } catch (e) { return 'skip'; }
    
    state.deadline = '10:00';
    state.totalEstrelas = 50;
    saveState();
    
    try {
        const saved = JSON.parse(localStorage.getItem(STATE_KEY));
        assertEqual(saved.deadline, '10:00');
        assertEqual(saved.totalEstrelas, 50);
        localStorage.removeItem(STATE_KEY);
    } catch (e) {
        return false;
    }
    return true;
});

harness.addTest('Persistence: fallback when localStorage errors', () => {
    const originalLocalStorage = window.localStorage;
    const throwOnAccess = {
        getItem: () => { throw new Error('localStorage not available'); },
        setItem: () => { throw new Error('localStorage not available'); }
    };
    
    try {
        Object.defineProperty(window, 'localStorage', {
            value: throwOnAccess,
            configurable: true
        });
        state = { ...defaultState };
        loadState();
        assertEqual(state.deadline, '08:00');
        state.totalEstrelas = 10;
        saveState();
        assertEqual(state.totalEstrelas, 10);
    } catch (e) {
        Object.defineProperty(window, 'localStorage', {
            value: originalLocalStorage,
            configurable: true
        });
        return false;
    }
    
    Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        configurable: true
    });
    return true;
});
