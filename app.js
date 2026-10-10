/**
 * Elevator Token Challenge (Desafio das Estrelas)
 * Morning routine tracker for kids aged 6-8
 * 
 * Behavioral design principles:
 * - Immediate, specific reinforcement
 * - One token (estrela) per observable behavior
 * - Small, achievable early rewards
 * - No token removal
 * - Track consecutive day streak
 */

const VERSION = '5.0.0';
const STATE_KEY = 'elevatorTokenState';
const defaultRewards = [
    { id: 1, name: '15 min a brincar extra', cost: 3 },
    { id: 2, name: 'Escolher a sobremesa', cost: 5 },
    { id: 3, name: 'Filme ao fim de semana', cost: 8 },
    { id: 4, name: 'Brinquedo pequeno', cost: 15 }
];

const defaultState = {
    deadline: '08:00',
    totalEstrelas: 0,
    currentStreak: 0,
    longestStreak: 0,
    rewards: [...defaultRewards],
    punchHistory: [],
    redemptionLog: [],
    lastPunchDate: null
};

let state = { ...defaultState };

// ============================================
// LOCAL STORAGE
// ============================================
function loadState() {
    try {
        const saved = localStorage.getItem(STATE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            state = { ...defaultState, ...parsed };
            if (!state.rewards) {
                state.rewards = [...defaultRewards];
            }
            if (!state.punchHistory) state.punchHistory = [];
            if (!state.redemptionLog) state.redemptionLog = [];
        }
    } catch (e) {
        state = { ...defaultState };
    }
}

function saveState() {
    try {
        localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (e) {}
}

// ============================================
// TIME UTILITIES
// ============================================
function getToday() {
    return new Date().toISOString().split('T')[0];
}

function getCurrentTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function formatDateForDisplay(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

// ============================================
// CORE LOGIC
// ============================================
function checkDeadline(timeStr) {
    const timeMinutes = timeToMinutes(timeStr);
    const deadlineMinutes = timeToMinutes(state.deadline);
    return timeMinutes <= deadlineMinutes;
}

function canPunchToday() {
    const today = getToday();
    const lastPunch = state.punchHistory.find(p => p.date === today);
    return !lastPunch;
}

function punchIn(timeStr = null) {
    const today = getToday();
    const time = timeStr || getCurrentTime();
    
    if (!canPunchToday()) {
        return { success: false, message: 'Já carimbaste hoje!' };
    }
    
    const success = checkDeadline(time);
    
    state.punchHistory.push({ date: today, time: time, success: success });
    state.lastPunchDate = today;
    
    if (success) {
        state.totalEstrelas += 1;
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const yesterdayPunch = state.punchHistory.find(p => p.date === yesterdayStr && p.success);
        
        if (yesterdayPunch) {
            state.currentStreak += 1;
        } else {
            state.currentStreak = 1;
        }
        
        if (state.currentStreak > state.longestStreak) {
            state.longestStreak = state.currentStreak;
        }
        
        saveState();
        return { success: true, message: `Conseguiiste! Chegaste às ${time} 🎉` };
    } else {
        state.currentStreak = 0;
        saveState();
        return { success: false, message: `Quase! Chegaste às ${time}, continua a tentar amanhã!` };
    }
}

function tradeReward(rewardId) {
    const reward = state.rewards.find(r => r.id === rewardId);
    if (!reward) return { success: false, message: 'Prémio não encontrado' };
    if (state.totalEstrelas < reward.cost) return { success: false, message: 'Não tens estrelas suficientes!' };
    
    state.totalEstrelas -= reward.cost;
    state.redemptionLog.push({
        date: getToday(),
        rewardId: reward.id,
        rewardName: reward.name,
        cost: reward.cost
    });
    saveState();
    return { success: true, message: `Parabéns! Ganhaste "${reward.name}"! 🎁` };
}

function clearTodayPunch() {
    const today = getToday();
    state.punchHistory = state.punchHistory.filter(p => p.date !== today);
    saveState();
    return { success: true, message: 'Hoje foi removido' };
}

function resetAll() {
    if (confirm('Tens a certeza que queres reiniciar TUDO?')) {
        state = { ...defaultState };
        saveState();
        return { success: true, message: 'Tudo foi reiniciado' };
    }
    return { success: false, message: 'Reinício cancelado' };
}

// ============================================
// REWARDS MANAGEMENT
// ============================================
function addReward(name, cost) {
    const id = state.rewards.length > 0 ? Math.max(...state.rewards.map(r => r.id)) + 1 : 1;
    state.rewards.push({ id, name, cost: parseInt(cost) });
    saveState();
    return { success: true, reward: { id, name, cost: parseInt(cost) } };
}

function removeReward(rewardId) {
    state.rewards = state.rewards.filter(r => r.id !== rewardId);
    saveState();
    return { success: true };
}

function setDeadline(time) {
    state.deadline = time;
    saveState();
    return { success: true, deadline: time };
}

function manualPunch(time) {
    return punchIn(time);
}

// ============================================
// HISTORY
// ============================================
function getLast7Days() {
    return state.punchHistory
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 7);
}

function getRecentRedemptions(limit = 10) {
    return state.redemptionLog
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, limit);
}

