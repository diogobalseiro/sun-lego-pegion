/**
 * Deadline-related tests
 */

harness.addTest('Deadline: timeToMinutes converts correctly', () => {
    assertEqual(timeToMinutes('08:00'), 480);
    assertEqual(timeToMinutes('00:00'), 0);
    assertEqual(timeToMinutes('23:59'), 1439);
    return true;
});

harness.addTest('Deadline: time exactly at deadline passes', () => {
    state.deadline = '08:00';
    assertTrue(checkDeadline('08:00'), 'Exactly at deadline should pass');
    return true;
});

harness.addTest('Deadline: time before deadline passes', () => {
    state.deadline = '08:00';
    assertTrue(checkDeadline('07:59'));
    assertTrue(checkDeadline('07:30'));
    assertTrue(checkDeadline('00:01'));
    return true;
});

harness.addTest('Deadline: time after deadline fails', () => {
    state.deadline = '08:00';
    assertFalse(checkDeadline('08:01'));
    assertFalse(checkDeadline('09:00'));
    assertFalse(checkDeadline('12:00'));
    return true;
});

harness.addTest('Deadline: works with different deadlines', () => {
    state.deadline = '07:30';
    assertTrue(checkDeadline('07:29'));
    assertFalse(checkDeadline('07:31'));
    return true;
});

harness.addTest('Date: formatDateForDisplay works', () => {
    assertEqual(formatDateForDisplay('2024-01-15'), '15/01/2024');
    return true;
});

harness.addTest('Date: getCurrentTime returns valid format', () => {
    const time = getCurrentTime();
    assert(time.match(/^\d{2}:\d{2}$/), 'Should be HH:mm format');
    return true;
});
