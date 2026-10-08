/**
 * Test Harness for Elevator Token Challenge
 * Self-contained, no external dependencies
 */

class TestHarness {
    constructor() {
        this.tests = [];
        this.results = [];
    }
    
    addTest(name, fn) {
        this.tests.push({ name, fn });
    }
    
    async runAll() {
        this.results = [];
        const container = document.getElementById('test-container');
        container.innerHTML = '';
        
        const sections = this.groupTestsBySection();
        sections.forEach(section => this.createSection(container, section));
        
        this.updateSummary();
        return this.results;
    }
    
    groupTestsBySection() {
        const sections = {};
        this.tests.forEach(test => {
            const sectionName = test.name.split(':')[0].trim();
            if (!sections[sectionName]) sections[sectionName] = [];
            sections[sectionName].push(test);
        });
        return Object.entries(sections).map(([name, tests]) => ({ name, tests }));
    }
    
    createSection(container, section) {
        const sectionEl = document.createElement('div');
        sectionEl.className = 'test-section';
        
        const heading = document.createElement('h2');
        heading.textContent = section.name;
        sectionEl.appendChild(heading);
        
        const list = document.createElement('ul');
        list.className = 'test-list';
        sectionEl.appendChild(list);
        
        section.tests.forEach(test => this.runTest(test, list));
        container.appendChild(sectionEl);
    }
    
    runTest(test, list) {
        const item = document.createElement('li');
        item.className = 'test-item';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'test-name';
        nameSpan.textContent = test.name;
        
        const iconSpan = document.createElement('span');
        iconSpan.className = 'status-icon';
        
        item.appendChild(iconSpan);
        item.appendChild(nameSpan);
        list.appendChild(item);
        
        try {
            const originalState = JSON.parse(JSON.stringify(state));
            try { localStorage.removeItem(STATE_KEY); } catch (e) {}
            state = { ...defaultState };
            
            const result = test.fn();
            Object.assign(state, originalState);
            
            if (result === true || result?.pass === true) {
                item.classList.add('pass');
                iconSpan.textContent = '✓';
                this.results.push({ name: test.name, status: 'pass' });
            } else if (result === false || result?.pass === false) {
                item.classList.add('fail');
                iconSpan.textContent = '✗';
                this.results.push({ name: test.name, status: 'fail' });
            } else if (result === 'skip' || result?.skip === true) {
                item.classList.add('skip');
                iconSpan.textContent = '»';
                this.results.push({ name: test.name, status: 'skip' });
            } else {
                item.classList.add('fail');
                iconSpan.textContent = '✗';
                this.results.push({ name: test.name, status: 'fail' });
            }
        } catch (error) {
            item.classList.add('fail');
            iconSpan.textContent = '✗';
            const errorSpan = document.createElement('div');
            errorSpan.className = 'test-error';
            errorSpan.textContent = `Error: ${error.message}`;
            item.appendChild(errorSpan);
            this.results.push({ name: test.name, status: 'fail', error: error.message });
        }
    }
    
    updateSummary() {
        const passCount = this.results.filter(r => r.status === 'pass').length;
        const failCount = this.results.filter(r => r.status === 'fail').length;
        const skipCount = this.results.filter(r => r.status === 'skip').length;
        
        document.getElementById('pass-count').textContent = passCount;
        document.getElementById('fail-count').textContent = failCount;
        document.getElementById('skip-count').textContent = skipCount;
        document.getElementById('summary').style.display = 'flex';
    }
}

const harness = new TestHarness();

// Assertion helpers
function assert(condition, message = 'Assertion failed') {
    if (!condition) throw new Error(message);
    return true;
}

function assertEqual(actual, expected, message = 'Values are not equal') {
    if (actual !== expected) throw new Error(`${message}: expected ${expected}, got ${actual}`);
    return true;
}

function assertDeepEqual(actual, expected, message = 'Objects are not deeply equal') {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
    return true;
}

function assertTrue(value, message = 'Value is not true') {
    return assert(value === true, message);
}

function assertFalse(value, message = 'Value is not false') {
    return assert(value === false, message);
}

async function runAllTests() {
    document.getElementById('summary').style.display = 'none';
    document.getElementById('test-container').innerHTML = '<p class="loading">A executar...</p>';
    await new Promise(resolve => setTimeout(resolve, 10));
    await harness.runAll();
}
