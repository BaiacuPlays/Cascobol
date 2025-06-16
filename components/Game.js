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

        // Load field background image
        this.fieldImage = new Image();
        this.fieldImage.src = '/campo.webp';
        this.fieldImageLoaded = false;

        this.fieldImage.onload = () => {
            this.fieldImageLoaded = true;
            console.log('Campo image loaded successfully');
        };

        this.fieldImage.onerror = () => {
            console.error('Failed to load campo image');
        };

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
                    pass: 'KeyC',
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
                    pass: 'KeyV',
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
                    pass: 'Slash',
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
                    pass: 'KeyP',
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
            speed: 12, // Velocidade base aumentada
            protectionTime: 0, // Tempo de proteção contra roubo
            protectionDuration: 1000, // 1 segundo de proteção
            trail: [], // Array para armazenar posições do rastro
            rotation: 0 // Rotação da bola para efeito visual
        };

        // Sistema de movimento e chute 360°
        this.kickSystem = {
            isCharging: false,
            chargingPlayer: null,
            chargeStartTime: 0,
            maxChargeTime: 1500, // 1.5 segundos para carga máxima
            minPower: 3,
            maxPower: 15,
            actionType: 'kick' // 'kick' ou 'pass'
        };

        // Sistema de passe
        this.passSystem = {
            passPower: 8, // Força fixa do passe
            passRange: 300 // Alcance máximo para encontrar companheiro
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
            const gameKeys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'KeyC', 'ShiftLeft', 'KeyT', 'KeyG', 'KeyF', 'KeyH', 'KeyR', 'KeyV', 'KeyQ',
                             'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Slash', 'ShiftRight', 'KeyI', 'KeyK', 'KeyJ', 'KeyL', 'KeyO', 'KeyP', 'KeyU'];
            if (gameKeys.includes(e.code)) {
                e.preventDefault();
            }

            // Start charging kick or pass (apenas se não estiver resetando, comemorando ou travado)
            if (!this.isResetting && !this.isCelebrating && !this.playersLocked) {
                this.players.forEach(player => {
                    // Kick (charged)
                    if (e.code === player.controls.action) {
                        if (this.shell.owner === player && !this.kickSystem.isCharging) {
                            this.startKickCharge(player, 'kick');
                        }
                    }

                    // Pass (instant)
                    if (e.code === player.controls.pass) {
                        if (this.shell.owner === player && !this.kickSystem.isCharging) {
                            this.executePass(player);
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
            this.updateBallProtection();
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

            // Se o jogador está carregando chute/passe, fica completamente parado (vulnerável)
            if (this.kickSystem.isCharging && this.kickSystem.chargingPlayer === player) {
                // Para completamente - mais vulnerável para roubo
                player.vx = 0;
                player.vy = 0;
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

    startKickCharge(player, actionType = 'kick') {
        this.kickSystem.isCharging = true;
        this.kickSystem.chargingPlayer = player;
        this.kickSystem.chargeStartTime = Date.now();
        this.kickSystem.actionType = actionType;
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
        this.shell.protectionTime = 0; // Remove proteção quando a bola é chutada - pode ser interceptada



        // Reset kick system
        this.kickSystem.isCharging = false;
        this.kickSystem.chargingPlayer = null;
        this.kickSystem.chargeStartTime = 0;
        this.kickSystem.actionType = 'kick';
    }

    executePass(player) {
        // Encontra o companheiro de equipe mais próximo
        const teammate = this.findNearestTeammate(player);

        if (!teammate) {
            console.log('Nenhum companheiro encontrado para passe!');
            return;
        }

        // Calcula direção para o companheiro
        const dx = teammate.x - player.x;
        const dy = teammate.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > this.passSystem.passRange) {
            console.log('Companheiro muito longe para passe!');
            return;
        }

        // Normaliza direção
        const normalizedDx = dx / distance;
        const normalizedDy = dy / distance;

        // Executa passe instantâneo
        this.shell.vx = normalizedDx * this.passSystem.passPower;
        this.shell.vy = normalizedDy * this.passSystem.passPower;
        this.shell.owner = null;
        this.shell.lastOwner = player;
        this.shell.protectionTime = 0; // Passe pode ser interceptado

        // Adiciona efeito visual de passe
        this.addPassEffect(player.x, player.y, teammate.x, teammate.y);

        console.log(`Jogador ${player.id} passou para jogador ${teammate.id}!`);
    }

    findNearestTeammate(player) {
        let nearestTeammate = null;
        let nearestDistance = Infinity;

        this.players.forEach(otherPlayer => {
            if (otherPlayer.id !== player.id && otherPlayer.team === player.team && !otherPlayer.isStunned) {
                const dx = otherPlayer.x - player.x;
                const dy = otherPlayer.y - player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < nearestDistance && distance <= this.passSystem.passRange) {
                    nearestDistance = distance;
                    nearestTeammate = otherPlayer;
                }
            }
        });

        return nearestTeammate;
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

        // Update trail and rotation - only when ball is moving
        const speed = Math.sqrt(this.shell.vx * this.shell.vx + this.shell.vy * this.shell.vy);
        if (speed > 1) {
            // Add current position to trail
            this.shell.trail.push({
                x: this.shell.x,
                y: this.shell.y,
                time: Date.now()
            });

            // Keep only recent trail positions (last 400ms for better visibility)
            const currentTime = Date.now();
            this.shell.trail = this.shell.trail.filter(point => currentTime - point.time < 400);

            // Update rotation based on movement
            this.shell.rotation += speed * 0.1;
        } else {
            // Clear trail when ball stops
            this.shell.trail = [];
        }

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

        // Verifica se a bola está travada nas zonas dos goombas e a empurra para fora
        this.checkBallInGoombaZones(fieldX, fieldY, fieldWidth, fieldHeight);
    }

    updateBallProtection() {
        // Atualiza o tempo de proteção da bola
        if (this.shell.protectionTime > 0) {
            this.shell.protectionTime -= 16; // Assumindo 60fps (16ms por frame)
            if (this.shell.protectionTime <= 0) {
                this.shell.protectionTime = 0;
                console.log('Proteção da bola expirou - pode ser roubada novamente');
            }
        }
    }

    checkBallInGoombaZones(fieldX, fieldY, fieldWidth, fieldHeight) {
        // Se a bola tem dono, não precisa verificar (ela está grudada no jogador)
        if (this.shell.owner) return;

        const goombaProtectionDepth = 70; // Mesma profundidade das zonas
        const shellSpeed = Math.sqrt(this.shell.vx * this.shell.vx + this.shell.vy * this.shell.vy);
        const minEscapeSpeed = 2; // Velocidade mínima para empurrar a bola para fora

        // Verifica se a bola está se movendo muito devagar (quase parada)
        if (shellSpeed > 1) return; // Se está se movendo rápido, não interfere

        let isInGoombaZone = false;
        let pushDirection = { x: 0, y: 0 };

        // Zona esquerda (goombas vermelhos)
        if (this.shell.x < fieldX + goombaProtectionDepth) {
            isInGoombaZone = true;
            // Empurra para a direita (para fora da zona)
            pushDirection.x = 1;
        }
        // Zona direita (goombas azuis)
        else if (this.shell.x > fieldX + fieldWidth - goombaProtectionDepth) {
            isInGoombaZone = true;
            // Empurra para a esquerda (para fora da zona)
            pushDirection.x = -1;
        }

        // Se a bola está em uma zona de goomba e quase parada, empurra para fora
        if (isInGoombaZone) {
            // Normaliza a direção se necessário
            const length = Math.sqrt(pushDirection.x * pushDirection.x + pushDirection.y * pushDirection.y);
            if (length > 0) {
                pushDirection.x /= length;
                pushDirection.y /= length;
            }

            // Aplica força para empurrar a bola para fora da zona
            this.shell.vx += pushDirection.x * minEscapeSpeed;
            this.shell.vy += pushDirection.y * minEscapeSpeed;

            console.log('Bola empurrada para fora da zona dos goombas!');
        }
    }

    attemptSlideTackle(player) {
        // Verifica se pode fazer slide tackle
        if (player.isSliding || player.slideCooldown > 0 || player.isStunned) {
            return;
        }

        // Se o jogador tem a bola, executa passe em vez de slide tackle
        if (this.shell.owner === player) {
            this.executePass(player);
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
                    this.shell.protectionTime = this.shell.protectionDuration; // Ativa proteção de 1 segundo
                    console.log(`Jogador ${player.id} pegou a concha livre! Proteção ativada por ${this.shell.protectionDuration}ms`);
                }
                // Se a bola tem dono de time adversário, permite roubo (mas verifica proteção)
                else if (this.shell.owner && this.shell.owner.team !== player.team) {
                    // Verifica se a bola ainda está protegida
                    if (this.shell.protectionTime > 0) {
                        console.log(`Tentativa de roubo bloqueada - bola protegida por mais ${this.shell.protectionTime}ms`);
                    } else {
                        // Roubo normal - só funciona se o jogador estiver fazendo dash/slide
                        if (player.isSliding) {
                            console.log(`Jogador ${player.id} roubou a bola com dash do jogador ${this.shell.owner.id}!`);
                            this.shell.owner = player;
                            this.shell.vx = 0;
                            this.shell.vy = 0;
                            this.shell.protectionTime = this.shell.protectionDuration; // Ativa proteção para o novo dono
                        }
                        // Roubo por proximidade - só se a bola não foi chutada recentemente
                        else if (shellSpeed < 1 && this.shell.lastOwner !== player) {
                            console.log(`Jogador ${player.id} roubou a bola por proximidade do jogador ${this.shell.owner.id}!`);
                            this.shell.owner = player;
                            this.shell.vx = 0;
                            this.shell.vy = 0;
                            this.shell.protectionTime = this.shell.protectionDuration; // Ativa proteção para o novo dono
                        }
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
                        // Se o player2 tem a bola, player1 rouba (mas verifica proteção)
                        if (this.shell.owner === player2) {
                            if (this.shell.protectionTime > 0) {
                                console.log(`Tentativa de roubo com dash bloqueada - bola protegida por mais ${this.shell.protectionTime}ms`);
                            } else {
                                this.shell.owner = player1;
                                this.shell.protectionTime = this.shell.protectionDuration; // Ativa proteção para o novo dono
                                console.log(`Jogador ${player1.id} roubou a bola com dash do jogador ${player2.id}!`);
                            }
                        }
                    } else if (player2.isSliding && !player1.isStunned && !player2.isStunned && player1.team !== player2.team) {
                        this.handleSlideTackle(player2, player1);
                        // Se o player1 tem a bola, player2 rouba (mas verifica proteção)
                        if (this.shell.owner === player1) {
                            if (this.shell.protectionTime > 0) {
                                console.log(`Tentativa de roubo com dash bloqueada - bola protegida por mais ${this.shell.protectionTime}ms`);
                            } else {
                                this.shell.owner = player2;
                                this.shell.protectionTime = this.shell.protectionDuration; // Ativa proteção para o novo dono
                                console.log(`Jogador ${player2.id} roubou a bola com dash do jogador ${player1.id}!`);
                            }
                        }
                    }
                    // Roubo por proximidade entre jogadores de times diferentes
                    else if (player1.team !== player2.team) {
                        // Se um jogador está próximo do outro que tem a bola, pode roubar
                        // MAS apenas se o jogador que vai roubar NÃO estiver nocauteado E a bola não estiver protegida
                        if (this.shell.owner === player2 && !player1.isStunned) {
                            if (this.shell.protectionTime > 0) {
                                console.log(`Tentativa de roubo por proximidade bloqueada - bola protegida por mais ${this.shell.protectionTime}ms`);
                            } else {
                                this.shell.owner = player1;
                                this.shell.protectionTime = this.shell.protectionDuration; // Ativa proteção para o novo dono
                                console.log(`Jogador ${player1.id} roubou a bola por proximidade do jogador ${player2.id}!`);
                            }
                        } else if (this.shell.owner === player1 && !player2.isStunned) {
                            if (this.shell.protectionTime > 0) {
                                console.log(`Tentativa de roubo por proximidade bloqueada - bola protegida por mais ${this.shell.protectionTime}ms`);
                            } else {
                                this.shell.owner = player2;
                                this.shell.protectionTime = this.shell.protectionDuration; // Ativa proteção para o novo dono
                                console.log(`Jogador ${player2.id} roubou a bola por proximidade do jogador ${player1.id}!`);
                            }
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

        // If victim has the shell, steal it (garantido - slide tackle ignora proteção)
        if (this.shell.owner === victim) {
            this.shell.owner = tackler;
            this.shell.vx = 0;
            this.shell.vy = 0;
            this.shell.protectionTime = this.shell.protectionDuration; // Ativa proteção para o novo dono
            console.log(`Jogador ${tackler.id} roubou a concha com slide tackle! Proteção ativada.`);
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
            maxTime: 500, // 500ms effect
            type: 'hit'
        });
    }

    addPassEffect(fromX, fromY, toX, toY) {
        if (!this.hitEffects) this.hitEffects = [];

        this.hitEffects.push({
            fromX: fromX,
            fromY: fromY,
            toX: toX,
            toY: toY,
            time: 0,
            maxTime: 800, // 800ms effect
            type: 'pass'
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
        this.shell.protectionTime = 0; // Reset proteção


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

            // Draw pass indicator when player has ball
            this.drawPassIndicator();

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

        // Draw Mario Party style background
        this.drawMarioPartyBackground();

        // Draw field with 3D effect
        this.drawMarioPartyField(fieldX, fieldY, fieldWidth, fieldHeight);

        // Draw goomba zones
        this.drawGoombaZones(fieldX, fieldY, fieldWidth, fieldHeight);
    }

    drawMarioPartyBackground() {
        // Gradient background like Mario Party
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB'); // Sky blue
        gradient.addColorStop(0.6, '#98FB98'); // Light green
        gradient.addColorStop(1, '#90EE90'); // Lighter green

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Add some clouds for atmosphere
        this.drawClouds();
    }

    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

        // Cloud 1
        this.drawCloud(150, 80, 40);
        // Cloud 2
        this.drawCloud(350, 60, 35);
        // Cloud 3
        this.drawCloud(650, 90, 45);
        // Cloud 4
        this.drawCloud(850, 70, 38);
    }

    drawCloud(x, y, size) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.6, y, size * 0.8, 0, Math.PI * 2);
        this.ctx.arc(x + size * 1.2, y, size * 0.7, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.3, y - size * 0.5, size * 0.6, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.9, y - size * 0.4, size * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawMarioPartyField(fieldX, fieldY, fieldWidth, fieldHeight) {
        // Field shadow (3D effect)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(fieldX + 6, fieldY + 6, fieldWidth, fieldHeight);

        // Draw field background image if loaded, otherwise use gradient
        if (this.fieldImageLoaded && this.fieldImage) {
            // Draw the field image as background
            this.ctx.drawImage(this.fieldImage, fieldX, fieldY, fieldWidth, fieldHeight);
        } else {
            // Fallback: Main field with vibrant green gradient
            const fieldGradient = this.ctx.createRadialGradient(
                fieldX + fieldWidth/2, fieldY + fieldHeight/2, 0,
                fieldX + fieldWidth/2, fieldY + fieldHeight/2, Math.max(fieldWidth, fieldHeight)/2
            );
            fieldGradient.addColorStop(0, '#32CD32'); // Lime green center
            fieldGradient.addColorStop(0.7, '#228B22'); // Forest green
            fieldGradient.addColorStop(1, '#006400'); // Dark green edges

            this.ctx.fillStyle = fieldGradient;
            this.ctx.fillRect(fieldX, fieldY, fieldWidth, fieldHeight);
        }

        // Field border with 3D effect
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 6;
        this.ctx.strokeRect(fieldX, fieldY, fieldWidth, fieldHeight);

        // Inner border for depth
        this.ctx.strokeStyle = '#F0F0F0';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(fieldX + 3, fieldY + 3, fieldWidth - 6, fieldHeight - 6);

        // Center line with glow
        this.ctx.save();
        this.ctx.shadowColor = '#FFFFFF';
        this.ctx.shadowBlur = 10;
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(fieldX + fieldWidth / 2, fieldY);
        this.ctx.lineTo(fieldX + fieldWidth / 2, fieldY + fieldHeight);
        this.ctx.stroke();
        this.ctx.restore();

        // Center circle with glow
        this.ctx.save();
        this.ctx.shadowColor = '#FFFFFF';
        this.ctx.shadowBlur = 8;
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.arc(fieldX + fieldWidth / 2, fieldY + fieldHeight / 2, 50, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();

        // Add grass texture pattern only if image is not loaded
        if (!this.fieldImageLoaded) {
            this.drawGrassPattern(fieldX, fieldY, fieldWidth, fieldHeight);
        }
    }

    drawGrassPattern(fieldX, fieldY, fieldWidth, fieldHeight) {
        this.ctx.strokeStyle = 'rgba(0, 100, 0, 0.3)';
        this.ctx.lineWidth = 1;

        // Vertical grass lines
        for (let i = 0; i < fieldWidth; i += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(fieldX + i, fieldY);
            this.ctx.lineTo(fieldX + i, fieldY + fieldHeight);
            this.ctx.stroke();
        }

        // Horizontal grass lines
        for (let i = 0; i < fieldHeight; i += 15) {
            this.ctx.beginPath();
            this.ctx.moveTo(fieldX, fieldY + i);
            this.ctx.lineTo(fieldX + fieldWidth, fieldY + i);
            this.ctx.stroke();
        }
    }

    drawGoombaZones(fieldX, fieldY, fieldWidth, fieldHeight) {
        const goombaProtectionDepth = 70;

        // Red team zone (left) with gradient and glow
        const redGradient = this.ctx.createLinearGradient(fieldX, fieldY, fieldX + goombaProtectionDepth, fieldY);
        redGradient.addColorStop(0, 'rgba(220, 20, 60, 0.4)');
        redGradient.addColorStop(0.7, 'rgba(220, 20, 60, 0.2)');
        redGradient.addColorStop(1, 'rgba(220, 20, 60, 0.1)');

        this.ctx.fillStyle = redGradient;
        this.ctx.fillRect(fieldX, fieldY, goombaProtectionDepth, fieldHeight);

        // Blue team zone (right) with gradient and glow
        const blueGradient = this.ctx.createLinearGradient(fieldX + fieldWidth - goombaProtectionDepth, fieldY, fieldX + fieldWidth, fieldY);
        blueGradient.addColorStop(0, 'rgba(65, 105, 225, 0.1)');
        blueGradient.addColorStop(0.3, 'rgba(65, 105, 225, 0.2)');
        blueGradient.addColorStop(1, 'rgba(65, 105, 225, 0.4)');

        this.ctx.fillStyle = blueGradient;
        this.ctx.fillRect(fieldX + fieldWidth - goombaProtectionDepth, fieldY, goombaProtectionDepth, fieldHeight);

        // Animated border lines with glow
        const time = Date.now() * 0.005;
        const glowIntensity = 0.5 + Math.sin(time) * 0.3;

        // Red zone border
        this.ctx.save();
        this.ctx.shadowColor = '#DC143C';
        this.ctx.shadowBlur = 10 * glowIntensity;
        this.ctx.strokeStyle = `rgba(220, 20, 60, ${0.8 + glowIntensity * 0.2})`;
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([15, 8]);
        this.ctx.lineDashOffset = time * 20;
        this.ctx.beginPath();
        this.ctx.moveTo(fieldX + goombaProtectionDepth, fieldY);
        this.ctx.lineTo(fieldX + goombaProtectionDepth, fieldY + fieldHeight);
        this.ctx.stroke();
        this.ctx.restore();

        // Blue zone border
        this.ctx.save();
        this.ctx.shadowColor = '#4169E1';
        this.ctx.shadowBlur = 10 * glowIntensity;
        this.ctx.strokeStyle = `rgba(65, 105, 225, ${0.8 + glowIntensity * 0.2})`;
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([15, 8]);
        this.ctx.lineDashOffset = -time * 20;
        this.ctx.beginPath();
        this.ctx.moveTo(fieldX + fieldWidth - goombaProtectionDepth, fieldY);
        this.ctx.lineTo(fieldX + fieldWidth - goombaProtectionDepth, fieldY + fieldHeight);
        this.ctx.stroke();
        this.ctx.restore();

        this.ctx.setLineDash([]);

        // Stylized warning symbols with animation
        const symbolScale = 1 + Math.sin(time * 2) * 0.1;

        // Red zone symbol
        this.ctx.save();
        this.ctx.translate(fieldX + goombaProtectionDepth/2, fieldY + fieldHeight/2);
        this.ctx.scale(symbolScale, symbolScale);
        this.ctx.shadowColor = '#DC143C';
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('⛔', 0, 0);
        this.ctx.restore();

        // Blue zone symbol
        this.ctx.save();
        this.ctx.translate(fieldX + fieldWidth - goombaProtectionDepth/2, fieldY + fieldHeight/2);
        this.ctx.scale(symbolScale, symbolScale);
        this.ctx.shadowColor = '#4169E1';
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('⛔', 0, 0);
        this.ctx.restore();

        // Add decorative corner elements
        this.drawZoneCorners(fieldX, fieldY, goombaProtectionDepth, fieldHeight, '#DC143C');
        this.drawZoneCorners(fieldX + fieldWidth - goombaProtectionDepth, fieldY, goombaProtectionDepth, fieldHeight, '#4169E1');
    }

    drawZoneCorners(x, y, width, height, color) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';

        const cornerSize = 15;

        // Top-left corner
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + cornerSize);
        this.ctx.lineTo(x, y);
        this.ctx.lineTo(x + cornerSize, y);
        this.ctx.stroke();

        // Top-right corner
        this.ctx.beginPath();
        this.ctx.moveTo(x + width - cornerSize, y);
        this.ctx.lineTo(x + width, y);
        this.ctx.lineTo(x + width, y + cornerSize);
        this.ctx.stroke();

        // Bottom-left corner
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + height - cornerSize);
        this.ctx.lineTo(x, y + height);
        this.ctx.lineTo(x + cornerSize, y + height);
        this.ctx.stroke();

        // Bottom-right corner
        this.ctx.beginPath();
        this.ctx.moveTo(x + width - cornerSize, y + height);
        this.ctx.lineTo(x + width, y + height);
        this.ctx.lineTo(x + width, y + height - cornerSize);
        this.ctx.stroke();
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
        const radius = 15;

        // Shadow with 3D effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.beginPath();
        this.ctx.ellipse(x + 3, y + radius + 2, radius * 0.9, radius * 0.3, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Goomba body with gradient
        const bodyGradient = this.ctx.createRadialGradient(
            x - 5, y - 5, 0,
            x, y, radius
        );
        bodyGradient.addColorStop(0, '#D2691E'); // Sandy brown highlight
        bodyGradient.addColorStop(0.6, '#8B4513'); // Saddle brown
        bodyGradient.addColorStop(1, '#654321'); // Dark brown shadow

        this.ctx.fillStyle = bodyGradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Body outline
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();

        // Team color indicator with glow
        this.ctx.save();
        this.ctx.shadowColor = teamColor;
        this.ctx.shadowBlur = 8;
        this.ctx.fillStyle = teamColor;
        this.ctx.beginPath();
        this.ctx.arc(x, y - 8, 6, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        // Team color outline
        this.ctx.strokeStyle = teamColor === '#DC143C' ? '#8B0000' : '#000080';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y - 8, 6, 0, Math.PI * 2);
        this.ctx.stroke();

        // Eyes with 3D effect
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(x - 6, y - 3, 4, 0, Math.PI * 2);
        this.ctx.arc(x + 6, y - 3, 4, 0, Math.PI * 2);
        this.ctx.fill();

        // Eye outlines
        this.ctx.strokeStyle = '#CCCCCC';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(x - 6, y - 3, 4, 0, Math.PI * 2);
        this.ctx.arc(x + 6, y - 3, 4, 0, Math.PI * 2);
        this.ctx.stroke();

        // Pupils with angry expression
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(x - 6, y - 2, 2, 0, Math.PI * 2);
        this.ctx.arc(x + 6, y - 2, 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Angry eyebrows
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(x - 9, y - 8);
        this.ctx.lineTo(x - 3, y - 6);
        this.ctx.moveTo(x + 3, y - 6);
        this.ctx.lineTo(x + 9, y - 8);
        this.ctx.stroke();

        // Mouth (frown)
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y + 3, 4, 0.2 * Math.PI, 0.8 * Math.PI);
        this.ctx.stroke();
    }

    drawPlayer(player, label) {
        const radius = player.radius;

        // Enhanced shadow with 3D effect
        let shadowOffsetX = 4;
        let shadowOffsetY = 4;
        let shadowScale = 0.8;

        if (player.isSliding) {
            shadowOffsetX += player.slideDirection.x * 6;
            shadowOffsetY += player.slideDirection.y * 6;
            shadowScale = 1.2;
        }

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.beginPath();
        this.ctx.ellipse(player.x + shadowOffsetX, player.y + shadowOffsetY, radius * shadowScale, radius * 0.4, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Player body with gradient and effects
        let bodyColor = player.color;
        let lightColor = player.lightColor;
        let glowColor = player.color;

        if (player.isStunned) {
            // Flashing effect when stunned
            const stunFlash = Math.sin(Date.now() * 0.02) > 0;
            bodyColor = stunFlash ? '#FFB6C1' : '#888888';
            lightColor = stunFlash ? '#FFC0CB' : '#AAAAAA';
            glowColor = '#FFD700';
        } else if (player.isSliding) {
            // Intense colors when sliding
            bodyColor = player.team === 1 ? '#FF0000' : '#0000FF';
            lightColor = player.team === 1 ? '#FF6666' : '#6666FF';
            glowColor = bodyColor;
        }

        // Body gradient
        const bodyGradient = this.ctx.createRadialGradient(
            player.x - radius * 0.3, player.y - radius * 0.3, 0,
            player.x, player.y, radius
        );
        bodyGradient.addColorStop(0, lightColor);
        bodyGradient.addColorStop(0.7, bodyColor);
        bodyGradient.addColorStop(1, this.darkenColor(bodyColor, 0.3));

        // Glow effect for special states
        if (player.isSliding || player.isStunned) {
            this.ctx.save();
            this.ctx.shadowColor = glowColor;
            this.ctx.shadowBlur = 15;
            this.ctx.fillStyle = bodyGradient;
            this.ctx.beginPath();
            this.ctx.arc(player.x, player.y, radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }

        // Main body
        this.ctx.fillStyle = bodyGradient;
        this.ctx.beginPath();
        this.ctx.arc(player.x, player.y, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Body outline with team color
        this.ctx.strokeStyle = this.darkenColor(bodyColor, 0.4);
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(player.x, player.y, radius, 0, Math.PI * 2);
        this.ctx.stroke();

        // Inner highlight
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(player.x, player.y, radius - 2, 0, Math.PI * 2);
        this.ctx.stroke();

        // Player label with shadow
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        this.ctx.shadowOffsetX = 1;
        this.ctx.shadowOffsetY = 1;
        this.ctx.shadowBlur = 2;
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(label, player.x, player.y);
        this.ctx.restore();

        // Ball ownership indicator
        if (this.shell.owner === player) {
            this.ctx.save();
            this.ctx.shadowColor = '#FFD700';
            this.ctx.shadowBlur = 10;
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 4;
            this.ctx.setLineDash([8, 4]);
            this.ctx.beginPath();
            this.ctx.arc(player.x, player.y, radius + 8, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            this.ctx.restore();
        }

        // Slide cooldown indicator
        if (player.slideCooldown > 0) {
            const cooldownPercent = 1 - (player.slideCooldown / player.slideMaxCooldown);
            this.ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
            this.ctx.beginPath();
            this.ctx.arc(player.x, player.y - radius - 12, 6, -Math.PI/2, -Math.PI/2 + (Math.PI * 2 * cooldownPercent));
            this.ctx.lineTo(player.x, player.y - radius - 12);
            this.ctx.fill();

            // Cooldown border
            this.ctx.strokeStyle = '#DAA520';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(player.x, player.y - radius - 12, 6, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Stun indicator with animation
        if (player.isStunned) {
            const time = Date.now() * 0.01;
            for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI * 2 + time;
                const starX = player.x + Math.cos(angle) * (radius + 15);
                const starY = player.y + Math.sin(angle) * (radius + 15) - 10;

                this.ctx.save();
                this.ctx.translate(starX, starY);
                this.ctx.rotate(time);
                this.ctx.fillStyle = '#FFD700';
                this.ctx.font = 'bold 16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('⭐', 0, 0);
                this.ctx.restore();
            }
        }
    }

    darkenColor(color, factor) {
        // Simple color darkening function
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgb(${Math.floor(r * (1 - factor))}, ${Math.floor(g * (1 - factor))}, ${Math.floor(b * (1 - factor))})`;
        }
        return color;
    }

    drawShell() {
        // Draw trail first (behind the ball)
        this.drawShellTrail();

        // Enhanced shadow with motion blur
        const speed = Math.sqrt(this.shell.vx * this.shell.vx + this.shell.vy * this.shell.vy);
        const shadowOffset = 3 + speed * 0.5;
        const shadowBlur = 2 + speed * 0.3;

        this.ctx.save();
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = shadowBlur;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.beginPath();
        this.ctx.ellipse(this.shell.x + shadowOffset, this.shell.y + shadowOffset, this.shell.radius * 0.9, this.shell.radius * 0.4, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        // Main shell body with enhanced gradient
        const mainGradient = this.ctx.createRadialGradient(
            this.shell.x - this.shell.radius * 0.3, this.shell.y - this.shell.radius * 0.3, 0,
            this.shell.x, this.shell.y, this.shell.radius * 1.2
        );
        mainGradient.addColorStop(0, '#FFFF66'); // Bright yellow highlight
        mainGradient.addColorStop(0.3, '#FFD700'); // Gold
        mainGradient.addColorStop(0.7, '#FFA500'); // Orange
        mainGradient.addColorStop(1, '#FF8C00'); // Dark orange shadow

        this.ctx.fillStyle = mainGradient;
        this.ctx.beginPath();
        this.ctx.arc(this.shell.x, this.shell.y, this.shell.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Outer border with glow
        this.ctx.save();
        this.ctx.shadowColor = '#FFD700';
        this.ctx.shadowBlur = 8;
        this.ctx.strokeStyle = '#FF6347';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.arc(this.shell.x, this.shell.y, this.shell.radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();

        // Inner highlight ring
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.shell.x, this.shell.y, this.shell.radius - 3, 0, Math.PI * 2);
        this.ctx.stroke();

        // Rotating shell pattern with enhanced spikes
        this.ctx.save();
        this.ctx.translate(this.shell.x, this.shell.y);
        this.ctx.rotate(this.shell.rotation);

        // Main spikes
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const innerRadius = this.shell.radius - 8;
            const outerRadius = this.shell.radius + 6;

            // Spike gradient
            const spikeGradient = this.ctx.createLinearGradient(
                Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius,
                Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius
            );
            spikeGradient.addColorStop(0, '#FF8C00');
            spikeGradient.addColorStop(1, '#FF4500');

            this.ctx.fillStyle = spikeGradient;
            this.ctx.beginPath();
            this.ctx.moveTo(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius);
            this.ctx.lineTo(Math.cos(angle + 0.2) * (innerRadius + 2), Math.sin(angle + 0.2) * (innerRadius + 2));
            this.ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
            this.ctx.lineTo(Math.cos(angle - 0.2) * (innerRadius + 2), Math.sin(angle - 0.2) * (innerRadius + 2));
            this.ctx.closePath();
            this.ctx.fill();

            // Spike outline
            this.ctx.strokeStyle = '#8B0000';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }

        // Inner decorative ring
        this.ctx.strokeStyle = '#FF6347';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.shell.radius - 10, 0, Math.PI * 2);
        this.ctx.stroke();

        // Center core
        const coreGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 6);
        coreGradient.addColorStop(0, '#FFFF99');
        coreGradient.addColorStop(1, '#FFD700');

        this.ctx.fillStyle = coreGradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 6, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = '#FF8C00';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.restore();

        // Speed lines when moving fast
        if (speed > 5) {
            this.drawSpeedLines(speed);
        }
    }

    drawSpeedLines(speed) {
        const lineCount = Math.min(Math.floor(speed / 2), 8);
        const direction = Math.atan2(this.shell.vy, this.shell.vx);

        this.ctx.save();
        this.ctx.translate(this.shell.x, this.shell.y);
        this.ctx.rotate(direction + Math.PI); // Opposite direction of movement

        for (let i = 0; i < lineCount; i++) {
            const distance = 30 + i * 15;
            const width = 2 + i * 0.5;
            const alpha = (1 - i / lineCount) * 0.6;

            this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.lineWidth = width;
            this.ctx.lineCap = 'round';

            this.ctx.beginPath();
            this.ctx.moveTo(distance, -width);
            this.ctx.lineTo(distance + 20, 0);
            this.ctx.lineTo(distance, width);
            this.ctx.stroke();
        }

        this.ctx.restore();

        // Owner indicator
        if (this.shell.owner) {
            this.ctx.fillStyle = this.shell.owner.color;
            this.ctx.beginPath();
            this.ctx.arc(this.shell.x, this.shell.y - this.shell.radius - 10, 5, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Protection indicator - escudo dourado quando a bola está protegida
        if (this.shell.protectionTime > 0) {
            const protectionAlpha = Math.min(this.shell.protectionTime / this.shell.protectionDuration, 1);
            this.ctx.save();
            this.ctx.globalAlpha = protectionAlpha * 0.7;

            // Desenha um escudo dourado ao redor da bola
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 4;
            this.ctx.setLineDash([8, 4]);
            this.ctx.beginPath();
            this.ctx.arc(this.shell.x, this.shell.y, this.shell.radius + 8, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            // Adiciona um símbolo de escudo
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('🛡️', this.shell.x, this.shell.y - this.shell.radius - 20);

            this.ctx.restore();
        }
    }

    drawShellTrail() {
        if (!this.shell.trail || this.shell.trail.length < 2) return;

        const currentTime = Date.now();
        const maxAge = 400; // 400ms trail duration

        // Draw trail as connected circles with decreasing opacity and size
        for (let i = 0; i < this.shell.trail.length; i++) {
            const point = this.shell.trail[i];
            const age = currentTime - point.time;

            // Calculate opacity and size based on age
            const progress = 1 - (age / maxAge);
            const alpha = progress * 0.8; // Max opacity of 0.8
            const size = this.shell.radius * (0.2 + progress * 0.6); // Size from 20% to 80% of ball

            if (alpha > 0) {
                this.ctx.save();
                this.ctx.globalAlpha = alpha;

                // Create gradient for each trail point
                const gradient = this.ctx.createRadialGradient(
                    point.x, point.y, 0,
                    point.x, point.y, size
                );

                // Color transitions from bright yellow to orange to red
                const hue = 60 - (progress * 30); // From red to yellow
                const saturation = 100;
                const lightness = 50 + (progress * 30); // Brighter for newer points

                gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness + 20}%, ${alpha})`);
                gradient.addColorStop(1, `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha * 0.3})`);

                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
                this.ctx.fill();

                // Add sparkle effect for recent trail points
                if (progress > 0.7) {
                    const sparkles = 3;
                    for (let j = 0; j < sparkles; j++) {
                        const sparkleAngle = (j / sparkles) * Math.PI * 2 + currentTime * 0.01;
                        const sparkleDistance = size * 0.8;
                        const sparkleX = point.x + Math.cos(sparkleAngle) * sparkleDistance;
                        const sparkleY = point.y + Math.sin(sparkleAngle) * sparkleDistance;

                        this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
                        this.ctx.beginPath();
                        this.ctx.arc(sparkleX, sparkleY, 1.5, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                }

                this.ctx.restore();
            }
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

        // Calculate arrow length based on charge power (grows with charge)
        const minLength = 40;
        const maxLength = 100;
        const arrowLength = minLength + (maxLength - minLength) * chargePower;

        // Calculate arrow end position
        const endX = player.x + dx * arrowLength;
        const endY = player.y + dy * arrowLength;

        // Calculate angle for arrow head
        const aimAngle = Math.atan2(dy, dx);

        // Draw Mario Party style arrow
        this.drawMarioPartyArrow(player.x, player.y, endX, endY, aimAngle, chargePower);

    }

    drawMarioPartyArrow(startX, startY, endX, endY, angle, chargePower) {
        // Calculate arrow dimensions based on charge power
        const baseWidth = 12 + chargePower * 8; // Width of arrow shaft
        const headWidth = 25 + chargePower * 15; // Width of arrow head
        const headLength = 20 + chargePower * 10; // Length of arrow head
        const shaftLength = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2) - headLength;

        // Different colors for kick vs pass
        let colors;
        if (this.kickSystem.actionType === 'pass') {
            // Blue gradient for pass
            colors = {
                main: '#4A90E2',
                light: '#6BB6FF',
                dark: '#2E5BDA',
                shadow: '#1E3A8A'
            };
        } else {
            // Orange/Red gradient for kick (Mario Party style)
            const intensity = chargePower;
            colors = {
                main: `rgb(${255}, ${140 - intensity * 40}, ${0})`, // Orange to red-orange
                light: `rgb(${255}, ${180 - intensity * 30}, ${60})`, // Lighter version
                dark: `rgb(${200 - intensity * 50}, ${100 - intensity * 60}, ${0})`, // Darker version
                shadow: `rgb(${120}, ${60}, ${0})` // Shadow color
            };
        }

        this.ctx.save();
        this.ctx.translate(startX, startY);
        this.ctx.rotate(angle);

        // Draw glow effect first
        if (chargePower > 0.3) {
            this.ctx.save();
            this.ctx.shadowColor = colors.main;
            this.ctx.shadowBlur = 15 + chargePower * 10;
            this.ctx.fillStyle = colors.main;
            this.drawArrowShape(shaftLength, baseWidth, headWidth, headLength);
            this.ctx.restore();
        }

        // Draw shadow (offset)
        this.ctx.save();
        this.ctx.translate(3, 3);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.drawArrowShape(shaftLength, baseWidth, headWidth, headLength);
        this.ctx.restore();

        // Draw main arrow with gradient
        const gradient = this.ctx.createLinearGradient(0, -headWidth/2, 0, headWidth/2);
        gradient.addColorStop(0, colors.light);
        gradient.addColorStop(0.5, colors.main);
        gradient.addColorStop(1, colors.dark);

        this.ctx.fillStyle = gradient;
        this.drawArrowShape(shaftLength, baseWidth, headWidth, headLength);

        // Draw border/outline
        this.ctx.strokeStyle = colors.shadow;
        this.ctx.lineWidth = 2;
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
        this.drawArrowShape(shaftLength, baseWidth, headWidth, headLength, true);

        // Draw highlight on top
        const highlightGradient = this.ctx.createLinearGradient(0, -headWidth/4, 0, 0);
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');

        this.ctx.fillStyle = highlightGradient;
        this.drawArrowShape(shaftLength * 0.9, baseWidth * 0.6, headWidth * 0.7, headLength * 0.8);

        // Add sparkle effects for high charge
        if (chargePower > 0.5) {
            const sparkleCount = Math.floor(chargePower * 6);
            for (let i = 0; i < sparkleCount; i++) {
                const sparkleX = (Math.random() - 0.5) * shaftLength;
                const sparkleY = (Math.random() - 0.5) * baseWidth;
                const sparkleSize = 2 + Math.random() * 3;
                const sparkleAlpha = 0.5 + Math.random() * 0.5;

                this.ctx.fillStyle = `rgba(255, 255, 255, ${sparkleAlpha})`;
                this.ctx.beginPath();
                this.ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        this.ctx.restore();

        // Draw power indicator circle at the base
        const pulseSize = 1 + Math.sin(Date.now() * 0.01) * 0.2;
        this.ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + chargePower * 0.4})`;
        this.ctx.strokeStyle = colors.main;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(startX, startY, (8 + chargePower * 6) * pulseSize, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawArrowShape(shaftLength, baseWidth, headWidth, headLength, strokeOnly = false) {
        this.ctx.beginPath();

        // Start from the back of the shaft
        this.ctx.moveTo(0, -baseWidth/2);

        // Top of shaft
        this.ctx.lineTo(shaftLength, -baseWidth/2);

        // Top of arrow head
        this.ctx.lineTo(shaftLength, -headWidth/2);

        // Arrow tip
        this.ctx.lineTo(shaftLength + headLength, 0);

        // Bottom of arrow head
        this.ctx.lineTo(shaftLength, headWidth/2);

        // Bottom of shaft
        this.ctx.lineTo(shaftLength, baseWidth/2);

        // Back to start
        this.ctx.lineTo(0, baseWidth/2);

        this.ctx.closePath();

        if (strokeOnly) {
            this.ctx.stroke();
        } else {
            this.ctx.fill();
        }
    }

    drawPassIndicator() {
        // Mostra indicação de passe disponível quando jogador tem a bola
        this.players.forEach(player => {
            if (this.shell.owner === player && !this.kickSystem.isCharging) {
                const teammate = this.findNearestTeammate(player);
                if (teammate) {
                    // Desenha linha pontilhada para o companheiro
                    this.ctx.strokeStyle = `rgba(100, 150, 255, 0.5)`;
                    this.ctx.lineWidth = 2;
                    this.ctx.setLineDash([5, 5]);
                    this.ctx.beginPath();
                    this.ctx.moveTo(player.x, player.y);
                    this.ctx.lineTo(teammate.x, teammate.y);
                    this.ctx.stroke();
                    this.ctx.setLineDash([]); // Reset line dash

                    // Desenha círculo no companheiro
                    this.ctx.fillStyle = `rgba(100, 150, 255, 0.3)`;
                    this.ctx.beginPath();
                    this.ctx.arc(teammate.x, teammate.y, teammate.radius + 5, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        });
    }

    drawHitEffects() {
        if (!this.hitEffects) return;

        this.hitEffects.forEach(effect => {
            const progress = effect.time / effect.maxTime;
            const alpha = 1 - progress;

            if (effect.type === 'pass') {
                // Draw pass effect - animated line from passer to receiver
                const lineProgress = Math.min(progress * 2, 1); // Line travels in first half
                const fadeProgress = Math.max((progress - 0.5) * 2, 0); // Fade in second half

                const currentX = effect.fromX + (effect.toX - effect.fromX) * lineProgress;
                const currentY = effect.fromY + (effect.toY - effect.fromY) * lineProgress;

                // Draw animated line
                this.ctx.strokeStyle = `rgba(100, 150, 255, ${alpha})`;
                this.ctx.lineWidth = 4;
                this.ctx.setLineDash([10, 5]);
                this.ctx.beginPath();
                this.ctx.moveTo(effect.fromX, effect.fromY);
                this.ctx.lineTo(currentX, currentY);
                this.ctx.stroke();
                this.ctx.setLineDash([]);

                // Draw moving pass indicator
                if (lineProgress < 1) {
                    this.ctx.fillStyle = `rgba(100, 150, 255, ${alpha})`;
                    this.ctx.beginPath();
                    this.ctx.arc(currentX, currentY, 8, 0, Math.PI * 2);
                    this.ctx.fill();

                    // Add sparkle effect
                    for (let i = 0; i < 4; i++) {
                        const angle = (i / 4) * Math.PI * 2 + progress * Math.PI * 4;
                        const sparkleX = currentX + Math.cos(angle) * 15;
                        const sparkleY = currentY + Math.sin(angle) * 15;

                        this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
                        this.ctx.beginPath();
                        this.ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                }
            } else {
                // Original hit effect
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
