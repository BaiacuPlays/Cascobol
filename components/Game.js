// Game State
class CascobolGame {
    constructor() {
        // Initialize when DOM is ready
        if (typeof document !== 'undefined') {
            this.initializeGame();
        }
    }

    initializeGame() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupGame();
            });
        } else {
            this.setupGame();
        }
    }

    setupGame() {
        console.log('Setting up game...');
        console.log('DOM ready state:', document.readyState);
        console.log('All canvas elements:', document.querySelectorAll('canvas'));

        this.canvas = document.getElementById('gameCanvas');
        console.log('Canvas element found:', !!this.canvas);

        if (!this.canvas) {
            console.log('Canvas not found, retrying in 100ms...');
            setTimeout(() => this.setupGame(), 100);
            return;
        }

        // Check if canvas is visible
        const gameScreen = document.getElementById('gameScreen');
        console.log('Game screen found:', !!gameScreen);
        console.log('Game screen display:', gameScreen ? window.getComputedStyle(gameScreen).display : 'not found');
        console.log('Canvas parent display:', window.getComputedStyle(this.canvas.parentElement).display);

        this.ctx = this.canvas.getContext('2d');

        // Set canvas size to fixed dimensions
        this.FIELD_WIDTH = 1000;  // Largura fixa do campo
        this.FIELD_HEIGHT = 600;  // Altura fixa do campo

        this.canvas.width = this.FIELD_WIDTH;
        this.canvas.height = this.FIELD_HEIGHT;

        // Ensure canvas is properly styled
        this.canvas.style.display = 'block';
        this.canvas.style.backgroundColor = '#228B22'; // Game field color

        // Remove window resize listener to prevent field resizing

        console.log('Canvas found and context created!');
        console.log('Canvas dimensions:', this.canvas.width, 'x', this.canvas.height);
        console.log('Canvas computed style:', window.getComputedStyle(this.canvas).display);

        // Initial render to show the field immediately
        console.log('=== INITIAL FIELD RENDER ===');
        this.render();
        console.log('Initial field render completed');

        // Draw field immediately and start continuous rendering
        console.log('About to render field...');
        this.render();
        console.log('Field rendered!');

        // Force a second render after a delay to ensure visibility
        setTimeout(() => {
            console.log('=== FORCED SECOND RENDER ===');
            this.render();
        }, 500);

        // Game state
        this.gameState = 'menu'; // menu, playing, ended, resetting, celebrating
        this.gameStartTime = 0;
        this.gameTime = 0;
        this.isResetting = false;
        this.resetStartTime = 0;
        this.resetDuration = 2000; // 2 segundos para reset

        // Sistema de comemoração
        this.isCelebrating = false;
        this.celebrationStartTime = 0;
        this.celebrationDuration = 3000; // 3 segundos de comemoração
        this.celebratingPlayer = null;
        this.cameraZoom = 1;
        this.cameraX = 0;
        this.cameraY = 0;
        this.targetZoom = 1;
        this.targetCameraX = 0;
        this.targetCameraY = 0;

        // Sistema de comemoração de gol
        this.goalCelebration = {
            isActive: false,
            phase: 'none', // 'waiting_ball_stop', 'zooming', 'celebrating', 'resetting'
            goalScorer: null,
            startTime: 0,
            ballStoppedTime: 0,
            waitAfterBallStops: 1000, // 1 segundo após a bola parar
            zoomDuration: 1500, // 1.5 segundos de zoom
            celebrationDuration: 2000, // 2 segundos de comemoração
            resetDuration: 1000 // 1 segundo para reset
        };

        // Teams
        this.team1 = {
            goombas: 7,
            color: '#DC143C',
            lightColor: '#FF6B6B'
        };

        this.team2 = {
            goombas: 7,
            color: '#4169E1',
            lightColor: '#6495ED'
        };

        // Players (4 players total - 2v2) - Posições fixas baseadas no campo 1000x600
        this.players = [
            // Team 1 (Red)
            {
                id: 1,
                x: 200,  // Posição fixa no campo
                y: 250,  // Posição fixa no campo
                vx: 0,
                vy: 0,
                radius: 18,
                team: 1,
                color: this.team1.color,
                lightColor: this.team1.lightColor,
                controls: {
                    up: 'KeyW',
                    down: 'KeyS',
                    left: 'KeyA',
                    right: 'KeyD',
                    action: 'Space',
                    steal: 'ShiftLeft'
                },
                // Slide tackle properties
                isSliding: false,
                slideDirection: { x: 0, y: 0 },
                slideSpeed: 0,
                slideDuration: 0,
                slideMaxDuration: 300, // 300ms slide
                slideCooldown: 0,
                slideMaxCooldown: 2000, // 2 second cooldown
                isStunned: false,
                stunnedTime: 0,
                maxStunnedTime: 1000 // 1 second stun
            },
            {
                id: 2,
                x: 200,  // Posição fixa no campo
                y: 350,  // Posição fixa no campo
                vx: 0,
                vy: 0,
                radius: 18,
                team: 1,
                color: this.team1.color,
                lightColor: this.team1.lightColor,
                controls: {
                    up: 'KeyT',
                    down: 'KeyG',
                    left: 'KeyF',
                    right: 'KeyH',
                    action: 'KeyR',
                    steal: 'KeyQ'
                },
                // Slide tackle properties
                isSliding: false,
                slideDirection: { x: 0, y: 0 },
                slideSpeed: 0,
                slideDuration: 0,
                slideMaxDuration: 300,
                slideCooldown: 0,
                slideMaxCooldown: 2000,
                isStunned: false,
                stunnedTime: 0,
                maxStunnedTime: 1000
            },
            // Team 2 (Blue)
            {
                id: 3,
                x: 800,  // Posição fixa no campo
                y: 250,  // Posição fixa no campo
                vx: 0,
                vy: 0,
                radius: 18,
                team: 2,
                color: this.team2.color,
                lightColor: this.team2.lightColor,
                controls: {
                    up: 'ArrowUp',
                    down: 'ArrowDown',
                    left: 'ArrowLeft',
                    right: 'ArrowRight',
                    action: 'Enter',
                    steal: 'ShiftRight'
                },
                // Slide tackle properties
                isSliding: false,
                slideDirection: { x: 0, y: 0 },
                slideSpeed: 0,
                slideDuration: 0,
                slideMaxDuration: 300,
                slideCooldown: 0,
                slideMaxCooldown: 2000,
                isStunned: false,
                stunnedTime: 0,
                maxStunnedTime: 1000
            },
            {
                id: 4,
                x: 800,  // Posição fixa no campo
                y: 350,  // Posição fixa no campo
                vx: 0,
                vy: 0,
                radius: 18,
                team: 2,
                color: this.team2.color,
                lightColor: this.team2.lightColor,
                controls: {
                    up: 'KeyI',
                    down: 'KeyK',
                    left: 'KeyJ',
                    right: 'KeyL',
                    action: 'KeyO',
                    steal: 'KeyU'
                },
                // Slide tackle properties
                isSliding: false,
                slideDirection: { x: 0, y: 0 },
                slideSpeed: 0,
                slideDuration: 0,
                slideMaxDuration: 300,
                slideCooldown: 0,
                slideMaxCooldown: 2000,
                isStunned: false,
                stunnedTime: 0,
                maxStunnedTime: 1000
            }
        ];

        // Shell (mais rápida e responsiva) - Posição fixa no centro do campo
        this.shell = {
            x: 500,  // Centro do campo 1000x600
            y: 300,  // Centro do campo 1000x600
            vx: 0,
            vy: 0,
            radius: 16,
            owner: null,
            lastOwner: null,
            speed: 12 // Velocidade base aumentada
        };

        // Sistema de movimento e chute 360°
        this.kickSystem = {
            isCharging: false,
            chargingPlayer: null,
            chargeStartTime: 0,
            maxChargeTime: 1500, // 1.5 segundos para carga máxima
            minPower: 3,
            maxPower: 15
        };



        // Goombas positions
        this.goombaPositions = {
            team1: [],
            team2: []
        };

        this.initializeGoombas();

        // Controls
        this.keys = {};
        this.setupControls();

        // Setup UI with a delay to ensure DOM is ready
        setTimeout(() => {
            this.setupUI();
        }, 500);

        // Game loop
        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);

        // Start rendering immediately to show the field
        this.startRendering();
    }

    initializeGoombas() {
        // Usa dimensões fixas do campo
        const fieldMargin = 60;
        const fieldWidth = this.FIELD_WIDTH - fieldMargin * 2;
        const fieldHeight = this.FIELD_HEIGHT - fieldMargin * 2;
        const fieldX = fieldMargin;
        const fieldY = fieldMargin;

        // Posições dos Goombas nas zonas protegidas (como na referência)
        const borderOffset = 25;
        const goombaSize = 20;

        // Team 1 goombas (lado direito - azul) - 7 goombas distribuídos verticalmente
        this.goombaPositions.team1 = [];
        for (let i = 0; i < 7; i++) {
            this.goombaPositions.team1.push({
                x: fieldX + fieldWidth - borderOffset - goombaSize/2,
                y: fieldY + borderOffset + (i * (fieldHeight - 2 * borderOffset) / 6),
                active: true
            });
        }

        // Team 2 goombas (lado esquerdo - vermelho) - 7 goombas distribuídos verticalmente
        this.goombaPositions.team2 = [];
        for (let i = 0; i < 7; i++) {
            this.goombaPositions.team2.push({
                x: fieldX + borderOffset + goombaSize/2,
                y: fieldY + borderOffset + (i * (fieldHeight - 2 * borderOffset) / 6),
                active: true
            });
        }
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            // Prevent default for all game keys
            const gameKeys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ShiftLeft', 'KeyT', 'KeyG', 'KeyF', 'KeyH', 'KeyR', 'KeyQ',
                             'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'ShiftRight', 'KeyI', 'KeyK', 'KeyJ', 'KeyL', 'KeyO', 'KeyU'];
            if (gameKeys.includes(e.code)) {
                e.preventDefault();
            }

            // Start charging kick (apenas se não estiver resetando, comemorando ou travado)
            if (!this.isResetting && !this.isCelebrating && !this.playersLocked) {
                this.players.forEach(player => {
                    if (e.code === player.controls.action) {
                        if (this.shell.owner === player && !this.kickSystem.isCharging) {
                            this.startKickCharge(player);
                        }
                    }

                    // Try to slide tackle
                    if (e.code === player.controls.steal) {
                        this.attemptSlideTackle(player);
                    }
                });
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;

            // Release kick (apenas se não estiver resetando, comemorando ou travado)
            if (!this.isResetting && !this.isCelebrating && !this.playersLocked) {
                this.players.forEach(player => {
                    if (e.code === player.controls.action && this.kickSystem.chargingPlayer === player) {
                        this.releaseKick();
                    }
                });
            }
        });
    }

    setupUI() {
        console.log('Setting up UI...');

        const startButton = document.getElementById('startButton');
        if (startButton) {
            console.log('Start button found, adding event listener');
            startButton.addEventListener('click', () => {
                console.log('Start button clicked!');
                this.startGame();
            });
        } else {
            console.error('Start button not found! Retrying in 1 second...');
            setTimeout(() => this.setupUI(), 1000);
            return;
        }

        const playAgainButton = document.getElementById('playAgainButton');
        if (playAgainButton) {
            playAgainButton.addEventListener('click', () => {
                console.log('Play again button clicked!');
                this.resetGame();
                this.startGame();
            });
        }

        const backToMenuButton = document.getElementById('backToMenuButton');
        if (backToMenuButton) {
            backToMenuButton.addEventListener('click', () => {
                console.log('Back to menu button clicked!');
                this.showScreen('startScreen');
                this.gameState = 'menu';
            });
        }

        console.log('UI setup completed successfully!');
    }

    showScreen(screenId) {
        console.log(`Showing screen: ${screenId}`);

        // Find all divs that have an id ending with 'Screen'
        const allScreens = ['startScreen', 'gameScreen', 'endScreen'];

        allScreens.forEach(id => {
            const screen = document.getElementById(id);
            if (screen) {
                screen.style.display = 'none';
            }
        });

        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.style.display = 'flex';
            console.log(`Screen ${screenId} activated`);
        } else {
            console.error(`Screen ${screenId} not found!`);
        }
    }

    startGame() {
        console.log('Starting game...');
        this.resetGame();
        this.gameState = 'playing';
        this.gameStartTime = Date.now();
        this.showScreen('gameScreen');
        requestAnimationFrame(this.gameLoop);
        console.log('Game started successfully!');
    }

    resetGame() {
        // Reset teams
        this.team1.goombas = 7;
        this.team2.goombas = 7;

        // Usa dimensões fixas do campo
        const fieldMargin = 60;
        const fieldWidth = this.FIELD_WIDTH - fieldMargin * 2;
        const fieldHeight = this.FIELD_HEIGHT - fieldMargin * 2;
        const fieldX = fieldMargin;
        const fieldY = fieldMargin;
        const centerX = this.FIELD_WIDTH / 2;
        const centerY = this.FIELD_HEIGHT / 2;

        // Reset players to fixed starting positions
        this.players[0].x = 200; this.players[0].y = 250; this.players[0].vx = 0; this.players[0].vy = 0;  // Team 1 Player 1
        this.players[1].x = 200; this.players[1].y = 350; this.players[1].vx = 0; this.players[1].vy = 0;  // Team 1 Player 2
        this.players[2].x = 800; this.players[2].y = 250; this.players[2].vx = 0; this.players[2].vy = 0;  // Team 2 Player 1
        this.players[3].x = 800; this.players[3].y = 350; this.players[3].vx = 0; this.players[3].vy = 0;  // Team 2 Player 2

        // Reset shell to fixed center position
        this.shell.x = 500;  // Centro fixo do campo
        this.shell.y = 300;  // Centro fixo do campo
        this.shell.vx = 0;
        this.shell.vy = 0;
        this.shell.owner = null;
        this.shell.lastOwner = null;

        // Reset kick system
        this.kickSystem.isCharging = false;
        this.kickSystem.chargingPlayer = null;
        this.kickSystem.chargeStartTime = 0;

        // Reset goombas
        this.initializeGoombas();

        // Reset timer
        this.gameStartTime = 0;
        this.gameTime = 0;

        // Reset state
        this.isResetting = false;
        this.resetStartTime = 0;

        // Reset celebration and camera
        this.isCelebrating = false;
        this.celebrationStartTime = 0;
        this.celebratingPlayer = null;

        // Reset goomba hit tracking
        this.goombasHitThisFrame = 0;
        this.lastGoombaHitTime = 0;
        this.totalGoombasHit = 0;
        this.playersLocked = false; // Controla se os jogadores estão travados
        this.hitEffects = []; // Lista de efeitos visuais ativos

        // Camera system - starts centered on the arena
        this.cameraZoom = 1;
        this.cameraX = 0;  // 0 means centered on canvas
        this.cameraY = 0;  // 0 means centered on canvas
        this.targetZoom = 1;
        this.targetCameraX = 0;
        this.targetCameraY = 0;



        // Reset goal celebration system
        this.goalCelebration = {
            isActive: false,
            phase: 'none',
            goalScorer: null,
            startTime: 0,
            ballStoppedTime: 0,
            waitAfterBallStops: 1000,
            zoomDuration: 1500,
            celebrationDuration: 2000,
            resetDuration: 1000
        };


    }



    startRendering() {
        // Start the rendering loop immediately
        this.renderLoop();
    }

    renderLoop() {
        // Always render the field, even when not playing
        if (this.canvas && this.ctx) {
            this.render();
        }

        // Continue the loop
        requestAnimationFrame(() => this.renderLoop());
    }

    gameLoop(currentTime) {
        if (this.gameState !== 'playing') return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.updateUI();

        requestAnimationFrame(this.gameLoop);
    }

    update(deltaTime) {
        this.gameTime = Date.now() - this.gameStartTime;

        if (this.isCelebrating) {
            this.updateCelebration();
        } else if (this.isResetting) {
            this.updateReset();
        } else {
            this.updatePlayerMovement();
            this.updateKickSystem();
            this.updateShell();
            this.checkCollisions();
            this.updateGoalCelebration();
            this.checkWinCondition();
        }

        // Always update camera and effects
        this.updateCamera();
        this.updateHitEffects();
    }

    updatePlayerMovement() {
        // Se está resetando, comemorando ou jogadores travados, não permite movimento
        if (this.isResetting || this.isCelebrating || this.playersLocked) {
            return;
        }

        const speed = 1.2; // Aumentei a velocidade para movimento mais responsivo
        const friction = 0.85; // Reduzido para movimento mais fluido
        const deltaTime = 16; // Assumindo 60fps

        this.players.forEach(player => {
            // Atualiza cooldowns e estados
            if (player.slideCooldown > 0) {
                player.slideCooldown -= deltaTime;
            }
            if (player.stunnedTime > 0) {
                player.stunnedTime -= deltaTime;
                if (player.stunnedTime <= 0) {
                    player.isStunned = false;
                }
            }

            let dx = 0, dy = 0;

            // Se o jogador está atordoado, não pode se mover
            if (player.isStunned) {
                player.vx *= 0.9; // Aplica atrito forte
                player.vy *= 0.9;
                this.updatePlayerPosition(player);
                return;
            }

            // Se o jogador está fazendo slide tackle
            if (player.isSliding) {
                player.slideDuration += deltaTime;

                // Movimento do slide
                player.vx = player.slideDirection.x * player.slideSpeed;
                player.vy = player.slideDirection.y * player.slideSpeed;

                // Reduz velocidade do slide gradualmente
                player.slideSpeed *= 0.95;

                // Termina o slide após a duração máxima
                if (player.slideDuration >= player.slideMaxDuration) {
                    player.isSliding = false;
                    player.slideCooldown = player.slideMaxCooldown;
                    player.slideSpeed = 0;
                    console.log(`Jogador ${player.id} terminou slide tackle!`);
                }

                this.updatePlayerPosition(player);
                return;
            }

            // Se o jogador está carregando chute, não pode se mover
            if (this.kickSystem.isCharging && this.kickSystem.chargingPlayer === player) {
                // Aplicar apenas atrito para parar gradualmente
                player.vx *= friction;
                player.vy *= friction;
            } else {
                // Sistema de movimento livre com física melhorada
                let inputX = 0, inputY = 0;

                // Captura input das teclas
                if (this.keys[player.controls.up]) inputY -= 1;
                if (this.keys[player.controls.down]) inputY += 1;
                if (this.keys[player.controls.left]) inputX -= 1;
                if (this.keys[player.controls.right]) inputX += 1;

                // Se há input, aplica movimento
                if (inputX !== 0 || inputY !== 0) {
                    // Normaliza o input para manter velocidade consistente em todas as direções
                    const inputLength = Math.sqrt(inputX * inputX + inputY * inputY);
                    inputX /= inputLength;
                    inputY /= inputLength;

                    // Aplica aceleração na direção do input
                    player.vx += inputX * speed;
                    player.vy += inputY * speed;
                } else {
                    // Sem input - aplica atrito extra para parar mais rápido
                    player.vx *= friction * 0.8;
                    player.vy *= friction * 0.8;
                }

                // Limita velocidade máxima
                const maxSpeed = 4.5;
                const currentSpeed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
                if (currentSpeed > maxSpeed) {
                    player.vx = (player.vx / currentSpeed) * maxSpeed;
                    player.vy = (player.vy / currentSpeed) * maxSpeed;
                }

                // Aplica atrito normal
                player.vx *= friction;
                player.vy *= friction;
            }

            this.updatePlayerPosition(player);

            // Se o jogador está nocauteado e tem a bola, perde a posse
            if (player.isStunned && this.shell.owner === player) {
                this.shell.owner = null;
                console.log(`Jogador ${player.id} perdeu a bola por estar nocauteado!`);
            }
        });

    }

    updatePlayerPosition(player) {
        // Update position
        player.x += player.vx;
        player.y += player.vy;

        // Calcula limites do campo usando dimensões fixas
        const fieldMargin = 60;
        const fieldWidth = this.FIELD_WIDTH - fieldMargin * 2;
        const fieldHeight = this.FIELD_HEIGHT - fieldMargin * 2;
        const fieldX = fieldMargin;
        const fieldY = fieldMargin;

        // Limites das zonas protegidas dos Goombas - NENHUM jogador pode entrar
        const goombaProtectionDepth = 70;

        // TODOS os jogadores são bloqueados em ambas as zonas dos goombas
        const minX = fieldX + goombaProtectionDepth + player.radius;
        const maxX = fieldX + fieldWidth - goombaProtectionDepth - player.radius;

        // Limites verticais (todo o campo)
        const minY = fieldY + player.radius;
        const maxY = fieldY + fieldHeight - player.radius;

        // Aplica os limites
        if (player.x < minX) {
            player.x = minX;
            player.vx = 0;
        }
        if (player.x > maxX) {
            player.x = maxX;
            player.vx = 0;
        }
        if (player.y < minY) {
            player.y = minY;
            player.vy = 0;
        }
        if (player.y > maxY) {
            player.y = maxY;
            player.vy = 0;
        }
    }

    startKickCharge(player) {
        this.kickSystem.isCharging = true;
        this.kickSystem.chargingPlayer = player;
        this.kickSystem.chargeStartTime = Date.now();
    }

    releaseKick() {
        if (!this.kickSystem.isCharging) return;

        const chargeTime = Date.now() - this.kickSystem.chargeStartTime;
        const chargePower = Math.min(chargeTime / this.kickSystem.maxChargeTime, 1);
        const power = this.kickSystem.minPower + (this.kickSystem.maxPower - this.kickSystem.minPower) * chargePower;

        const player = this.kickSystem.chargingPlayer;

        // Calcula direção baseada nas teclas pressionadas no momento do chute
        let dx = 0, dy = 0;
        if (this.keys[player.controls.up]) dy -= 1;
        if (this.keys[player.controls.down]) dy += 1;
        if (this.keys[player.controls.left]) dx -= 1;
        if (this.keys[player.controls.right]) dx += 1;

        // Se não há input, chuta na direção padrão do time
        if (dx === 0 && dy === 0) {
            dx = player.team === 1 ? 1 : -1;
        }

        // Normaliza a direção
        if (dx !== 0 || dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
        }

        // Apply kick to shell
        this.shell.vx = dx * power;
        this.shell.vy = dy * power;
        this.shell.owner = null; // Remove ownership
        this.shell.lastOwner = player;



        // Reset kick system
        this.kickSystem.isCharging = false;
        this.kickSystem.chargingPlayer = null;
        this.kickSystem.chargeStartTime = 0;
    }

    updateKickSystem() {
        // Sistema simples - não precisa de update contínuo
    }

    updateShell() {
        // Se a bola tem dono, ela fica grudada no jogador
        if (this.shell.owner) {
            // Posiciona a bola ligeiramente à frente do jogador baseado no time
            const offsetX = this.shell.owner.team === 1 ? 30 : -30; // Time 1 vai para direita, Time 2 para esquerda
            this.shell.x = this.shell.owner.x + offsetX;
            this.shell.y = this.shell.owner.y; // Mesma altura do jogador
            this.shell.vx = 0;
            this.shell.vy = 0;
            return;
        }

        const friction = 0.98;
        const minSpeed = 0.1;

        // Apply friction
        this.shell.vx *= friction;
        this.shell.vy *= friction;

        // Stop if too slow
        if (Math.abs(this.shell.vx) < minSpeed && Math.abs(this.shell.vy) < minSpeed) {
            this.shell.vx = 0;
            this.shell.vy = 0;
        }

        // Update position
        this.shell.x += this.shell.vx;
        this.shell.y += this.shell.vy;

        // Calcula limites do campo usando dimensões fixas
        const fieldMargin = 60;
        const fieldWidth = this.FIELD_WIDTH - fieldMargin * 2;
        const fieldHeight = this.FIELD_HEIGHT - fieldMargin * 2;
        const fieldX = fieldMargin;
        const fieldY = fieldMargin;

        // Física de colisão com as paredes - mais realista
        const bounceReduction = 0.8;

        // Parede esquerda
        if (this.shell.x - this.shell.radius < fieldX) {
            this.shell.x = fieldX + this.shell.radius;
            this.shell.vx = Math.abs(this.shell.vx) * bounceReduction; // Inverte e reduz
        }
        // Parede direita
        if (this.shell.x + this.shell.radius > fieldX + fieldWidth) {
            this.shell.x = fieldX + fieldWidth - this.shell.radius;
            this.shell.vx = -Math.abs(this.shell.vx) * bounceReduction; // Inverte e reduz
        }
        // Parede superior
        if (this.shell.y - this.shell.radius < fieldY) {
            this.shell.y = fieldY + this.shell.radius;
            this.shell.vy = Math.abs(this.shell.vy) * bounceReduction; // Inverte e reduz
        }
        // Parede inferior
        if (this.shell.y + this.shell.radius > fieldY + fieldHeight) {
            this.shell.y = fieldY + fieldHeight - this.shell.radius;
            this.shell.vy = -Math.abs(this.shell.vy) * bounceReduction; // Inverte e reduz
        }
    }

    attemptSlideTackle(player) {
        // Verifica se pode fazer slide tackle
        if (player.isSliding || player.slideCooldown > 0 || player.isStunned) {
            return;
        }

        // Calcula direção do movimento atual ou direção das teclas pressionadas
        let dx = 0, dy = 0;
        if (this.keys[player.controls.up]) dy -= 1;
        if (this.keys[player.controls.down]) dy += 1;
        if (this.keys[player.controls.left]) dx -= 1;
        if (this.keys[player.controls.right]) dx += 1;

        // Se não há input de direção, usa a velocidade atual
        if (dx === 0 && dy === 0) {
            dx = player.vx;
            dy = player.vy;
        }

        // Normaliza a direção
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length > 0) {
            dx /= length;
            dy /= length;
        } else {
            // Se não há direção, usa direção padrão baseada no time
            dx = player.team === 1 ? 1 : -1;
            dy = 0;
        }

        // Inicia o slide tackle
        player.isSliding = true;
        player.slideDuration = 0;
        player.slideDirection.x = dx;
        player.slideDirection.y = dy;
        player.slideSpeed = 8; // Velocidade inicial do slide

        console.log(`Jogador ${player.id} iniciou slide tackle!`);
    }

    checkCollisions() {
        // Player-Shell collisions with physics
        this.checkPlayerShellCollisions();

        // Shell-Goomba collisions
        this.checkShellGoombaCollisions();

        // Player-Player collisions with physics
        this.checkPlayerCollisions();
    }

    checkPlayerShellCollisions() {
        this.players.forEach(player => {
            const dx = player.x - this.shell.x;
            const dy = player.y - this.shell.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Increased collision radius for easier ball pickup
            const collisionRadius = player.radius + this.shell.radius + 15;

            if (distance < collisionRadius && !player.isStunned) {
                // Verifica se a bola está se movendo rápido (foi chutada recentemente)
                const shellSpeed = Math.sqrt(this.shell.vx * this.shell.vx + this.shell.vy * this.shell.vy);

                // Se a bola não tem dono e não está se movendo rápido, pega automaticamente
                if (this.shell.owner === null && shellSpeed < 2) {
                    this.shell.owner = player;
                    this.shell.vx = 0;
                    this.shell.vy = 0;
                    console.log(`Jogador ${player.id} pegou a concha livre!`);
                }
                // Se a bola tem dono de time adversário, permite roubo
                else if (this.shell.owner && this.shell.owner.team !== player.team) {
                    // Roubo normal - só funciona se o jogador estiver fazendo dash/slide
                    if (player.isSliding) {
                        console.log(`Jogador ${player.id} roubou a bola com dash do jogador ${this.shell.owner.id}!`);
                        this.shell.owner = player;
                        this.shell.vx = 0;
                        this.shell.vy = 0;
                    }
                    // Roubo por proximidade - só se a bola não foi chutada recentemente
                    else if (shellSpeed < 1 && this.shell.lastOwner !== player) {
                        console.log(`Jogador ${player.id} roubou a bola por proximidade do jogador ${this.shell.owner.id}!`);
                        this.shell.owner = player;
                        this.shell.vx = 0;
                        this.shell.vy = 0;
                    }
                }
                // Se a bola já pertence ao jogador, mantém a posse
                else if (this.shell.owner === player) {
                    // Já tem a bola, não precisa fazer nada
                }
            }

            // Física de colisão - evitar sobreposição APENAS se o jogador NÃO possui a bola
            if (this.shell.owner !== player) {
                const minDistance = player.radius + this.shell.radius;
                if (distance < minDistance && distance > 0) {
                    const overlap = minDistance - distance;
                    const separationX = (dx / distance) * overlap * 0.5;
                    const separationY = (dy / distance) * overlap * 0.5;

                    // Separar jogador e bola
                    player.x += separationX;
                    player.y += separationY;
                    this.shell.x -= separationX;
                    this.shell.y -= separationY;
                }
            }
        });
    }

    checkShellGoombaCollisions() {
        const shellSpeed = Math.sqrt(this.shell.vx * this.shell.vx + this.shell.vy * this.shell.vy);
        if (shellSpeed < 1) return; // Shell must be moving fast enough (reduzido de 2 para 1)

        // Check team 1 goombas
        this.goombaPositions.team1.forEach((goomba) => {
            if (!goomba.active) return;

            const dx = this.shell.x - goomba.x;
            const dy = this.shell.y - goomba.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.shell.radius + 15) { // Goomba radius = 15
                goomba.active = false;
                this.team1.goombas--;
                console.log(`Goomba do time 1 eliminado! Restam: ${this.team1.goombas}`);

                // Add hit effect
                this.addHitEffect(goomba.x, goomba.y, this.team1.color);

                // Inicia comemoração de gol se não estiver já ativa
                if (this.goalCelebration && !this.goalCelebration.isActive && this.shell.lastOwner) {
                    this.startGoalCelebration(this.shell.lastOwner);
                }
            }
        });

        // Check team 2 goombas
        this.goombaPositions.team2.forEach((goomba) => {
            if (!goomba.active) return;

            const dx = this.shell.x - goomba.x;
            const dy = this.shell.y - goomba.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.shell.radius + 15) { // Goomba radius = 15
                goomba.active = false;
                this.team2.goombas--;
                console.log(`Goomba do time 2 eliminado! Restam: ${this.team2.goombas}`);

                // Add hit effect
                this.addHitEffect(goomba.x, goomba.y, this.team2.color);

                // Inicia comemoração de gol se não estiver já ativa
                if (this.goalCelebration && !this.goalCelebration.isActive && this.shell.lastOwner) {
                    this.startGoalCelebration(this.shell.lastOwner);
                }
            }
        });
    }

    checkPlayerCollisions() {
        for (let i = 0; i < this.players.length; i++) {
            for (let j = i + 1; j < this.players.length; j++) {
                const player1 = this.players[i];
                const player2 = this.players[j];

                const dx = player1.x - player2.x;
                const dy = player1.y - player2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = player1.radius + player2.radius;

                if (distance < minDistance && distance > 0) {
                    // Física de colisão - separar jogadores
                    const overlap = minDistance - distance;
                    const separationX = (dx / distance) * overlap * 0.5;
                    const separationY = (dy / distance) * overlap * 0.5;

                    // Separar os jogadores
                    player1.x += separationX;
                    player1.y += separationY;
                    player2.x -= separationX;
                    player2.y -= separationY;

                    // Check for slide tackle e roubo de bola
                    // Jogador nocauteado não pode fazer slide tackle nem roubar bola
                    if (player1.isSliding && !player2.isStunned && !player1.isStunned && player1.team !== player2.team) {
                        this.handleSlideTackle(player1, player2);
                        // Se o player2 tem a bola, player1 rouba
                        if (this.shell.owner === player2) {
                            this.shell.owner = player1;
                            console.log(`Jogador ${player1.id} roubou a bola com dash do jogador ${player2.id}!`);
                        }
                    } else if (player2.isSliding && !player1.isStunned && !player2.isStunned && player1.team !== player2.team) {
                        this.handleSlideTackle(player2, player1);
                        // Se o player1 tem a bola, player2 rouba
                        if (this.shell.owner === player1) {
                            this.shell.owner = player2;
                            console.log(`Jogador ${player2.id} roubou a bola com dash do jogador ${player1.id}!`);
                        }
                    }
                    // Roubo por proximidade entre jogadores de times diferentes
                    else if (player1.team !== player2.team) {
                        // Se um jogador está próximo do outro que tem a bola, pode roubar
                        // MAS apenas se o jogador que vai roubar NÃO estiver nocauteado
                        if (this.shell.owner === player2 && !player1.isStunned) {
                            this.shell.owner = player1;
                            console.log(`Jogador ${player1.id} roubou a bola por proximidade do jogador ${player2.id}!`);
                        } else if (this.shell.owner === player1 && !player2.isStunned) {
                            this.shell.owner = player2;
                            console.log(`Jogador ${player2.id} roubou a bola por proximidade do jogador ${player1.id}!`);
                        }
                    }
                }
            }
        }
    }

    handleSlideTackle(tackler, victim) {
        console.log(`Jogador ${tackler.id} fez slide tackle no jogador ${victim.id}!`);

        // Stun the victim
        victim.isStunned = true;
        victim.stunnedTime = victim.maxStunnedTime;

        // If victim has the shell, steal it (garantido)
        if (this.shell.owner === victim) {
            this.shell.owner = tackler;
            this.shell.vx = 0;
            this.shell.vy = 0;
            console.log(`Jogador ${tackler.id} roubou a concha com slide tackle!`);
        }

        // Add knockback to victim
        const dx = victim.x - tackler.x;
        const dy = victim.y - tackler.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length > 0) {
            victim.vx += (dx / length) * 5; // Aumentei o knockback
            victim.vy += (dy / length) * 5;
        }

        // Add hit effect
        this.addHitEffect(victim.x, victim.y, '#FFD700');
    }

    addHitEffect(x, y, color) {
        if (!this.hitEffects) this.hitEffects = [];

        this.hitEffects.push({
            x: x,
            y: y,
            color: color,
            time: 0,
            maxTime: 500 // 500ms effect
        });
    }

    updateHitEffects() {
        if (!this.hitEffects) this.hitEffects = [];

        this.hitEffects = this.hitEffects.filter(effect => {
            effect.time += 16; // Assuming 60fps
            return effect.time < effect.maxTime;
        });
    }

    startGoalCelebration(goalScorer) {


        this.goalCelebration.isActive = true;
        this.goalCelebration.phase = 'waiting_ball_stop';
        this.goalCelebration.goalScorer = goalScorer;
        this.goalCelebration.startTime = Date.now();

        // Trava todos os jogadores imediatamente
        this.playersLocked = true;
    }

    updateGoalCelebration() {
        if (!this.goalCelebration || !this.goalCelebration.isActive) return;

        const currentTime = Date.now();
        const shellSpeed = Math.sqrt(this.shell.vx * this.shell.vx + this.shell.vy * this.shell.vy);

        switch (this.goalCelebration.phase) {
            case 'waiting_ball_stop':
                // Aguarda a bola parar completamente
                if (shellSpeed < 0.5) {
                    if (this.goalCelebration.ballStoppedTime === 0) {
                        this.goalCelebration.ballStoppedTime = currentTime;
                    } else if (currentTime - this.goalCelebration.ballStoppedTime >= this.goalCelebration.waitAfterBallStops) {
                        // Inicia zoom no jogador
                        this.goalCelebration.phase = 'zooming';
                        this.goalCelebration.startTime = currentTime;
                        this.startZoomOnPlayer(this.goalCelebration.goalScorer);
                    }
                } else {
                    // Reset timer se a bola ainda está se movendo
                    this.goalCelebration.ballStoppedTime = 0;
                }
                break;

            case 'zooming':
                // Fase de zoom (1.5 segundos)
                if (currentTime - this.goalCelebration.startTime >= this.goalCelebration.zoomDuration) {
                    this.goalCelebration.phase = 'celebrating';
                    this.goalCelebration.startTime = currentTime;
                }
                break;

            case 'celebrating':
                // Fase de comemoração (2 segundos)
                if (currentTime - this.goalCelebration.startTime >= this.goalCelebration.celebrationDuration) {
                    this.goalCelebration.phase = 'resetting';
                    this.goalCelebration.startTime = currentTime;
                    this.startResetAfterGoal();
                }
                break;

            case 'resetting':
                // Fase de reset (1 segundo)
                if (currentTime - this.goalCelebration.startTime >= this.goalCelebration.resetDuration) {
                    this.endGoalCelebration();
                }
                break;
        }
    }

    startZoomOnPlayer(player) {
        // Zoom na posição do jogador
        this.targetZoom = 2.5;

        // Calcula o offset para centralizar o jogador na tela
        // Queremos que o jogador apareça no centro da tela após as transformações
        this.targetCameraX = this.canvas.width / 2 - player.x * this.targetZoom;
        this.targetCameraY = this.canvas.height / 2 - player.y * this.targetZoom;


    }

    startResetAfterGoal() {
        // Volta o zoom para normal
        this.targetZoom = 1;
        this.targetCameraX = 0;
        this.targetCameraY = 0;


    }

    endGoalCelebration() {


        // Reset do sistema de comemoração
        this.goalCelebration.isActive = false;
        this.goalCelebration.phase = 'none';
        this.goalCelebration.goalScorer = null;
        this.goalCelebration.ballStoppedTime = 0;

        // Destrava os jogadores
        this.playersLocked = false;

        // Reset das posições
        this.resetPlayerPositions();
    }

    resetPlayerPositions() {
        // Calcula posições baseadas no tamanho do campo
        const { width, height } = this.canvas;
        const fieldMargin = 60;
        const fieldWidth = Math.min(width - fieldMargin * 2, width * 0.9);
        const fieldHeight = Math.min(height - fieldMargin * 2, height * 0.8);
        const fieldX = (width - fieldWidth) / 2;
        const fieldY = (height - fieldHeight) / 2;
        const centerX = fieldX + fieldWidth / 2;
        const centerY = fieldY + fieldHeight / 2;

        // Posições dos jogadores dentro da área permitida
        const limitDistance = 60;
        const playerAreaLeft = fieldX + limitDistance + 30;

        // Reset players to starting positions
        this.players[0].x = playerAreaLeft + 50; this.players[0].y = centerY - 50; this.players[0].vx = 0; this.players[0].vy = 0;
        this.players[1].x = playerAreaLeft + 50; this.players[1].y = centerY + 50; this.players[1].vx = 0; this.players[1].vy = 0;
        this.players[2].x = centerX + 100; this.players[2].y = centerY - 50; this.players[2].vx = 0; this.players[2].vy = 0;
        this.players[3].x = centerX + 100; this.players[3].y = centerY + 50; this.players[3].vx = 0; this.players[3].vy = 0;

        // Reset shell
        this.shell.x = centerX;
        this.shell.y = centerY;
        this.shell.vx = 0;
        this.shell.vy = 0;
        this.shell.owner = null;
        this.shell.lastOwner = null;


    }

    checkWinCondition() {
        if (this.team1.goombas <= 0) {
            this.endGame('Team 2');
        } else if (this.team2.goombas <= 0) {
            this.endGame('Team 1');
        }
    }

    endGame(winner) {
        this.gameState = 'ended';
        console.log(`${winner} venceu!`);

        // Update UI
        document.getElementById('winnerText').textContent = `${winner === 'Team 1' ? 'Time Vermelho' : 'Time Azul'} Venceu!`;
        document.getElementById('finalTime').textContent = this.formatTime(this.gameTime);
        document.getElementById('finalGoombas').textContent = '7';

        this.showScreen('endScreen');
    }

    render() {
        if (!this.canvas || !this.ctx) {
            return;
        }

        // Clear canvas
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Apply camera transformations
        this.ctx.save();

        // Aplicar transformações da câmera de forma mais simples
        this.ctx.translate(this.cameraX, this.cameraY);
        this.ctx.scale(this.cameraZoom, this.cameraZoom);

        // Always draw field
        this.drawField();

        // Only draw game elements if initialized
        if (this.goombaPositions && this.players && this.shell) {
            // Draw goombas
            this.drawGoombas();

            // Draw players
            this.players.forEach((player, index) => {
                this.drawPlayer(player, `P${index + 1}`);
            });

            // Draw shell
            this.drawShell();

            // Draw kick aim if charging
            if (this.kickSystem && this.kickSystem.isCharging) {
                this.drawKickAim();
            }

            // Draw hit effects
            this.drawHitEffects();
        }

        // Restore camera transformations
        this.ctx.restore();

        // Draw celebration overlay if active
        if (this.goalCelebration && this.goalCelebration.isActive) {
            this.drawCelebrationOverlay();
        }
    }

    drawField() {
        // Usa dimensões fixas do campo
        const fieldMargin = 60;
        const fieldWidth = this.FIELD_WIDTH - fieldMargin * 2;
        const fieldHeight = this.FIELD_HEIGHT - fieldMargin * 2;
        const fieldX = fieldMargin;
        const fieldY = fieldMargin;

        // Draw field background
        this.ctx.fillStyle = '#32CD32';
        this.ctx.fillRect(fieldX, fieldY, fieldWidth, fieldHeight);

        // Draw field border
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(fieldX, fieldY, fieldWidth, fieldHeight);

        // Draw center line
        this.ctx.beginPath();
        this.ctx.moveTo(fieldX + fieldWidth / 2, fieldY);
        this.ctx.lineTo(fieldX + fieldWidth / 2, fieldY + fieldHeight);
        this.ctx.stroke();

        // Draw center circle
        this.ctx.beginPath();
        this.ctx.arc(fieldX + fieldWidth / 2, fieldY + fieldHeight / 2, 50, 0, Math.PI * 2);
        this.ctx.stroke();

        // Draw goomba zones
        this.drawGoombaZones(fieldX, fieldY, fieldWidth, fieldHeight);
    }

    drawGoombaZones(fieldX, fieldY, fieldWidth, fieldHeight) {
        const goombaProtectionDepth = 70; // Mesma profundidade usada na lógica de colisão

        // Zona dos goombas azuis (direita) - NENHUM jogador pode entrar
        this.ctx.fillStyle = 'rgba(65, 105, 225, 0.25)';
        this.ctx.fillRect(fieldX + fieldWidth - goombaProtectionDepth, fieldY, goombaProtectionDepth, fieldHeight);

        // Zona dos goombas vermelhos (esquerda) - NENHUM jogador pode entrar
        this.ctx.fillStyle = 'rgba(220, 20, 60, 0.25)';
        this.ctx.fillRect(fieldX, fieldY, goombaProtectionDepth, fieldHeight);

        // Desenha linhas de demarcação mais visíveis
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([10, 5]);

        // Linha da zona azul (direita)
        this.ctx.beginPath();
        this.ctx.moveTo(fieldX + fieldWidth - goombaProtectionDepth, fieldY);
        this.ctx.lineTo(fieldX + fieldWidth - goombaProtectionDepth, fieldY + fieldHeight);
        this.ctx.stroke();

        // Linha da zona vermelha (esquerda)
        this.ctx.beginPath();
        this.ctx.moveTo(fieldX + goombaProtectionDepth, fieldY);
        this.ctx.lineTo(fieldX + goombaProtectionDepth, fieldY + fieldHeight);
        this.ctx.stroke();

        this.ctx.setLineDash([]); // Reset line dash

        // Adiciona símbolos de "proibido" nas zonas
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';

        // Símbolo na zona vermelha
        this.ctx.fillText('⛔', fieldX + goombaProtectionDepth/2, fieldY + fieldHeight/2);

        // Símbolo na zona azul
        this.ctx.fillText('⛔', fieldX + fieldWidth - goombaProtectionDepth/2, fieldY + fieldHeight/2);
    }

    drawGoombas() {
        // Draw team 1 goombas (blue)
        this.goombaPositions.team1.forEach(goomba => {
            if (goomba.active) {
                this.drawGoomba(goomba.x, goomba.y, this.team1.color);
            }
        });

        // Draw team 2 goombas (red)
        this.goombaPositions.team2.forEach(goomba => {
            if (goomba.active) {
                this.drawGoomba(goomba.x, goomba.y, this.team2.color);
            }
        });
    }

    drawGoomba(x, y, teamColor) {
        // Goomba body
        this.ctx.fillStyle = '#8B4513';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 15, 0, Math.PI * 2);
        this.ctx.fill();

        // Team color indicator
        this.ctx.fillStyle = teamColor;
        this.ctx.beginPath();
        this.ctx.arc(x, y - 5, 5, 0, Math.PI * 2);
        this.ctx.fill();

        // Eyes
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(x - 5, y - 2, 3, 0, Math.PI * 2);
        this.ctx.arc(x + 5, y - 2, 3, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(x - 5, y - 2, 1.5, 0, Math.PI * 2);
        this.ctx.arc(x + 5, y - 2, 1.5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawPlayer(player, label) {
        // Player shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(player.x + 2, player.y + 2, player.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Player body
        if (player.isStunned) {
            this.ctx.fillStyle = '#888888'; // Gray when stunned
        } else if (player.isSliding) {
            this.ctx.fillStyle = player.lightColor; // Lighter color when sliding
        } else {
            this.ctx.fillStyle = player.color;
        }

        this.ctx.beginPath();
        this.ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Player border
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Player label
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(label, player.x, player.y);

        // Slide cooldown indicator
        if (player.slideCooldown > 0) {
            const cooldownPercent = player.slideCooldown / player.slideMaxCooldown;
            this.ctx.fillStyle = 'rgba(255, 255, 0, 0.7)';
            this.ctx.beginPath();
            this.ctx.arc(player.x, player.y - player.radius - 10, 5, 0, Math.PI * 2 * cooldownPercent);
            this.ctx.fill();
        }

        // Stun indicator
        if (player.isStunned) {
            this.ctx.fillStyle = 'yellow';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.fillText('⭐', player.x, player.y - player.radius - 15);
        }
    }

    drawShell() {
        // Shell shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(this.shell.x + 2, this.shell.y + 2, this.shell.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Shell body
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(this.shell.x, this.shell.y, this.shell.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Shell pattern
        this.ctx.strokeStyle = '#FFA500';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.shell.x, this.shell.y, this.shell.radius - 3, 0, Math.PI * 2);
        this.ctx.stroke();

        // Shell spikes
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x1 = this.shell.x + Math.cos(angle) * (this.shell.radius - 5);
            const y1 = this.shell.y + Math.sin(angle) * (this.shell.radius - 5);
            const x2 = this.shell.x + Math.cos(angle) * (this.shell.radius + 3);
            const y2 = this.shell.y + Math.sin(angle) * (this.shell.radius + 3);

            this.ctx.strokeStyle = '#FF6347';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }

        // Owner indicator
        if (this.shell.owner) {
            this.ctx.fillStyle = this.shell.owner.color;
            this.ctx.beginPath();
            this.ctx.arc(this.shell.x, this.shell.y - this.shell.radius - 10, 5, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawKickAim() {
        if (!this.kickSystem.isCharging || !this.kickSystem.chargingPlayer) return;

        const player = this.kickSystem.chargingPlayer;
        const chargeTime = Date.now() - this.kickSystem.chargeStartTime;
        const chargePower = Math.min(chargeTime / this.kickSystem.maxChargeTime, 1);

        // Calcula direção atual baseada nas teclas pressionadas
        let dx = 0, dy = 0;
        if (this.keys[player.controls.up]) dy -= 1;
        if (this.keys[player.controls.down]) dy += 1;
        if (this.keys[player.controls.left]) dx -= 1;
        if (this.keys[player.controls.right]) dx += 1;

        // Direção padrão se não há input
        if (dx === 0 && dy === 0) {
            dx = player.team === 1 ? 1 : -1;
        }

        // Normaliza
        if (dx !== 0 || dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
        }

        // Draw aim line
        const aimLength = 50 + chargePower * 50;
        const endX = player.x + dx * aimLength;
        const endY = player.y + dy * aimLength;

        this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + chargePower * 0.5})`;
        this.ctx.lineWidth = 3 + chargePower * 3;
        this.ctx.beginPath();
        this.ctx.moveTo(player.x, player.y);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();

        // Draw power indicator
        this.ctx.fillStyle = `rgba(255, ${255 - chargePower * 255}, 0, 0.8)`;
        this.ctx.beginPath();
        this.ctx.arc(endX, endY, 5 + chargePower * 10, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawHitEffects() {
        if (!this.hitEffects) return;

        this.hitEffects.forEach(effect => {
            const progress = effect.time / effect.maxTime;
            const alpha = 1 - progress;
            const size = 10 + progress * 20;

            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(effect.x, effect.y, size, 0, Math.PI * 2);
            this.ctx.fill();

            // Explosion particles
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const distance = progress * 30;
                const x = effect.x + Math.cos(angle) * distance;
                const y = effect.y + Math.sin(angle) * distance;

                this.ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    drawCelebrationOverlay() {
        if (!this.goalCelebration || !this.goalCelebration.isActive || !this.goalCelebration.goalScorer) return;

        const phase = this.goalCelebration.phase;

        if (phase === 'celebrating') {
            // Overlay semi-transparente
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Texto de comemoração
            const teamName = this.goalCelebration.goalScorer.team === 1 ? 'Time Vermelho' : 'Time Azul';
            const playerName = `P${this.goalCelebration.goalScorer.id}`;

            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            this.ctx.fillText('GOL!', this.canvas.width / 2, this.canvas.height / 2 - 60);

            this.ctx.font = 'bold 32px Arial';
            this.ctx.fillText(`${playerName} - ${teamName}`, this.canvas.width / 2, this.canvas.height / 2 + 20);

            // Efeito de brilho
            const time = Date.now() - this.goalCelebration.startTime;
            const glowIntensity = Math.sin(time * 0.01) * 0.5 + 0.5;
            this.ctx.shadowColor = this.goalCelebration.goalScorer.color;
            this.ctx.shadowBlur = 20 * glowIntensity;
            this.ctx.fillText('GOL!', this.canvas.width / 2, this.canvas.height / 2 - 60);
            this.ctx.shadowBlur = 0;
        }
    }

    // Função para converter coordenadas 2D para perspectiva 3D
    to3D(x, y, z = 0) {
        // Verificação de segurança - se perspective não estiver inicializado, retorna valores simples
        if (!this.perspective || !this.canvas) {
            return { x: x, y: y, scale: 1 };
        }

        // Usa valores seguros
        const angle = 25; // Fixo para evitar problemas
        const depth = 0.7;
        const horizon = 0.4;
        const fieldElevation = 80;
        const angleRad = (angle * Math.PI) / 180;

        // Aplica transformação simples
        const perspectiveY = y * depth - z * 0.5;

        // Ajusta a posição Y
        const screenY = perspectiveY + (this.canvas.height * horizon) + fieldElevation;

        // Escala simples
        const scale = Math.max(0.5, 1 - (y * 0.0005));

        // Verifica se os valores são válidos
        const finalX = isFinite(x) ? x : 0;
        const finalY = isFinite(screenY) ? screenY : y;
        const finalScale = isFinite(scale) ? scale : 1;

        return {
            x: finalX,
            y: finalY,
            scale: finalScale
        };
    }

    // Função para converter coordenadas do campo para coordenadas de tela
    fieldToScreen(fieldX, fieldY, elevation = 0) {
        // Aplica transformação 3D
        const transformed = this.to3D(fieldX, fieldY, elevation);

        // Centraliza na tela - com valores padrão se canvas não estiver disponível
        const centerX = this.canvas ? this.canvas.width / 2 : 400;
        const centerY = this.canvas ? this.canvas.height / 2 : 300;

        return {
            x: transformed.x + centerX + this.cameraX,
            y: transformed.y + this.cameraY,
            scale: transformed.scale * this.cameraZoom
        };
    }

    updateCamera() {
        // Smooth camera transitions - mais rápido durante comemoração
        let lerpFactor = 0.05; // Velocidade padrão

        // Se está comemorando, usa transição mais rápida
        if (this.goalCelebration && this.goalCelebration.isActive) {
            lerpFactor = 0.15; // Mais rápido para comemoração
        }

        this.cameraZoom += (this.targetZoom - this.cameraZoom) * lerpFactor;
        this.cameraX += (this.targetCameraX - this.cameraX) * lerpFactor;
        this.cameraY += (this.targetCameraY - this.cameraY) * lerpFactor;


    }

    updateCelebration() {
        // Simple celebration update - could be enhanced later
        const elapsed = Date.now() - this.celebrationStartTime;
        if (elapsed >= this.celebrationDuration) {
            this.isCelebrating = false;
        }
    }

    updateReset() {
        // Simple reset update - could be enhanced later
        const elapsed = Date.now() - this.resetStartTime;
        if (elapsed >= this.resetDuration) {
            this.isResetting = false;
        }
    }

    updateUI() {
        // Update team goomba counts
        document.getElementById('team1Goombas').textContent = `${this.team1.goombas} Goombas`;
        document.getElementById('team2Goombas').textContent = `${this.team2.goombas} Goombas`;

        // Update game timer
        document.getElementById('gameTimer').textContent = this.formatTime(this.gameTime);
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// Export the class for use in React/Next.js
export { CascobolGame };
