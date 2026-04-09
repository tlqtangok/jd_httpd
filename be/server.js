const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const crypto = require('crypto');
const multer = require('multer');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer配置 - 用于宠物头像上传
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = '/usr/local/apache2/htdocs/pet/uploads';
        if (!fsSync.existsSync(uploadDir)) {
            fsSync.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

const USER_DATA_FILE = '/usr/local/apache2/uploads/user_info.json';
const PET_DATA_FILE = '/usr/local/apache2/uploads/pet_data.json';
const ADMIN_PASSWORD = '123456';
const tokens = new Map();

async function loadUsers() {
    try {
        const data = await fs.readFile(USER_DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

async function saveUsers(users) {
    try {
        await fs.mkdir(path.dirname(USER_DATA_FILE), { recursive: true });
        await fs.writeFile(USER_DATA_FILE, JSON.stringify(users, null, 4));
    } catch (error) {
        console.error('Error saving users:', error);
    }
}

function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

function isTokenValid(token) {
    const tokenData = tokens.get(token);
    if (!tokenData) return false;
    
    const now = Date.now();
    if (now - tokenData.createdAt > 60000) {
        tokens.delete(token);
        return false;
    }
    return true;
}

app.post('/post/register', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password required' });
    }
    
    const users = await loadUsers();
    
    if (users[username]) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    users[username] = password;
    await saveUsers(users);
    
    res.json({ success: true, message: 'Registration successful' });
});

app.post('/post/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password required' });
    }
    
    const users = await loadUsers();
    
    if (users[username] !== password) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = generateToken();
    tokens.set(token, { username, createdAt: Date.now() });
    
    res.json({ success: true, token });
});

app.get('/get/verify', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token || !isTokenValid(token)) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    
    const tokenData = tokens.get(token);
    res.json({ success: true, username: tokenData.username });
});

// ProxyPass test endpoints
const OUTPUT_FILE_FORM = '/usr/local/apache2/htdocs/inputstr.txt';
const OUTPUT_FILE_JSON = '/usr/local/apache2/htdocs/inputstr_post.txt';

