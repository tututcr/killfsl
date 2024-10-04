/* script.js */

// 获取元素
const hammer = document.getElementById('hammer');
const gameContainer = document.getElementById('game-container');
const startButton = document.getElementById('start-button');
const exitButton = document.getElementById('exit-button');
const leaderboardButton = document.getElementById('leaderboard-button');
const leaderboard = document.getElementById('leaderboard');
const leaderboardList = document.getElementById('leaderboard-list');

const backgroundMusic = document.getElementById('background-music');
const hitSound = document.getElementById('hit-sound');
const missSound = document.getElementById('miss-sound');

// 新增元素
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const nameModal = document.getElementById('name-modal');
const playerNameInput = document.getElementById('player-name');
const submitScoreButton = document.getElementById('submit-score');

// 游戏参数
const GAME_DURATION = 60; // 游戏时长，秒
const MOLE_APPEAR_INTERVAL = 1000; // 地鼠出现间隔，毫秒

let score = 0;
let timeLeft = GAME_DURATION;
let gameInterval;
let countdownInterval;
let moleTimeouts = [];
let isGameRunning = false;

// 预加载图片
const preloadImages = () => {
    const images = [
        'background.jpg',
        'hammer_up.png',
        'hammer_down.png',
        'mole.png',
        'mole_hit.png',
        'startbutton.png',
        'exitbutton.png',
        'leaderboard_bg.png',
        '排行榜.png'
    ];
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
};

// 初始化游戏
const initGame = () => {
    console.log('游戏初始化');
    // 清理之前的地鼠
    document.querySelectorAll('.mole').forEach(mole => mole.remove());
    score = 0;
    timeLeft = GAME_DURATION;
    updateScore();
    updateTimer();
    isGameRunning = true;
    backgroundMusic.currentTime = 0;
    backgroundMusic.play().catch(error => {
        console.log('背景音乐播放被阻止:', error);
    });

    // 开始地鼠出现的循环
    gameInterval = setInterval(() => {
        showMole();
    }, MOLE_APPEAR_INTERVAL);

    // 游戏计时器
    countdownInterval = setInterval(() => {
        timeLeft -= 1;
        updateTimer();
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            endGame();
        }
    }, 1000);
};

// 结束游戏
const endGame = () => {
    console.log('游戏结束');
    isGameRunning = false;
    clearInterval(gameInterval);
    clearInterval(countdownInterval);
    moleTimeouts.forEach(timeout => clearTimeout(timeout));
    moleTimeouts = [];
    backgroundMusic.pause();
    // 显示姓名输入模态框
    nameModal.style.display = 'flex';
};