// ============================================
// RENDERING
// ============================================
function renderEstrelaCounter() {
    document.getElementById('total-estrelas').textContent = state.totalEstrelas;
}

function renderStreakCounter() {
    document.getElementById('current-streak').textContent = state.currentStreak;
}

function renderRewards() {
    const container = document.getElementById('rewards-list');
    container.innerHTML = '';
    
    state.rewards.forEach(reward => {
        const canAfford = state.totalEstrelas >= reward.cost;
        const card = document.createElement('div');
        card.className = 'reward-card';
        card.innerHTML = `
            <div class="reward-name">${reward.name}</div>
            <div class="reward-cost">${reward.cost} ⭐</div>
            <button class="trade-btn" ${!canAfford ? 'disabled' : ''} data-id="${reward.id}">Trocar</button>
        `;
        container.appendChild(card);
    });
    
    container.querySelectorAll('.trade-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const rewardId = parseInt(e.target.dataset.id);
            const result = tradeReward(rewardId);
            if (result.success) {
                renderEstrelaCounter();
                renderRewards();
            }
        });
    });
}

function renderHistory() {
    const tbody = document.getElementById('history-body');
    const history = getLast7Days();
    tbody.innerHTML = '';
    
    if (history.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="3">Ainda sem histórico</td>';
        tbody.appendChild(row);
        return;
    }
    
    history.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDateForDisplay(entry.date)}</td>
            <td>${entry.time}</td>
            <td class="${entry.success ? 'result-success' : 'result-fail'}">
                ${entry.success ? '✓ Consegui!' : '✗ Quase!'} 
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderParentZone() {
    document.getElementById('deadline-input').value = state.deadline;
    renderAdminRewards();
    renderRedemptionLog();
}

function renderAdminRewards() {
    const container = document.getElementById('reward-list-admin');
    container.innerHTML = '';
    
    state.rewards.forEach(reward => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div><strong>${reward.name}</strong> (${reward.cost} ⭐)</div>
            <button class="remove-reward" data-id="${reward.id}">Remover</button>
        `;
        container.appendChild(li);
    });
    
    container.querySelectorAll('.remove-reward').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const rewardId = parseInt(e.target.dataset.id);
            removeReward(rewardId);
            renderAdminRewards();
            renderRewards();
        });
    });
}

function renderRedemptionLog() {
    const container = document.getElementById('log-list');
    const log = getRecentRedemptions();
    container.innerHTML = '';
    
    if (log.length === 0) {
        container.innerHTML = '<li>Nenhum registo de trocas</li>';
        return;
    }
    
    log.forEach(entry => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${formatDateForDisplay(entry.date)}</span>
            <span>${entry.rewardName} (-${entry.cost} ⭐)</span>
        `;
        container.appendChild(li);
    });
}

