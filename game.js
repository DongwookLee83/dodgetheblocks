class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.startButton = document.getElementById('startButton');
        this.scoreElement = document.getElementById('score');
        this.collisionSound = document.getElementById('collisionSound');
        
        this.player = {
            x: 0,
            y: 0,
            width: 40,
            height: 60,
            speed: 5
        };
        
        this.blocks = [];
        this.score = 0;
        this.gameLoop = null;
        this.isGameOver = false;
        this.blockSpeed = 3;
        this.blockSpawnInterval = 1500;
        this.lastBlockSpawn = 0;
        
        this.resizeCanvas();
        this.setupEventListeners();
    }
    
    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.player.x = (this.canvas.width - this.player.width) / 2;
        this.player.y = this.canvas.height - this.player.height - 20;
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // 터치 이벤트 처리
        let touchStartX = 0;
        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            if (this.isGameOver) return;
            const touchX = e.touches[0].clientX;
            const diff = touchX - touchStartX;
            
            this.player.x += diff * 0.5;
            touchStartX = touchX;
            
            // 경계 체크
            if (this.player.x < 0) this.player.x = 0;
            if (this.player.x > this.canvas.width - this.player.width) {
                this.player.x = this.canvas.width - this.player.width;
            }
        });
        
        this.startButton.addEventListener('click', () => this.startGame());
    }
    
    startGame() {
        this.blocks = [];
        this.score = 0;
        this.isGameOver = false;
        this.blockSpeed = 3;
        this.blockSpawnInterval = 1500;
        this.lastBlockSpawn = 0;
        this.scoreElement.textContent = '0';
        this.startButton.style.display = 'none';
        
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        this.gameLoop = requestAnimationFrame(() => this.update());
    }
    
    spawnBlock() {
        const now = Date.now();
        if (now - this.lastBlockSpawn > this.blockSpawnInterval) {
            const block = {
                x: Math.random() * (this.canvas.width - 30),
                y: -30,
                width: 30,
                height: 30
            };
            this.blocks.push(block);
            this.lastBlockSpawn = now;
        }
    }
    
    update() {
        if (this.isGameOver) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 블록 생성
        this.spawnBlock();
        
        // 블록 업데이트 및 그리기
        this.blocks = this.blocks.filter(block => {
            block.y += this.blockSpeed;
            
            // 충돌 체크
            if (this.checkCollision(block)) {
                this.gameOver();
                return false;
            }
            
            // 화면 밖으로 나간 블록 제거
            if (block.y > this.canvas.height) {
                this.score += 10;
                this.scoreElement.textContent = this.score;
                
                // 난이도 증가
                if (this.score % 100 === 0) {
                    this.blockSpeed += 0.5;
                    this.blockSpawnInterval = Math.max(500, this.blockSpawnInterval - 100);
                }
                return false;
            }
            
            this.ctx.fillStyle = '#ff4444';
            this.ctx.fillRect(block.x, block.y, block.width, block.height);
            return true;
        });
        
        // 플레이어 그리기
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        this.gameLoop = requestAnimationFrame(() => this.update());
    }
    
    checkCollision(block) {
        return !(block.x + block.width < this.player.x ||
                block.x > this.player.x + this.player.width ||
                block.y + block.height < this.player.y ||
                block.y > this.player.y + this.player.height);
    }
    
    gameOver() {
        this.isGameOver = true;
        this.collisionSound.play();
        this.startButton.style.display = 'block';
        this.startButton.textContent = 'Game Over - Play Again';
    }
}

// 게임 인스턴스 생성
const game = new Game(); 