app.post('/post/uri', (req, res) => {
    try {
        const inputstr = req.body.inputstr || '';
        fsSync.appendFileSync(OUTPUT_FILE_FORM, inputstr + '\n');
        res.send(`[ProxyPass-URI] String "${inputstr}" saved at ${new Date().toISOString()}`);
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
});

app.post('/post/json', (req, res) => {
    try {
        const inputstr = req.body.inputstr || '';
        fsSync.appendFileSync(OUTPUT_FILE_JSON, inputstr + '\n');
        res.send(`[ProxyPass-JSON] String "${inputstr}" saved to ${OUTPUT_FILE_JSON} at ${new Date().toISOString()}`);
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
});

app.get('/get/param', (req, res) => {
    try {
        const inputstr = req.query.inputstr || '';
        if (!inputstr) {
            return res.status(400).send('Error: Missing inputstr parameter');
        }
        fsSync.appendFileSync(OUTPUT_FILE_FORM, inputstr + '\n');
        res.send(`[ProxyPass-GET] String "${inputstr}" saved at ${new Date().toISOString()}`);
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
});

// Test endpoint to demonstrate automatic ProxyPass (no httpd.conf edit needed!)
app.get('/get/test', (req, res) => {
    res.json({ 
        message: 'This endpoint works automatically!',
        pattern: 'ProxyPassMatch catches all /get/* and /post/*',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// 宠物养成游戏 API - Pet Game APIs
// ============================================

// 宠物数据加载/保存函数
function loadPetData() {
    if (fsSync.existsSync(PET_DATA_FILE)) {
        return JSON.parse(fsSync.readFileSync(PET_DATA_FILE, 'utf8'));
    }
    return { children: [] };
}

function savePetData(data) {
    fsSync.writeFileSync(PET_DATA_FILE, JSON.stringify(data, null, 2));
}

// 注册小朋友和创建宠物
app.post('/post/pet/register', upload.single('avatar'), (req, res) => {
    const { name, account, petType } = req.body;
    const data = loadPetData();
    
    if (data.children.find(c => c.account === account)) {
        return res.status(400).json({ error: '账户已存在' });
    }
    
    const child = {
        name,
        account,
        avatar: req.file ? `/pet/uploads/${req.file.filename}` : '/pet/default-avatar.png',
        points: 0,
        pet: {
            type: petType,
            stage: petType === 'snake' ? 'egg' : 'embryo',
            weight: 0,
            food: 0,
            hatched: false,
            lastFeedTime: Date.now()
        },
        createdAt: Date.now()
    };
    
    data.children.push(child);
    savePetData(data);
    res.json({ success: true, child });
});

// 获取所有小朋友列表
app.get('/get/pet/children', (req, res) => {
    const data = loadPetData();
    res.json(data.children);
});

// 获取特定小朋友信息
app.get('/get/pet/child/:account', (req, res) => {
    const data = loadPetData();
    const child = data.children.find(c => c.account === req.params.account);
    if (!child) {
        return res.status(404).json({ error: '未找到该账户' });
    }
    res.json(child);
});

// 管理员添加积分
app.post('/post/pet/child/:account/add-points', (req, res) => {
    const { password, points } = req.body;
    if (password !== ADMIN_PASSWORD) {
        return res.status(403).json({ error: '密码错误' });
    }
    
    const data = loadPetData();
    const child = data.children.find(c => c.account === req.params.account);
    if (!child) {
        return res.status(404).json({ error: '未找到该账户' });
    }
    
    child.points += parseInt(points);
    savePetData(data);
    res.json({ success: true, child });
});

// 孵化/出生宠物
app.post('/post/pet/child/:account/hatch', (req, res) => {
    const data = loadPetData();
    const child = data.children.find(c => c.account === req.params.account);
    if (!child) {
        return res.status(404).json({ error: '未找到该账户' });
    }
    
    if (child.pet.hatched) {
        return res.status(400).json({ error: '宠物已经孵化/出生' });
    }
    
    if (child.points < 10) {
        return res.status(400).json({ error: '积分不足，需要10个积分' });
    }
    
    child.points -= 10;
    child.pet.hatched = true;
    child.pet.stage = child.pet.type === 'snake' ? 'baby' : 'foal';
    child.pet.weight = 0;
    savePetData(data);
    res.json({ success: true, child });
});

// 购买宠物粮
app.post('/post/pet/child/:account/buy-food', (req, res) => {
    const data = loadPetData();
    const child = data.children.find(c => c.account === req.params.account);
    if (!child) {
        return res.status(404).json({ error: '未找到该账户' });
    }
    
    if (child.points < 10) {
        return res.status(400).json({ error: '积分不足，需要10个积分' });
    }
    
    child.points -= 10;
    child.pet.food += 10;
    savePetData(data);
    res.json({ success: true, child });
});

// 购买牛奶
app.post('/post/pet/child/:account/buy-milk', (req, res) => {
    const data = loadPetData();
    const child = data.children.find(c => c.account === req.params.account);
    if (!child) {
        return res.status(404).json({ error: '未找到该账户' });
    }
    
    if (child.points < 2) {
        return res.status(400).json({ error: '积分不足，需要2个积分' });
    }
    
    child.points -= 2;
    child.pet.food += 5;
    savePetData(data);
    res.json({ success: true, child });
});

// 喂养宠物
app.post('/post/pet/child/:account/feed', (req, res) => {
    const { amount } = req.body;
    const data = loadPetData();
    const child = data.children.find(c => c.account === req.params.account);
    if (!child) {
        return res.status(404).json({ error: '未找到该账户' });
    }
    
    if (!child.pet.hatched) {
        return res.status(400).json({ error: '宠物还未孵化/出生' });
    }
    
    if (child.pet.food < amount) {
        return res.status(400).json({ error: '宠物粮不足' });
    }
    
    child.pet.food -= amount;
    child.pet.weight += amount;
    child.pet.lastFeedTime = Date.now();
    
    // 成长阶段判定
    if (child.pet.weight >= 50 && child.pet.stage !== 'adult') {
        child.pet.stage = 'adult';
    }
    
    savePetData(data);
    res.json({ success: true, child });
});

// 宠物表演
app.post('/post/pet/child/:account/perform', (req, res) => {
    const { performType = 'nod' } = req.body;
    const data = loadPetData();
    const child = data.children.find(c => c.account === req.params.account);
    if (!child) {
        return res.status(404).json({ error: '未找到该账户' });
    }
    
    if (child.pet.weight < 50) {
        return res.status(400).json({ error: '宠物还不够重，需要50g才能表演' });
    }
    
    // 定义表演类型及其积分消耗
    const performTypes = {
        'pet-head': { cost: 3, name: '摸头', emoji: '🤗' },
        'nod': { cost: 2, name: '点头', emoji: '👌' },
        'handstand': { cost: 5, name: '倒立', emoji: '🤸' }
    };
    
    const perform = performTypes[performType];
    if (!perform) {
        return res.status(400).json({ error: '未知的表演类型' });
    }
    
    if (child.points < perform.cost) {
        return res.status(400).json({ error: `积分不足，需要${perform.cost}个积分` });
    }
    
    child.points -= perform.cost;
    savePetData(data);
    
    // 根据宠物类型生成表演内容
    let performance = '';
    if (performType === 'pet-head') {
        performance = child.pet.type === 'snake' ? '青蛇摇头晃脑，享受摸头' : '白马低头蹭手，很是温顺';
    } else if (performType === 'nod') {
        performance = child.pet.type === 'snake' ? '青蛇点头示意' : '白马频频点头';
    } else if (performType === 'handstand') {
        performance = child.pet.type === 'snake' ? '青蛇立起身子，精彩倒立' : '白马前蹄腾空，马上倒立';
    }
    
    res.json({ 
        success: true, 
        child, 
        performance: performance,
        emoji: perform.emoji
    });
});

// 检查宠物饥饿状态
app.get('/get/pet/check-hunger/:account', (req, res) => {
    const data = loadPetData();
    const child = data.children.find(c => c.account === req.params.account);
    if (!child || !child.pet.hatched) {
        return res.json({ hungry: false });
    }
    
    const hoursSinceLastFeed = (Date.now() - child.pet.lastFeedTime) / (1000 * 60 * 60);
    const dailyFoodNeeded = 5;
    const foodConsumed = Math.floor(hoursSinceLastFeed / 24) * dailyFoodNeeded;
    
    if (foodConsumed > 0 && child.pet.food < dailyFoodNeeded) {
        return res.json({ hungry: true, message: '我饿了！快喂我！' });
    }
    
    res.json({ hungry: false });
});

app.listen(PORT, () => {
    console.log(`Unified backend server running on http://localhost:${PORT}`);
    console.log(`Pet game API ready at /post/pet/* and /get/pet/*`);
});

