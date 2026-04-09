const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'public/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

const DATA_FILE = '/usr/local/apache2/be/pet/data.json';
const ADMIN_PASSWORD = '123456';

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }
  return { children: [] };
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.post('/post/pet/register', upload.single('avatar'), (req, res) => {
  const { name, account, petType } = req.body;
  const data = loadData();
  
  if (data.children.find(c => c.account === account)) {
    return res.status(400).json({ error: '账户已存在' });
  }
  
  const child = {
    name,
    account,
    avatar: req.file ? `/uploads/${req.file.filename}` : '/default-avatar.png',
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
  saveData(data);
  res.json({ success: true, child });
});

app.get('/get/pet/children', (req, res) => {
  const data = loadData();
  res.json(data.children);
});

app.get('/get/pet/child/:account', (req, res) => {
  const data = loadData();
  const child = data.children.find(c => c.account === req.params.account);
  if (!child) {
    return res.status(404).json({ error: '未找到该账户' });
  }
  res.json(child);
});

app.post('/post/pet/child/:account/add-points', (req, res) => {
  const { password, points } = req.body;
  if (password !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: '密码错误' });
  }
  
  const data = loadData();
  const child = data.children.find(c => c.account === req.params.account);
  if (!child) {
    return res.status(404).json({ error: '未找到该账户' });
  }
  
  child.points += parseInt(points);
  saveData(data);
  res.json({ success: true, child });
});

app.post('/post/pet/child/:account/hatch', (req, res) => {
  const data = loadData();
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
  saveData(data);
  res.json({ success: true, child });
});

app.post('/post/pet/child/:account/buy-food', (req, res) => {
  const data = loadData();
  const child = data.children.find(c => c.account === req.params.account);
  if (!child) {
    return res.status(404).json({ error: '未找到该账户' });
  }
  
  if (child.points < 10) {
    return res.status(400).json({ error: '积分不足，需要10个积分' });
  }
  
  child.points -= 10;
  child.pet.food += 10;
  saveData(data);
  res.json({ success: true, child });
});

app.post('/post/pet/child/:account/feed', (req, res) => {
  const { amount } = req.body;
  const data = loadData();
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
  
  if (child.pet.weight >= 50 && child.pet.stage !== 'adult') {
    child.pet.stage = 'adult';
  }
  
  saveData(data);
  res.json({ success: true, child });
});

app.post('/post/pet/child/:account/perform', (req, res) => {
  const { performType } = req.body;
  const data = loadData();
  const child = data.children.find(c => c.account === req.params.account);
  if (!child) {
    return res.status(404).json({ error: '未找到该账户' });
  }
  
  if (child.pet.weight < 50) {
    return res.status(400).json({ error: '宠物还不够重，需要50g才能表演' });
  }
  
  const performances = {
    'pet-head': { name: '摸头', cost: 3, emoji: '🤗' },
    'nod': { name: '点头', cost: 2, emoji: '👌' },
    'handstand': { name: '倒立', cost: 5, emoji: '🤸' }
  };
  
  const perf = performances[performType] || performances['nod'];
  
  if (child.points < perf.cost) {
    return res.status(400).json({ error: `积分不足，需要${perf.cost}个积分` });
  }
  
  child.points -= perf.cost;
  saveData(data);
  res.json({ success: true, child, performance: perf.name, emoji: perf.emoji });
});

app.post('/post/pet/child/:account/buy-milk', (req, res) => {
  const data = loadData();
  const child = data.children.find(c => c.account === req.params.account);
  if (!child) {
    return res.status(404).json({ error: '未找到该账户' });
  }
  
  if (child.points < 2) {
    return res.status(400).json({ error: '积分不足，需要2个积分' });
  }
  
  child.points -= 2;
  child.pet.food += 5;
  saveData(data);
  res.json({ success: true, child });
});

app.get('/get/pet/check-hunger/:account', (req, res) => {
  const data = loadData();
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
  console.log(`宠物养成游戏服务器运行在 http://localhost:${PORT}`);
});