// ============================================
// FEEDBACK & ANIMATIONS
// ============================================
function animateButton(success) {
    const punchBtn = document.getElementById('punch-btn');
    
    // Clear any existing animation classes
    punchBtn.classList.remove('success', 'failure');
    
    // Create background overlay
    const overlay = document.createElement('div');
    overlay.className = `page-overlay ${success ? 'success' : 'failure'}`;
    document.body.appendChild(overlay);
    
    if (success) {
        // SUCCESS: Star awarded
        punchBtn.classList.add('success');
        
        // Create multiple animations
        for (let i = 0; i < 8; i++) {
            createEstrelaAnimation();
            createConfetti();
            createSparkle();
        }
        
        setTimeout(() => {
            punchBtn.classList.remove('success');
            overlay.remove();
        }, 1500);
    } else {
        // FAILURE: Star denied
        punchBtn.classList.add('failure');
        
        // Create sad particles
        for (let i = 0; i < 5; i++) {
            createSadParticle();
        }
        
        setTimeout(() => {
            punchBtn.classList.remove('failure');
            overlay.remove();
        }, 1800);
    }
}

function createEstrelaAnimation() {
    const estrela = document.createElement('div');
    estrela.className = 'estrela-animation';
    estrela.textContent = '★';
    
    const punchBtn = document.getElementById('punch-btn');
    const rect = punchBtn.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    
    document.body.appendChild(estrela);
    estrela.style.left = `${startX}px`;
    estrela.style.top = `${startY}px`;
    estrela.style.transform = `translate(${Math.random() * 40 - 20}px, 0)`;
    
    setTimeout(() => estrela.remove(), 1500);
}

function createConfetti() {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    
    const punchBtn = document.getElementById('punch-btn');
    const rect = punchBtn.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    
    // Random colors: gold, teal, purple, pink
    const colors = ['#FFD700', '#06B6D4', '#4F46E5', '#EC4899', '#F59E0B'];
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    
    // Random size
    const size = Math.random() * 6 + 4;
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    
    document.body.appendChild(confetti);
    confetti.style.left = `${startX + (Math.random() * 80 - 40)}px`;
    confetti.style.top = `${startY}px`;
    confetti.style.animationDelay = `${Math.random() * 0.5}s`;
    confetti.style.animationDuration = `${Math.random() * 0.5 + 1.5}s`;
    
    setTimeout(() => confetti.remove(), 2500);
}

function createSparkle() {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    
    const punchBtn = document.getElementById('punch-btn');
    const rect = punchBtn.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    
    document.body.appendChild(sparkle);
    sparkle.style.left = `${startX + (Math.random() * 60 - 30)}px`;
    sparkle.style.top = `${startY}px`;
    sparkle.style.animationDelay = `${Math.random() * 0.3}s`;
    
    setTimeout(() => sparkle.remove(), 1500);
}

function createSadParticle() {
    const particle = document.createElement('div');
    particle.className = 'sad-particle';
    particle.textContent = '☆';
    
    const punchBtn = document.getElementById('punch-btn');
    const rect = punchBtn.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    
    document.body.appendChild(particle);
    particle.style.left = `${startX + (Math.random() * 40 - 20)}px`;
    particle.style.top = `${startY}px`;
    particle.style.transform = `translate(0, 0) scale(${Math.random() * 0.5 + 0.5})`;
    particle.style.animationDuration = `${Math.random() * 0.5 + 0.8}s`;
    particle.style.animationDelay = `${Math.random() * 0.2}s`;
    
    setTimeout(() => particle.remove(), 1500);
}

// ============================================
// ADMIN ACCESS (Long Press)
// ============================================
let longPressTimer = null;
let isLongPressTriggered = false;
const LONG_PRESS_DURATION = 1000;

function startLongPress() {
    isLongPressTriggered = false;
    const versionBadge = document.getElementById('version-badge');
    if (versionBadge) versionBadge.classList.add('pressing');
    longPressTimer = setTimeout(() => {
        isLongPressTriggered = true;
        if (versionBadge) versionBadge.classList.remove('pressing');
        showParentZone();
    }, LONG_PRESS_DURATION);
}

