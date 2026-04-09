let currentView = 'main';
let currentChild = null;

function showView(viewName) {
    document.querySelectorAll('.view, .main-view').forEach(el => {
        el.classList.add('hidden');
    });
    
    const viewElement = document.getElementById(viewName + 'View');
    if (viewElement) {
        viewElement.classList.remove('hidden');
    }
    currentView = viewName;
}

function showMain() {
    showView('main');
}

function showRegisterForm() {
    showView('register');
}

async function showShopSelection() {
    // 如果已经选择了宠物，直接进入商店
    if (currentChild) {
        await showShop();
        return;
    }
    
    // 否则先获取宠物列表让用户选择
    try {
        const response = await fetch('/get/pet/children');
        const children = await response.json();
        
        if (children.length === 0) {
            alert('❌ 还没有宠物，请先认领一个！');
            showRegisterForm();
            return;
        }
        
        if (children.length === 1) {
            // 只有一个宠物，直接选择
            currentChild = children[0].account;
            await showShop();
            return;
        }
        
        // 显示宠物选择界面
        showView('shop');
        document.getElementById('shopContent').innerHTML = `
            <h2>🛒 选择宠物进入商店</h2>
            <div class="pet-list">
                ${children.map(child => `
                    <div class="pet-list-item" onclick="selectChildForShop('${child.account}')">
                        <img src="${child.avatar}" alt="${child.name}">
                        <h3>${child.name}</h3>
                        <p>💰 积分: ${child.points}</p>
                        <p>🐾 ${getPetName(child.pet)}</p>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        alert('❌ 加载失败，请稍后再试');
    }
}

async function selectChildForShop(account) {
    currentChild = account;
    await showShop();
}

