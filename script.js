if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('ServiceWorker 注册成功:', registration.scope);
      })
      .catch((error) => {
        console.log('ServiceWorker 注册失败:', error);
      });
  });
}
const planInput = document.getElementById('planInput');
const addBtn = document.getElementById('addBtn');
const planList = document.getElementById('planList');
const statsText = document.getElementById('statsText');
const emptyTip = document.getElementById('emptyTip');
const celebrateModal = document.getElementById('celebrateModal');
const newDayBtn = document.getElementById('newDayBtn');
const clearAllBtn = document.getElementById('clearAllBtn');

let plans = loadPlans();

renderPlans();
updateStats();

function loadPlans() {
    const saved = localStorage.getItem('dailyPlans');
    return saved ? JSON.parse(saved) : [];
}

function savePlans() {
    localStorage.setItem('dailyPlans', JSON.stringify(plans));
}

function addPlan() {
    const text = planInput.value.trim();
    if (!text) return;

    const plan = {
        id: Date.now(),
        text: text,
        completed: false
    };

    plans.push(plan);
    savePlans();
    renderPlans();
    updateStats();

    planInput.value = '';
    planInput.focus();
}

function togglePlan(id) {
    const plan = plans.find(p => p.id === id);
    if (plan) {
        plan.completed = !plan.completed;
        savePlans();
        renderPlans();
        updateStats();
        checkAllCompleted();
    }
}

function deletePlan(id) {
    plans = plans.filter(p => p.id !== id);
    savePlans();
    renderPlans();
    updateStats();
}

function enterEditMode(li, plan) {
    const textSpan = li.querySelector('.plan-text');
    const originalText = plan.text;

    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'edit-input';
    editInput.value = originalText;

    const saveBtn = document.createElement('button');
    saveBtn.textContent = '保存';
    saveBtn.className = 'edit-save-btn';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '取消';
    cancelBtn.className = 'edit-cancel-btn';

    const editWrapper = document.createElement('div');
    editWrapper.className = 'edit-wrapper';
    editWrapper.appendChild(editInput);
    editWrapper.appendChild(saveBtn);
    editWrapper.appendChild(cancelBtn);

    li.replaceChild(editWrapper, textSpan);
    editInput.focus();
    editInput.select();

    function saveEdit() {
        const newText = editInput.value.trim();
        if (!newText) {
            alert('计划内容不能为空哦～');
            return;
        }
        plan.text = newText;
        savePlans();
        renderPlans();
    }

    function cancelEdit() {
        renderPlans();
    }

    saveBtn.addEventListener('click', saveEdit);
    cancelBtn.addEventListener('click', cancelEdit);

    editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveEdit();
        if (e.key === 'Escape') cancelEdit();
    });
}

function renderPlans() {
    planList.innerHTML = '';

    if (plans.length === 0) {
        emptyTip.classList.remove('hide');
        return;
    }

    emptyTip.classList.add('hide');

    plans.forEach(plan => {
        const li = document.createElement('li');
        li.className = 'plan-item' + (plan.completed ? ' completed' : '');

        const checkbox = document.createElement('div');
        checkbox.className = 'checkbox';
        checkbox.addEventListener('click', () => togglePlan(plan.id));

        const textSpan = document.createElement('span');
        textSpan.className = 'plan-text';
        textSpan.textContent = plan.text;
        textSpan.addEventListener('dblclick', () => enterEditMode(li, plan));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '🗑️';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deletePlan(plan.id);
        });

        li.appendChild(checkbox);
        li.appendChild(textSpan);
        li.appendChild(deleteBtn);
        planList.appendChild(li);
    });
}

function updateStats() {
    const total = plans.length;
    const completed = plans.filter(p => p.completed).length;
    statsText.textContent = `已完成 ${completed} / 共 ${total} 条`;
}

function checkAllCompleted() {
    if (plans.length === 0) return;

    const allDone = plans.every(p => p.completed);
    if (allDone) {
        setTimeout(() => {
            celebrateModal.classList.add('show');
        }, 300);
    }
}

function startNewDay() {
    plans = [];
    savePlans();
    renderPlans();
    updateStats();
    celebrateModal.classList.remove('show');
    planInput.focus();
}

function clearAll() {
    if (plans.length === 0) return;
    
    if (confirm('确定要清空所有计划吗？')) {
        plans = [];
        savePlans();
        renderPlans();
        updateStats();
    }
}
addBtn.addEventListener('click', addPlan);

planInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addPlan();
    }
});

newDayBtn.addEventListener('click', startNewDay);

clearAllBtn.addEventListener('click', clearAll);

celebrateModal.addEventListener('click', (e) => {
    if (e.target === celebrateModal) {
        celebrateModal.classList.remove('show');
    }
});