function cancelLongPress() {
    const versionBadge = document.getElementById('version-badge');
    if (versionBadge) versionBadge.classList.remove('pressing');
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }
}

function showParentZone() {
    document.getElementById('parent-zone').classList.remove('hidden');
    renderParentZone();
}

function hideParentZone() {
    document.getElementById('parent-zone').classList.add('hidden');
}

// ============================================
// INITIALIZATION
// ============================================
function init() {
    loadState();
    
    renderEstrelaCounter();
    renderStreakCounter();
    renderRewards();
    renderHistory();
    
    // Punch button
    const punchBtn = document.getElementById('punch-btn');
    punchBtn.addEventListener('click', () => {
        if (isLongPressTriggered) {
            isLongPressTriggered = false;
            return;
        }
        if (!canPunchToday()) {
            animateButton(false);
            return;
        }
        const result = punchIn();
        animateButton(result.success);
        renderEstrelaCounter();
        renderStreakCounter();
        renderRewards();
        renderHistory();
    });
    
    // Long press on version badge for parent mode
    const versionBadge = document.getElementById('version-badge');
    if (versionBadge) {
        versionBadge.addEventListener('pointerdown', startLongPress);
        versionBadge.addEventListener('pointerup', cancelLongPress);
        versionBadge.addEventListener('pointercancel', cancelLongPress);
        versionBadge.addEventListener('mouseleave', cancelLongPress);
        versionBadge.style.cursor = 'pointer';
        versionBadge.style.userSelect = 'none';
    }
    
    // Parent zone
    document.getElementById('close-parent').addEventListener('click', hideParentZone);
    document.getElementById('save-deadline').addEventListener('click', () => {
        const time = document.getElementById('deadline-input').value;
        if (time) { setDeadline(time); }
    });
    document.getElementById('add-reward').addEventListener('click', () => {
        const name = document.getElementById('reward-name').value;
        const cost = document.getElementById('reward-cost').value;
        if (name && cost && parseInt(cost) > 0) {
            addReward(name, cost);
            document.getElementById('reward-name').value = '';
            document.getElementById('reward-cost').value = '';
            renderAdminRewards();
            renderRewards();
        }
    });
    document.getElementById('manual-punch').addEventListener('click', () => {
        const time = document.getElementById('manual-time').value;
        if (time) {
            manualPunch(time);
            renderEstrelaCounter();
            renderStreakCounter();
            renderRewards();
            renderHistory();
            hideParentZone();
        }
    });
    document.getElementById('clear-today').addEventListener('click', () => {
        if (confirm('Tens a certeza que queres apagar o registo de hoje?')) {
            clearTodayPunch();
            renderHistory();
        }
    });
    document.getElementById('reset-all').addEventListener('click', () => {
        const result = resetAll();
        if (result.success) {
            renderEstrelaCounter();
            renderStreakCounter();
            renderRewards();
            renderHistory();
            hideParentZone();
        }
    });
    
    updateGreeting();
    setInterval(updateGreeting, 60000);
}

function updateGreeting() {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Bom dia!' : hour < 18 ? 'Boa tarde!' : 'Boa noite!';
    document.getElementById('greeting').textContent = greeting;
}

// Set version badge
function setVersionBadge() {
    const badge = document.getElementById('version-badge');
    if (badge) badge.textContent = `v${VERSION}`;
}

// Create cosmic particles (stars) in background
function createCosmicParticles() {
    const app = document.getElementById('app');
    if (!app) return;
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'cosmic-particle';
        
        // Random position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Random size (1-3px)
        const size = Math.random() * 2 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random opacity
        particle.style.opacity = Math.random() * 0.7 + 0.3;
        
        // Random animation delay
        particle.style.animationDelay = `${Math.random() * 2}s`;
        
        app.appendChild(particle);
    }
}

// START
document.addEventListener('DOMContentLoaded', () => {
    setVersionBadge();
    createCosmicParticles();
    init();
});