function toggleChildMenu() {
    const menu = document.getElementById('childMenu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

async function switchChild(account) {
    currentChild = account;
    await showShop();
}

async function showShop() {
    showView('shop');
    
    if (!currentChild) {
        document.getElementById('shopContent').innerHTML = '<p style="text-align:center;color:white;">请先选择一个宠物</p>';
        return;
    }
    
    try {
        // 获取所有小朋友列表用于切换
        const allChildrenResponse = await fetch('/get/pet/children');
        const allChildren = await allChildrenResponse.json();
        
        // 获取当前小朋友信息
        const response = await fetch(`/get/pet/child/${currentChild}`);
        const child = await response.json();
        
        if (child.error) {
            alert('❌ ' + child.error);
            return;
        }
        
        document.getElementById('shopContent').innerHTML = `
            <div class="shop-header">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2>🛒 宠物商店</h2>
                    ${allChildren.length > 1 ? `
                        <div class="child-switcher">
                            <div class="current-child" onclick="toggleChildMenu()">
                                <img src="${child.avatar}" alt="${child.name}" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid #f39c12; cursor: pointer;">
                                <span style="margin-left: 8px; color: white; font-weight: bold;">${child.name}</span>
                                <span style="margin-left: 5px; color: #f39c12;">▼</span>
                            </div>
                            <div id="childMenu" class="child-menu hidden">
                                ${allChildren.filter(c => c.account !== currentChild).map(c => `
                                    <div class="child-menu-item" onclick="switchChild('${c.account}')">
                                        <img src="${c.avatar}" alt="${c.name}" style="width: 30px; height: 30px; border-radius: 50%;">
                                        <span>${c.name}</span>
                                        <span style="color: #f39c12; font-size: 0.9em;">💰${c.points}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                <p>当前积分: <span style="color:#f39c12;">${child.points}</span></p>
            </div>
            
            <div class="shop-section">
                <h3>🍖 食物</h3>
                <div class="shop-items">
                    <div class="shop-item">
                        <div class="shop-item-icon">🥛</div>
                        <div class="shop-item-info">
                            <h4>牛奶</h4>
                            <p>+5g宠物粮</p>
                            <p class="shop-item-price">💰 2积分</p>
                        </div>
                        <button class="action-btn btn-buy" onclick="buyMilk()" ${child.points < 2 ? 'disabled' : ''}>购买</button>
                    </div>
                    <div class="shop-item">
                        <div class="shop-item-icon">🍖</div>
                        <div class="shop-item-info">
                            <h4>宠物粮</h4>
                            <p>+10g宠物粮</p>
                            <p class="shop-item-price">💰 10积分</p>
                        </div>
                        <button class="action-btn btn-buy" onclick="buyFood()" ${child.points < 10 ? 'disabled' : ''}>购买</button>
                    </div>
                </div>
            </div>
            
            ${child.pet.weight >= 50 ? `
                <div class="shop-section">
                    <h3>🎪 逗玩表演</h3>
                    <div class="shop-items">
                        <div class="shop-item">
                            <div class="shop-item-icon">🤗</div>
                            <div class="shop-item-info">
                                <h4>摸头</h4>
                                <p>温柔的抚摸</p>
                                <p class="shop-item-price">💰 3积分</p>
                            </div>
                            <button class="action-btn btn-perform" onclick="performShow('pet-head')" ${child.points < 3 ? 'disabled' : ''}>表演</button>
                        </div>
                        <div class="shop-item">
                            <div class="shop-item-icon">👌</div>
                            <div class="shop-item-info">
                                <h4>点头</h4>
                                <p>听话的点头</p>
                                <p class="shop-item-price">💰 2积分</p>
                            </div>
                            <button class="action-btn btn-perform" onclick="performShow('nod')" ${child.points < 2 ? 'disabled' : ''}>表演</button>
                        </div>
                        <div class="shop-item">
                            <div class="shop-item-icon">🤸</div>
                            <div class="shop-item-info">
                                <h4>倒立</h4>
                                <p>高难度动作</p>
                                <p class="shop-item-price">💰 5积分</p>
                            </div>
                            <button class="action-btn btn-perform" onclick="performShow('handstand')" ${child.points < 5 ? 'disabled' : ''}>表演</button>
                        </div>
                    </div>
                </div>
            ` : '<p style="text-align:center;color:#f39c12;">宠物需要达到50g才能表演哦！</p>'}
        `;
    } catch (error) {
        alert('❌ 加载商店失败，请稍后再试');
    }
}

async function registerChild(event) {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('name', document.getElementById('childName').value);
    formData.append('account', document.getElementById('childAccount').value);
    formData.append('petType', document.querySelector('input[name="petType"]:checked').value);
    
    const avatarFile = document.getElementById('avatar').files[0];
    if (avatarFile) {
        formData.append('avatar', avatarFile);
    }
    
    try {
        const response = await fetch('/post/pet/register', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.error) {
            alert('❌ ' + data.error);
        } else {
            alert('🎉 认领成功！快去看看你的宠物吧！');
            document.getElementById('registerForm').reset();
            showPetList();
        }
    } catch (error) {
        alert('❌ 网络错误，请稍后再试');
    }
}

async function showPetList() {
    showView('petList');
    
    try {
        const response = await fetch('/get/pet/children');
        const children = await response.json();
        
        const listElement = document.getElementById('petList');
        
        if (children.length === 0) {
            listElement.innerHTML = '<p style="text-align:center;color:white;font-size:1.5em;">还没有宠物哦，快去认领一个吧！</p>';
            return;
        }
        
        listElement.innerHTML = children.map(child => `
            <div class="pet-list-item" onclick="showPetDetail('${child.account}')">
                <img src="${child.avatar}" alt="${child.name}">
                <h3>${child.name}</h3>
                <p>💰 积分: ${child.points}</p>
                <p>🐾 ${getPetName(child.pet)}</p>
                <div class="pet-emoji-large">${getPetEmoji(child.pet)}</div>
            </div>
        `).join('');
    } catch (error) {
        alert('❌ 加载失败，请稍后再试');
    }
}

function getPetName(pet) {
    if (pet.type === 'snake') {
        return pet.stage === 'egg' ? '蛇蛋' : pet.stage === 'baby' ? '小青蛇' : '青蛇';
    } else {
        return pet.stage === 'embryo' ? '马胚胎' : pet.stage === 'foal' ? '小白马' : '白马';
    }
}

function getPetEmoji(pet) {
    if (pet.type === 'snake') {
        return pet.stage === 'egg' ? '🥚' : '🐍';
    } else {
        return pet.stage === 'embryo' ? '🤰' : '🐴';
    }
}

async function showPetDetail(account) {
    showView('petDetail');
    currentChild = account;
    await refreshPetDetail();
    
    setInterval(() => {
        if (currentView === 'petDetail' && currentChild === account) {
            checkHunger(account);
        }
    }, 5000);
}

async function refreshPetDetail() {
    try {
        const response = await fetch(`/get/pet/child/${currentChild}`);
        const child = await response.json();
        
        if (child.error) {
            alert('❌ ' + child.error);
            return;
        }
        
        const hungerResponse = await fetch(`/get/pet/check-hunger/${currentChild}`);
        const hungerData = await hungerResponse.json();
        
        const detailElement = document.getElementById('petDetail');
        detailElement.innerHTML = `
            <div class="pet-header">
                <img src="${child.avatar}" alt="${child.name}">
                <h2>👦 ${child.name}</h2>
                <p style="color:#666;">账户: ${child.account}</p>
            </div>
            
            ${hungerData.hungry ? `<div class="hunger-warning">🚨 ${hungerData.message}</div>` : ''}
            
            <div class="pet-stats">
                <div class="stat-item">
                    <span class="stat-label">💰 积分</span>
                    <span class="stat-value">${child.points}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">🐾 宠物</span>
                    <span class="stat-value">${getPetName(child.pet)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">⚖️ 体重</span>
                    <span class="stat-value">${child.pet.weight}g</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">🍖 宠物粮</span>
                    <span class="stat-value">${child.pet.food}g</span>
                </div>
            </div>
            
            <div style="text-align:center;margin:30px 0;">
                <div class="pet-emoji-large">${getPetEmoji(child.pet)}</div>
                ${child.pet.weight >= 50 ? '<p style="color:#1dd1a1;font-size:1.2em;">✨ 可以表演啦！</p>' : ''}
            </div>
            
            ${child.pet.weight > 0 ? `
                <div>
                    <p style="color:#667eea;font-weight:bold;margin-bottom:5px;">成长进度 (${child.pet.weight}/50g)</p>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width:${Math.min(child.pet.weight / 50 * 100, 100)}%"></div>
                    </div>
                </div>
            ` : ''}
            
            <div class="pet-actions">
                ${!child.pet.hatched ? `
                    <button class="action-btn btn-hatch" onclick="hatchPet()">
                        🥚 孵化/出生 (10积分)
                    </button>
                ` : ''}
                
                <button class="action-btn btn-buy-food" onclick="showShop()">
                    🛒 商店
                </button>
                
                ${child.pet.hatched ? `
                    <button class="action-btn btn-feed" onclick="feedPet()" ${child.pet.food < 10 ? 'disabled' : ''}>
                        🍖 喂食 (10g粮)
                    </button>
                ` : ''}
                
                <button class="action-btn btn-add-points" onclick="showAddPointsModal()">
                    ➕ 添加积分
                </button>
            </div>
        `;
    } catch (error) {
        alert('❌ 加载失败，请稍后再试');
    }
}

async function hatchPet() {
    if (!confirm('确定要孵化/出生吗？需要消耗10个积分')) {
        return;
    }
    
    try {
        const response = await fetch(`/post/pet/child/${currentChild}/hatch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        
        if (data.error) {
            alert('❌ ' + data.error);
        } else {
            alert('🎉 孵化/出生成功！');
            await refreshPetDetail();
        }
    } catch (error) {
        alert('❌ 操作失败，请稍后再试');
    }
}

async function buyFood() {
    if (!confirm('确定要购买宠物粮吗？10积分 = 10g宠物粮')) {
        return;
    }
    
    try {
        const response = await fetch(`/post/pet/child/${currentChild}/buy-food`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        
        if (data.error) {
            alert('❌ ' + data.error);
        } else {
            alert('🎉 购买成功！获得10g宠物粮');
            if (currentView === 'shop') {
                await showShop();
            } else {
                await refreshPetDetail();
            }
        }
    } catch (error) {
        alert('❌ 操作失败，请稍后再试');
    }
}

async function buyMilk() {
    if (!confirm('确定要购买牛奶吗？2积分 = 5g宠物粮')) {
        return;
    }
    
    try {
        const response = await fetch(`/post/pet/child/${currentChild}/buy-milk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        
        if (data.error) {
            alert('❌ ' + data.error);
        } else {
            alert('🎉 购买成功！获得5g宠物粮 🥛');
            if (currentView === 'shop') {
                await showShop();
            } else {
                await refreshPetDetail();
            }
        }
    } catch (error) {
        alert('❌ 操作失败，请稍后再试');
    }
}

async function feedPet() {
    const amount = 10;
    
    if (!confirm(`确定要喂食吗？将消耗${amount}g宠物粮`)) {
        return;
    }
    
    try {
        const response = await fetch(`/post/pet/child/${currentChild}/feed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
        });
        
        const data = await response.json();
        
        if (data.error) {
            alert('❌ ' + data.error);
        } else {
            alert('🎉 喂食成功！宠物长重了！');
            await refreshPetDetail();
        }
    } catch (error) {
        alert('❌ 操作失败，请稍后再试');
    }
}

async function performShow(performType = 'nod') {
    try {
        const response = await fetch(`/post/pet/child/${currentChild}/perform`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ performType })
        });
        
        const data = await response.json();
        
        if (data.error) {
            alert('❌ ' + data.error);
        } else {
            const performanceNames = {
                'pet-head': '摸头',
                'nod': '点头',
                'handstand': '倒立'
            };
            
            showModal(`
                <div class="performance-animation">
                    <h2>🎪 精彩表演</h2>
                    <div class="performance-emoji">${data.emoji}</div>
                    <p style="font-size:1.5em;margin-top:20px;">${data.performance}！</p>
                    <p style="color:#666;margin-top:10px;">消耗${performType === 'pet-head' ? 3 : performType === 'nod' ? 2 : 5}个积分</p>
                </div>
            `);
            
            setTimeout(() => {
                closeModal();
                if (currentView === 'shop') {
                    showShop();
                } else {
                    refreshPetDetail();
                }
            }, 2000);
        }
    } catch (error) {
        alert('❌ 操作失败，请稍后再试');
    }
}

function showAddPointsModal() {
    showModal(`
        <h2>➕ 添加积分</h2>
        <form onsubmit="addPoints(event)">
            <input type="password" id="adminPassword" placeholder="请输入管理员密码" required>
            <input type="number" id="pointsToAdd" placeholder="要添加的积分数" min="1" required>
            <button type="submit">确认添加</button>
        </form>
    `);
}

async function addPoints(event) {
    event.preventDefault();
    
    const password = document.getElementById('adminPassword').value;
    const points = parseInt(document.getElementById('pointsToAdd').value);
    
    try {
        const response = await fetch(`/post/pet/child/${currentChild}/add-points`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password, points })
        });
        
        const data = await response.json();
        
        if (data.error) {
            alert('❌ ' + data.error);
        } else {
            alert(`🎉 成功添加${points}个积分！`);
            closeModal();
            await refreshPetDetail();
        }
    } catch (error) {
        alert('❌ 操作失败，请稍后再试');
    }
}

async function checkHunger(account) {
    try {
        const response = await fetch(`/get/pet/check-hunger/${account}`);
        const data = await response.json();
        
        if (data.hungry && currentView === 'petDetail') {
            await refreshPetDetail();
        }
    } catch (error) {
        console.error('检查饥饿状态失败');
    }
}

function showModal(content) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = content;
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
}