// 显示排行榜
const showLeaderboard = () => {
    // 获取排行榜数据
    const leaderboardData = getLeaderboardData();

    // 清空当前列表
    leaderboardList.innerHTML = '';

    // 插入排行榜数据
    leaderboardData.forEach((entry, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${entry.name}: ${entry.score}`;
        leaderboardList.appendChild(li);
    });

    leaderboard.style.display = 'block';
};

// 隐藏排行榜
const hideLeaderboard = () => {
    leaderboard.style.display = 'none';
};

// 获取排行榜数据
const getLeaderboardData = () => {
    // 从localStorage获取数据
    const storedData = JSON.parse(localStorage.getItem('leaderboard')) || [];
    // 按分数排序，降序
    storedData.sort((a, b) => b.score - a.score);
    // 返回前10名
    return storedData.slice(0, 10);
};

// 保存分数到排行榜
const saveScore = (name, score) => {
    const storedData = JSON.parse(localStorage.getItem('leaderboard')) || [];
    storedData.push({ name, score });
    localStorage.setItem('leaderboard', JSON.stringify(storedData));
};

// 显示地鼠
const showMole = () => {
    if (!isGameRunning) return;

    const holes = document.querySelectorAll('.hole');
    const randomHole = holes[Math.floor(Math.random() * holes.length)];

    // 创建地鼠元素
    const mole = document.createElement('img');
    mole.src = 'mole.png';
    mole.classList.add('mole');
    mole.draggable = false; // 防止拖动

    // 设置地鼠位置
    mole.style.left = '0px';
    mole.style.top = '0px';
    randomHole.appendChild(mole);

    // 随机出现的时间
    const moleVisibleTime = Math.random() * 1500 + 500; // 500ms 到 2000ms

    // 地鼠自动消失
    const timeout = setTimeout(() => {
        if (randomHole.contains(mole)) {
            randomHole.removeChild(mole);
            if (isGameRunning) {
                missSound.play().catch(error => {
                    console.log('未击中音效播放被阻止:', error);
                });
            }
        }
    }, moleVisibleTime);

    moleTimeouts.push(timeout);

    // 点击地鼠事件
    mole.addEventListener('click', (e) => {
        e.preventDefault(); // 防止拖动
        if (!isGameRunning) return;
        score += 1;
        updateScore();
        hitSound.play().catch(error => {
            console.log('击中音效播放被阻止:', error);
        });
        mole.src = 'mole_hit.png';
        // 短暂延迟后移除地鼠
        setTimeout(() => {
            if (randomHole.contains(mole)) {
                randomHole.removeChild(mole);
            }
        }, 200);
    });
};

// 更新分数显示
const updateScore = () => {
    scoreDisplay.textContent = ` ${score}`;
};

// 更新时间显示
const updateTimer = () => {
    timerDisplay.textContent = ` ${timeLeft}s`;
};

// 更新hammer的位置和样式
const updateHammer = (e) => {
    // 设置hammer的位置
    const rect = gameContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    hammer.style.left = `${x}px`;
    hammer.style.top = `${y}px`;
};

// 切换hammer的图片
const setHammerImage = (isDown) => {
    hammer.src = isDown ? 'hammer_down.png' : 'hammer_up.png';
};

// 事件监听
document.addEventListener('mousemove', updateHammer);

// 防止地鼠被拖动
document.addEventListener('dragstart', (e) => {
    e.preventDefault();
});

// 锤子点击事件优化
document.addEventListener('mousedown', () => {
    setHammerImage(true);
});

document.addEventListener('mouseup', () => {
    setHammerImage(false);
});

// Start按钮点击
startButton.addEventListener('click', () => {
    if (isGameRunning) return;
    hideLeaderboard(); // 隐藏排行榜
    nameModal.style.display = 'none'; // 隐藏姓名输入模态框

    // 确保音频在用户交互后可以播放
    backgroundMusic.play().catch(error => {
        console.log('背景音乐播放被阻止:', error);
    });

    initGame();
});

// Exit按钮点击
exitButton.addEventListener('click', () => {
    // 关闭网页或重定向
    window.close(); // 注意：部分浏览器可能不允许脚本关闭窗口
    // 或者重定向到另一个页面
    window.location.href = 'about:blank';
});

// Leaderboard按钮点击
leaderboardButton.addEventListener('click', () => {
    if (isGameRunning) return; // 仅在游戏未进行时允许查看排行榜
    showLeaderboard();
});

// 提交分数按钮点击
submitScoreButton.addEventListener('click', () => {
    const playerName = playerNameInput.value.trim();
    if (playerName === '') {
        alert('请输入你的姓名！');
        return;
    }
    saveScore(playerName, score);
    nameModal.style.display = 'none';
    showLeaderboard();
});

// 初始化
window.onload = () => {
    preloadImages();
    hideLeaderboard();
    nameModal.style.display = 'none'; // 确保姓名输入模态框隐藏
};
// 页面加载完成后的逻辑，确保视频播放和界面切换
document.addEventListener('DOMContentLoaded', () => {
    const startMovie = document.getElementById('start-movie');
    const gameContainer = document.getElementById('game-container');

    // 当视频播放结束后，隐藏视频并显示游戏界面
    startMovie.addEventListener('ended', () => {
        startMovie.classList.add('hidden');  // 隐藏视频
        gameContainer.classList.remove('hidden');  // 显示游戏界面
    });

    // 如果需要在播放视频的同时加载游戏资源，可以在这里添加游戏加载逻辑
    // 比如异步加载资源或者初始化游戏
});
