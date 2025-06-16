// Game State
class CascobolGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

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

        // Celebration system
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

        // Players (4 players total - 2v2)
        this.players = [
            // Team 1 (Red)
            {
                id: 1,
                x: 150,
                y: 300,
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
                x: 150,
                y: 500,
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
                x: 1050,
                y: 300,
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
                x: 1050,
                y: 500,
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

        // Shell (mais rápida e responsiva)
        this.shell = {
            x: 600,
            y: 400,
            vx: 0,
            vy: 0,
            radius: 16,
            owner: null,
            lastOwner: null,
            speed: 12 // Velocidade base aumentada
        };

        // Sistema de chute
        this.kickSystem = {
            isCharging: false,
            chargingPlayer: null,
            chargeStartTime: 0,
            maxChargeTime: 1500, // 1.5 segundos para carga máxima
            minPower: 3,
            maxPower: 15,
            aimAngle: 0
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
        this.setupUI();

        // Game loop
        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
    }

    initializeGoombas() {
        const { width, height } = this.canvas;

        // Calcula dimensões do campo baseado no novo layout
        const fieldMargin = 80;
        const fieldWidth = Math.min(width - fieldMargin * 2, 600);
        const fieldHeight = Math.min(height - fieldMargin * 2, 400);
        const fieldX = (width - fieldWidth) / 2;
        const fieldY = (height - fieldHeight) / 2;

        // Posições dos Goombas nas zonas protegidas (como na referência)
        const borderOffset = 30;

        // Team 1 goombas (lado direito - azul)
        this.goombaPositions.team1 = [
            // Borda direita
            { x: fieldX + fieldWidth - borderOffset, y: fieldY + fieldHeight * 0.2, active: true },
            { x: fieldX + fieldWidth - borderOffset, y: fieldY + fieldHeight * 0.35, active: true },
            { x: fieldX + fieldWidth - borderOffset, y: fieldY + fieldHeight * 0.5, active: true },
            { x: fieldX + fieldWidth - borderOffset, y: fieldY + fieldHeight * 0.65, active: true },
            { x: fieldX + fieldWidth - borderOffset, y: fieldY + fieldHeight * 0.8, active: true },
            // Borda superior direita
            { x: fieldX + fieldWidth * 0.7, y: fieldY + borderOffset, active: true },
            { x: fieldX + fieldWidth * 0.85, y: fieldY + borderOffset, active: true }
        ];

        // Team 2 goombas (lado esquerdo - vermelho)
        this.goombaPositions.team2 = [
            // Borda esquerda
            { x: fieldX + borderOffset, y: fieldY + fieldHeight * 0.2, active: true },
            { x: fieldX + borderOffset, y: fieldY + fieldHeight * 0.35, active: true },
            { x: fieldX + borderOffset, y: fieldY + fieldHeight * 0.5, active: true },
            { x: fieldX + borderOffset, y: fieldY + fieldHeight * 0.65, active: true },
            { x: fieldX + borderOffset, y: fieldY + fieldHeight * 0.8, active: true },
            // Borda superior esquerda
            { x: fieldX + fieldWidth * 0.15, y: fieldY + borderOffset, active: true },
            { x: fieldX + fieldWidth * 0.3, y: fieldY + borderOffset, active: true }
        ];
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
                    if (e.code === player.controls.action && this.shell.owner === player && !this.kickSystem.isCharging) {
                        this.startKickCharge(player);
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
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('playAgainButton').addEventListener('click', () => {
            this.resetGame();
            this.startGame();
        });

        document.getElementById('backToMenuButton').addEventListener('click', () => {
            this.showScreen('startScreen');
            this.gameState = 'menu';
        });
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    startGame() {
        this.resetGame();
        this.gameState = 'playing';
        this.gameStartTime = Date.now();
        this.showScreen('gameScreen');
        requestAnimationFrame(this.gameLoop);
    }

    resetGame() {
        // Reset teams
        this.team1.goombas = 7;
        this.team2.goombas = 7;

        // Calcula posições baseadas no novo tamanho do campo
        const { width, height } = this.canvas;
        const fieldMargin = 80;
        const fieldWidth = Math.min(width - fieldMargin * 2, 600);
        const fieldHeight = Math.min(height - fieldMargin * 2, 400);
        const fieldX = (width - fieldWidth) / 2;
        const fieldY = (height - fieldHeight) / 2;
        const centerX = fieldX + fieldWidth / 2;
        const centerY = fieldY + fieldHeight / 2;

        // Posições dos jogadores dentro da área permitida
        const limitDistance = 60;
        const playerAreaLeft = fieldX + limitDistance + 30;
        const playerAreaRight = fieldX + fieldWidth - limitDistance - 30;

        // Reset players to starting positions
        this.players[0].x = playerAreaLeft + 50; this.players[0].y = centerY - 50; this.players[0].vx = 0; this.players[0].vy = 0;
        this.players[1].x = playerAreaLeft + 50; this.players[1].y = centerY + 50; this.players[1].vx = 0; this.players[1].vy = 0;
        this.players[2].x = playerAreaRight - 50; this.players[2].y = centerY - 50; this.players[2].vx = 0; this.players[2].vy = 0;
        this.players[3].x = playerAreaRight - 50; this.players[3].y = centerY + 50; this.players[3].vx = 0; this.players[3].vy = 0;

        // Reset shell
        this.shell.x = centerX;
        this.shell.y = centerY;
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
    }

    gameLoop(currentTime) {
        if (this.gameState !== 'playing') return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();
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

        const speed = 0.8;
        const friction = 0.88;
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
                // Movimento normal apenas se não estiver carregando chute
                if (this.keys[player.controls.up]) dy -= 1;
                if (this.keys[player.controls.down]) dy += 1;
                if (this.keys[player.controls.left]) dx -= 1;
                if (this.keys[player.controls.right]) dx += 1;

                // Normalize movement
                if (dx !== 0 || dy !== 0) {
                    const length = Math.sqrt(dx * dx + dy * dy);
                    dx /= length;
                    dy /= length;
                }

                // Apply movement
                player.vx += dx * speed;
                player.vy += dy * speed;
                player.vx *= friction;
                player.vy *= friction;
            }

            // Update position
            this.updatePlayerPosition(player);
        });
    }

    updateKickSystem() {
        // Se está resetando, comemorando ou jogadores travados, cancela qualquer chute em andamento
        if (this.isResetting || this.isCelebrating || this.playersLocked) {
            this.kickSystem.isCharging = false;
            this.kickSystem.chargingPlayer = null;
            return;
        }

        if (this.kickSystem.isCharging && this.kickSystem.chargingPlayer) {
            const player = this.kickSystem.chargingPlayer;
            const currentTime = Date.now();
            const chargeTime = currentTime - this.kickSystem.chargeStartTime;

            // Update aim angle based on player input (apenas rotação)
            let aimX = 0, aimY = 0;
            if (this.keys[player.controls.up]) aimY -= 1;
            if (this.keys[player.controls.down]) aimY += 1;
            if (this.keys[player.controls.left]) aimX -= 1;
            if (this.keys[player.controls.right]) aimX += 1;

            if (aimX !== 0 || aimY !== 0) {
                this.kickSystem.aimAngle = Math.atan2(aimY, aimX);
            }

            // NÃO auto-release - jogador deve soltar manualmente
            // Apenas limita a força máxima
        }
    }

    startKickCharge(player) {
        this.kickSystem.isCharging = true;
        this.kickSystem.chargingPlayer = player;
        this.kickSystem.chargeStartTime = Date.now();

        // Começar com a direção atual do jogador ou direção padrão
        const targetX = player.team === 1 ? this.canvas.width - 100 : 100;
        const dx = targetX - player.x;
        const dy = this.canvas.height / 2 - player.y;
        this.kickSystem.aimAngle = Math.atan2(dy, dx);
    }

    releaseKick() {
        if (!this.kickSystem.isCharging || !this.kickSystem.chargingPlayer) return;

        const player = this.kickSystem.chargingPlayer;
        const chargeTime = Date.now() - this.kickSystem.chargeStartTime;
        const chargeRatio = Math.min(chargeTime / this.kickSystem.maxChargeTime, 1);

        // Calculate power based on charge time
        const power = this.kickSystem.minPower + (this.kickSystem.maxPower - this.kickSystem.minPower) * chargeRatio;

        // Apply kick
        this.shell.vx = Math.cos(this.kickSystem.aimAngle) * power;
        this.shell.vy = Math.sin(this.kickSystem.aimAngle) * power;
        this.shell.owner = null;
        this.shell.lastOwner = player;

        // Reset kick system
        this.kickSystem.isCharging = false;
        this.kickSystem.chargingPlayer = null;
        this.kickSystem.chargeStartTime = 0;
    }

    attemptSlideTackle(player) {
        // Verifica se o jogador pode fazer slide tackle
        if (player.isSliding || player.isStunned || player.slideCooldown > 0) {
            return; // Não pode fazer slide se já está fazendo, atordoado ou em cooldown
        }

        // Calcula direção do movimento atual ou direção para a bola
        let slideDirection = { x: 0, y: 0 };

        // Se o jogador está se movendo, usa a direção do movimento
        if (Math.abs(player.vx) > 0.1 || Math.abs(player.vy) > 0.1) {
            const speed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
            slideDirection.x = player.vx / speed;
            slideDirection.y = player.vy / speed;
        } else {
            // Se não está se movendo, usa direção para a bola (se existir)
            if (this.shell.owner) {
                const dx = this.shell.x - player.x;
                const dy = this.shell.y - player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > 0) {
                    slideDirection.x = dx / distance;
                    slideDirection.y = dy / distance;
                }
            } else {
                // Direção padrão baseada no time
                slideDirection.x = player.team === 1 ? 1 : -1;
                slideDirection.y = 0;
            }
        }

        // Inicia o slide tackle
        player.isSliding = true;
        player.slideDirection = slideDirection;
        player.slideSpeed = 15; // Velocidade alta do slide
        player.slideDuration = 0;

        console.log(`Jogador ${player.id} iniciou slide tackle!`);

        // Efeito visual de início do slide
        this.createSlideEffect(player.x, player.y);
    }

    createSlideEffect(x, y) {
        // Cria efeito visual de slide tackle
        const effect = {
            x: x,
            y: y,
            startTime: Date.now(),
            duration: 600, // 0.6 segundos
            type: 'slide', // Identifica como efeito de slide
            particles: []
        };

        // Cria partículas para o efeito de slide (poeira/grama)
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            effect.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                size: 3 + Math.random() * 4,
                color: '#8B4513' // Marrom para poeira/grama
            });
        }

        // Adiciona à lista de efeitos ativos
        if (!this.hitEffects) {
            this.hitEffects = [];
        }
        this.hitEffects.push(effect);
    }

    createImpactEffect(x, y) {
        // Cria efeito visual de impacto do slide tackle
        const effect = {
            x: x,
            y: y,
            startTime: Date.now(),
            duration: 500, // 0.5 segundos
            type: 'impact', // Identifica como efeito de impacto
            particles: []
        };

        // Cria partículas para o efeito de impacto
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2;
            const speed = 3 + Math.random() * 4;
            effect.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                size: 4 + Math.random() * 3,
                color: '#FF4500' // Laranja/vermelho para impacto
            });
        }

        // Adiciona à lista de efeitos ativos
        if (!this.hitEffects) {
            this.hitEffects = [];
        }
        this.hitEffects.push(effect);
    }

    createStealEffect(x, y) {
        // Cria efeito visual de roubo bem-sucedido
        const effect = {
            x: x,
            y: y,
            startTime: Date.now(),
            duration: 800, // 0.8 segundos
            type: 'steal', // Identifica como efeito de roubo
            particles: []
        };

        // Cria partículas para o efeito de roubo (diferentes das de eliminação)
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const speed = 1.5 + Math.random() * 2;
            effect.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                size: 2 + Math.random() * 3,
                color: '#00BFFF' // Azul ciano para roubo (mais visível)
            });
        }

        // Adiciona à lista de efeitos ativos
        if (!this.hitEffects) {
            this.hitEffects = [];
        }
        this.hitEffects.push(effect);
    }

    updatePlayerPosition(player) {
        player.x += player.vx;
        player.y += player.vy;

        // Usa os limites das linhas brancas se estiverem definidos
        if (this.playerBounds) {
            const bounds = this.playerBounds;
            const radius = player.radius;

            // Limites das linhas brancas (área restrita dos jogadores)
            if (player.x - radius < bounds.left) {
                player.x = bounds.left + radius;
                player.vx = 0;
            }
            if (player.x + radius > bounds.right) {
                player.x = bounds.right - radius;
                player.vx = 0;
            }
            if (player.y - radius < bounds.top) {
                player.y = bounds.top + radius;
                player.vy = 0;
            }
            if (player.y + radius > bounds.bottom) {
                player.y = bounds.bottom - radius;
                player.vy = 0;
            }
        } else {
            // Fallback para limites antigos se playerBounds não estiver definido
            const margin = 40;
            const minX = margin + player.radius;
            const maxX = this.canvas.width - margin - player.radius;
            const minY = margin + player.radius;
            const maxY = this.canvas.height - margin - player.radius;

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
    }

    updateShell() {
        // Se a concha tem dono, ela segue o jogador
        if (this.shell.owner) {
            this.shell.x = this.shell.owner.x;
            this.shell.y = this.shell.owner.y - 25; // Um pouco acima do jogador
            this.shell.vx = 0;
            this.shell.vy = 0;
            return;
        }

        const friction = 0.985; // Menos atrito para manter velocidade
        const bounceReduction = 0.85; // Melhor ricochete

        this.shell.x += this.shell.vx;
        this.shell.y += this.shell.vy;

        this.shell.vx *= friction;
        this.shell.vy *= friction;

        // Bounce off walls
        const margin = 40;
        const minX = margin + this.shell.radius;
        const maxX = this.canvas.width - margin - this.shell.radius;
        const minY = margin + this.shell.radius;
        const maxY = this.canvas.height - margin - this.shell.radius;

        if (this.shell.x < minX || this.shell.x > maxX) {
            this.shell.vx *= -bounceReduction;
            this.shell.x = this.shell.x < minX ? minX : maxX;
        }

        if (this.shell.y < minY || this.shell.y > maxY) {
            this.shell.vy *= -bounceReduction;
            this.shell.y = this.shell.y < minY ? minY : maxY;
        }

        // Stop if moving too slowly
        if (Math.abs(this.shell.vx) < 0.5 && Math.abs(this.shell.vy) < 0.5) {
            this.shell.vx = 0;
            this.shell.vy = 0;

            // Se goombas foram atingidos recentemente e a concha parou, inicia comemoração
            if (this.goombasHitThisFrame > 0 && !this.isCelebrating && !this.isResetting) {
                this.totalGoombasHit += this.goombasHitThisFrame;
                this.goombasHitThisFrame = 0;
                this.playersLocked = false; // Destrava jogadores
                this.startCelebration();

                console.log('Concha parou! Jogadores destravados e comemoração iniciada.');
            }
        }
    }

    checkCollisions() {
        // Player-shell collisions for all players
        this.players.forEach(player => {
            this.checkPlayerShellCollision(player);
        });

        // Player-player collisions (slide tackles)
        this.checkPlayerPlayerCollisions();

        // Shell-goomba collisions
        this.checkShellGoombaCollisions();
    }

    checkPlayerPlayerCollisions() {
        for (let i = 0; i < this.players.length; i++) {
            for (let j = i + 1; j < this.players.length; j++) {
                const player1 = this.players[i];
                const player2 = this.players[j];

                const dx = player1.x - player2.x;
                const dy = player1.y - player2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const collisionDistance = player1.radius + player2.radius + 5;

                if (distance < collisionDistance) {
                    // Verifica se algum dos jogadores está fazendo slide tackle
                    if (player1.isSliding || player2.isSliding) {
                        this.handleSlideTackleCollision(player1, player2);
                    }
                }
            }
        }
    }

    handleSlideTackleCollision(player1, player2) {
        const slidingPlayer = player1.isSliding ? player1 : player2;
        const targetPlayer = player1.isSliding ? player2 : player1;

        // Só processa se são de times diferentes
        if (slidingPlayer.team === targetPlayer.team) return;

        console.log(`Jogador ${slidingPlayer.id} atingiu jogador ${targetPlayer.id} com slide tackle!`);

        // Atordoa o jogador atingido
        targetPlayer.isStunned = true;
        targetPlayer.stunnedTime = targetPlayer.maxStunnedTime;

        // Se o jogador atingido tinha a bola, transfere para o atacante
        if (this.shell.owner === targetPlayer) {
            // Cancela qualquer chute em andamento
            if (this.kickSystem.chargingPlayer === targetPlayer) {
                this.kickSystem.isCharging = false;
                this.kickSystem.chargingPlayer = null;
                this.kickSystem.chargeStartTime = 0;
            }

            this.shell.owner = slidingPlayer;
            this.shell.lastOwner = slidingPlayer;

            console.log(`Jogador ${slidingPlayer.id} roubou a bola com slide tackle!`);

            // Efeito visual de roubo bem-sucedido
            this.createStealEffect(this.shell.x, this.shell.y);
        }

        // Aplica knockback no jogador atingido
        const dx = targetPlayer.x - slidingPlayer.x;
        const dy = targetPlayer.y - slidingPlayer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0) {
            const knockbackForce = 8;
            targetPlayer.vx = (dx / distance) * knockbackForce;
            targetPlayer.vy = (dy / distance) * knockbackForce;
        }

        // Para o slide do atacante
        slidingPlayer.isSliding = false;
        slidingPlayer.slideCooldown = slidingPlayer.slideMaxCooldown;
        slidingPlayer.slideSpeed = 0;

        // Efeito visual de impacto
        this.createImpactEffect((slidingPlayer.x + targetPlayer.x) / 2, (slidingPlayer.y + targetPlayer.y) / 2);
    }

    checkPlayerShellCollision(player) {
        const dx = player.x - this.shell.x;
        const dy = player.y - this.shell.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < player.radius + this.shell.radius + 10) {
            // Se a bola não tem dono e está lenta, pega automaticamente
            if (this.shell.owner === null && (Math.abs(this.shell.vx) < 2 && Math.abs(this.shell.vy) < 2)) {
                this.shell.owner = player;
                this.shell.lastOwner = player;
                console.log(`Jogador ${player.id} pegou a bola livre!`);
            }
            // Se a bola tem dono de time adversário e está se movendo, permite roubo por colisão
            else if (this.shell.owner && this.shell.owner.team !== player.team) {
                const shellSpeed = Math.sqrt(this.shell.vx * this.shell.vx + this.shell.vy * this.shell.vy);
                if (shellSpeed > 1) { // Bola em movimento pode ser interceptada
                    console.log(`Jogador ${player.id} interceptou a bola do jogador ${this.shell.owner.id}!`);

                    // Cancela qualquer chute em andamento do jogador anterior
                    if (this.kickSystem.chargingPlayer === this.shell.owner) {
                        this.kickSystem.isCharging = false;
                        this.kickSystem.chargingPlayer = null;
                        this.kickSystem.chargeStartTime = 0;
                    }

                    this.shell.owner = player;
                    this.shell.lastOwner = player;

                    // Reduz a velocidade da bola quando interceptada
                    this.shell.vx *= 0.3;
                    this.shell.vy *= 0.3;

                    // Efeito visual de interceptação
                    this.createStealEffect(this.shell.x, this.shell.y);
                }
            }
        }
    }

    checkShellGoombaCollisions() {
        const shellSpeed = Math.sqrt(this.shell.vx * this.shell.vx + this.shell.vy * this.shell.vy);

        if (shellSpeed < 1) return; // Shell must be moving

        let goombasHit = 0;

        // Check team 1 goombas
        this.goombaPositions.team1.forEach((goomba, index) => {
            if (!goomba.active) return;

            const dx = this.shell.x - goomba.x;
            const dy = this.shell.y - goomba.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.shell.radius + 15) {
                goomba.active = false;
                this.team1.goombas--;
                goombasHit++;

                // Visual feedback
                this.createHitEffect(goomba.x, goomba.y);
            }
        });

        // Check team 2 goombas
        this.goombaPositions.team2.forEach((goomba, index) => {
            if (!goomba.active) return;

            const dx = this.shell.x - goomba.x;
            const dy = this.shell.y - goomba.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.shell.radius + 15) {
                goomba.active = false;
                this.team2.goombas--;
                goombasHit++;

                // Visual feedback
                this.createHitEffect(goomba.x, goomba.y);
            }
        });

        // Se goombas foram atingidos, trava os jogadores e armazena para comemoração posterior
        if (goombasHit > 0) {
            this.goombasHitThisFrame = goombasHit;
            this.lastGoombaHitTime = Date.now();
            this.playersLocked = true; // Trava todos os jogadores imediatamente

            console.log(`${goombasHit} Goomba(s) atingido(s)! Jogadores travados.`);
        }
    }

    createHitEffect(x, y) {
        // Cria efeito visual de eliminação
        const effect = {
            x: x,
            y: y,
            startTime: Date.now(),
            duration: 1000, // 1 segundo
            type: 'elimination', // Identifica como efeito de eliminação
            particles: []
        };

        // Cria partículas para o efeito
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            effect.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                size: 3 + Math.random() * 4,
                color: '#FFD700' // Dourado para eliminação
            });
        }

        // Adiciona à lista de efeitos ativos
        if (!this.hitEffects) {
            this.hitEffects = [];
        }
        this.hitEffects.push(effect);

        console.log(`Goomba eliminated at ${x}, ${y}!`);
    }

    updateHitEffects() {
        if (!this.hitEffects) return;

        const currentTime = Date.now();

        // Atualiza cada efeito
        this.hitEffects.forEach(effect => {
            const elapsed = currentTime - effect.startTime;
            const progress = elapsed / effect.duration;

            // Atualiza partículas
            effect.particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.1; // Gravidade
                particle.life = Math.max(0, 1 - progress);
                particle.vx *= 0.98; // Atrito
                particle.vy *= 0.98;
            });
        });

        // Remove efeitos expirados
        this.hitEffects = this.hitEffects.filter(effect => {
            return (currentTime - effect.startTime) < effect.duration;
        });
    }

    startCelebration() {
        this.isCelebrating = true;
        this.celebrationStartTime = Date.now();

        // Encontra quem fez o gol (último dono da concha)
        this.celebratingPlayer = this.shell.lastOwner;

        // Para a concha imediatamente
        this.shell.vx *= 0.1;
        this.shell.vy *= 0.1;

        // Cancela qualquer chute em andamento
        this.kickSystem.isCharging = false;
        this.kickSystem.chargingPlayer = null;

        // Configura zoom na câmera para o jogador que fez o gol
        if (this.celebratingPlayer) {
            this.targetZoom = 2.5;
            // Centraliza a câmera na posição do jogador
            this.targetCameraX = this.celebratingPlayer.x - this.canvas.width / 2;
            this.targetCameraY = this.celebratingPlayer.y - this.canvas.height / 2;
        }

        console.log('Comemoração iniciada - Gol do jogador!');
    }

    updateCelebration() {
        const currentTime = Date.now();
        const celebrationTime = currentTime - this.celebrationStartTime;

        // Para a concha gradualmente
        this.shell.vx *= 0.9;
        this.shell.vy *= 0.9;

        if (Math.abs(this.shell.vx) < 0.1 && Math.abs(this.shell.vy) < 0.1) {
            this.shell.vx = 0;
            this.shell.vy = 0;
        }

        // Atualiza posição da concha
        this.shell.x += this.shell.vx;
        this.shell.y += this.shell.vy;

        // Verifica se é hora de terminar a comemoração
        if (celebrationTime >= this.celebrationDuration) {
            this.endCelebration();
        }
    }

    endCelebration() {
        console.log('Comemoração terminada - Iniciando reset');

        // Termina comemoração
        this.isCelebrating = false;
        this.celebratingPlayer = null;

        // Reset da câmera para posição central (imediato)
        this.targetZoom = 1;
        this.targetCameraX = 0;
        this.targetCameraY = 0;
        this.cameraZoom = 1;
        this.cameraX = 0;
        this.cameraY = 0;

        // Inicia o reset
        this.startReset();
    }

    startReset() {
        this.isResetting = true;
        this.resetStartTime = Date.now();

        console.log('Reset iniciado');
    }

    updateReset() {
        const currentTime = Date.now();
        const resetTime = currentTime - this.resetStartTime;

        // Aplica atrito extra na concha para parar mais rápido
        this.shell.vx *= 0.9;
        this.shell.vy *= 0.9;

        // Para a concha se estiver muito lenta
        if (Math.abs(this.shell.vx) < 0.1 && Math.abs(this.shell.vy) < 0.1) {
            this.shell.vx = 0;
            this.shell.vy = 0;
        }

        // Atualiza posição da concha
        this.shell.x += this.shell.vx;
        this.shell.y += this.shell.vy;

        // Verifica se é hora de resetar as posições
        if (resetTime >= this.resetDuration || (Math.abs(this.shell.vx) < 0.1 && Math.abs(this.shell.vy) < 0.1)) {
            this.completeReset();
        }
    }

    completeReset() {
        console.log('Reset completo - Reposicionando jogadores e concha');

        // Calcula posições baseadas no novo tamanho do campo
        const { width, height } = this.canvas;
        const fieldMargin = 80;
        const fieldWidth = Math.min(width - fieldMargin * 2, 600);
        const fieldHeight = Math.min(height - fieldMargin * 2, 400);
        const fieldX = (width - fieldWidth) / 2;
        const fieldY = (height - fieldHeight) / 2;
        const centerX = fieldX + fieldWidth / 2;
        const centerY = fieldY + fieldHeight / 2;

        // Posições dos jogadores dentro da área permitida (respeitando as linhas brancas)
        const limitDistance = 60;
        const playerAreaLeft = fieldX + limitDistance + 30;
        const playerAreaRight = fieldX + fieldWidth - limitDistance - 30;
        const playerAreaTop = fieldY + limitDistance + 30;
        const playerAreaBottom = fieldY + fieldHeight - limitDistance - 30;

        // Reset players to starting positions (dentro da área permitida)
        // Time 1 (esquerda)
        this.players[0].x = playerAreaLeft + 50;
        this.players[0].y = centerY - 50;
        this.players[0].vx = 0; this.players[0].vy = 0;

        this.players[1].x = playerAreaLeft + 50;
        this.players[1].y = centerY + 50;
        this.players[1].vx = 0; this.players[1].vy = 0;

        // Time 2 (direita)
        this.players[2].x = playerAreaRight - 50;
        this.players[2].y = centerY - 50;
        this.players[2].vx = 0; this.players[2].vy = 0;

        this.players[3].x = playerAreaRight - 50;
        this.players[3].y = centerY + 50;
        this.players[3].vx = 0; this.players[3].vy = 0;

        // Reset shell to center
        this.shell.x = centerX;
        this.shell.y = centerY;
        this.shell.vx = 0;
        this.shell.vy = 0;
        this.shell.owner = null;
        this.shell.lastOwner = null;

        // Reset kick system
        this.kickSystem.isCharging = false;
        this.kickSystem.chargingPlayer = null;
        this.kickSystem.chargeStartTime = 0;

        // End reset state
        this.isResetting = false;
        this.resetStartTime = 0;
        this.playersLocked = false; // Garante que jogadores estão destravados
    }

    updateCamera() {
        // Smooth camera interpolation
        const lerpSpeed = 0.05;

        this.cameraZoom += (this.targetZoom - this.cameraZoom) * lerpSpeed;
        this.cameraX += (this.targetCameraX - this.cameraX) * lerpSpeed;
        this.cameraY += (this.targetCameraY - this.cameraY) * lerpSpeed;
    }

    // Função removida - agora usamos o sistema de chute com carga

    checkWinCondition() {
        if (this.team1.goombas <= 0) {
            this.endGame('Time Azul');
        } else if (this.team2.goombas <= 0) {
            this.endGame('Time Vermelho');
        }
    }

    endGame(winner) {
        this.gameState = 'ended';

        document.getElementById('winnerText').textContent = `${winner} Venceu!`;
        document.getElementById('finalTime').textContent = this.formatTime(this.gameTime);
        document.getElementById('finalGoombas').textContent = winner === 'Time Vermelho' ? this.team2.goombas : this.team1.goombas;

        this.showScreen('endScreen');
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Save context for camera transformation
        this.ctx.save();

        // Apply camera transformation
        this.applyCameraTransform();

        // Draw arena
        this.drawArena();

        // Draw goombas
        this.drawGoombas();

        // Draw players
        this.players.forEach((player, index) => {
            this.drawPlayer(player, `P${index + 1}`);
        });

        // Draw shell
        this.drawShell();

        // Draw kick aim if charging
        if (this.kickSystem.isCharging) {
            this.drawKickAim();
        }

        // Draw hit effects
        this.drawHitEffects();

        // Restore context
        this.ctx.restore();

        // Draw overlays (sem zoom)
        if (this.isCelebrating) {
            this.drawCelebrationOverlay();
        }

        if (this.isResetting) {
            this.drawResetOverlay();
        }
    }

    applyCameraTransform() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Translate to center of canvas first
        this.ctx.translate(centerX, centerY);

        // Apply zoom
        this.ctx.scale(this.cameraZoom, this.cameraZoom);

        // Translate to focus on the target (offset from center)
        this.ctx.translate(-centerX - this.cameraX, -centerY - this.cameraY);
    }

    drawArena() {
        const { width, height } = this.canvas;

        // Campo mais compacto como na referência
        const fieldMargin = 80;
        const fieldWidth = Math.min(width - fieldMargin * 2, 600); // Limita largura máxima
        const fieldHeight = Math.min(height - fieldMargin * 2, 400); // Limita altura máxima
        const fieldX = (width - fieldWidth) / 2; // Centraliza
        const fieldY = (height - fieldHeight) / 2; // Centraliza

        // Draw Nintendo-style background
        this.drawNintendoBackground(width, height);

        // Draw outer stadium structure
        this.drawStadiumStructure(fieldX, fieldY, fieldWidth, fieldHeight);

        // Draw main grass field
        this.drawNintendoGrassField(fieldX, fieldY, fieldWidth, fieldHeight);

        // Draw field markings and boundaries
        this.drawFieldBoundaries(fieldX, fieldY, fieldWidth, fieldHeight);

        // Draw Goomba zones (protected areas)
        this.drawGoombaZones(fieldX, fieldY, fieldWidth, fieldHeight);
    }

    drawNintendoBackground(width, height) {
        // Fundo gradiente estilo Nintendo
        const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#87CEEB'); // Azul céu
        gradient.addColorStop(0.7, '#98FB98'); // Verde claro
        gradient.addColorStop(1, '#90EE90'); // Verde mais claro
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);

        // Nuvens decorativas no fundo
        this.drawClouds(width, height);
    }

    drawClouds(width, height) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

        // Nuvem 1
        this.drawCloud(width * 0.2, height * 0.15, 40);
        // Nuvem 2
        this.drawCloud(width * 0.7, height * 0.1, 35);
        // Nuvem 3
        this.drawCloud(width * 0.9, height * 0.25, 30);
    }

    drawCloud(x, y, size) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.3, y, size * 0.7, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.6, y, size * 0.5, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.3, y - size * 0.3, size * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawStadiumStructure(fieldX, fieldY, fieldWidth, fieldHeight) {
        const borderSize = 25;

        // Estrutura externa do estádio (madeira)
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(fieldX - borderSize, fieldY - borderSize, fieldWidth + borderSize * 2, fieldHeight + borderSize * 2);

        // Bordas coloridas como na referência
        const borderWidth = 15;

        // Borda vermelha (time 1 - esquerda)
        this.ctx.fillStyle = '#DC143C';
        this.ctx.fillRect(fieldX - borderSize, fieldY - borderSize, borderWidth, fieldHeight + borderSize * 2);

        // Borda azul (time 2 - direita)
        this.ctx.fillStyle = '#1E90FF';
        this.ctx.fillRect(fieldX + fieldWidth + borderSize - borderWidth, fieldY - borderSize, borderWidth, fieldHeight + borderSize * 2);

        // Bordas superiores e inferiores (neutras)
        this.ctx.fillStyle = '#DAA520';
        this.ctx.fillRect(fieldX - borderSize, fieldY - borderSize, fieldWidth + borderSize * 2, borderWidth);
        this.ctx.fillRect(fieldX - borderSize, fieldY + fieldHeight + borderSize - borderWidth, fieldWidth + borderSize * 2, borderWidth);
    }

    drawNintendoGrassField(fieldX, fieldY, fieldWidth, fieldHeight) {
        // Campo de grama com listras diagonais estilo Nintendo
        const stripeWidth = 25;

        // Base verde
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(fieldX, fieldY, fieldWidth, fieldHeight);

        // Listras diagonais mais claras
        this.ctx.fillStyle = '#32CD32';
        for (let i = 0; i < fieldWidth + fieldHeight; i += stripeWidth * 2) {
            this.ctx.beginPath();
            this.ctx.moveTo(fieldX + i, fieldY);
            this.ctx.lineTo(fieldX + i - fieldHeight, fieldY + fieldHeight);
            this.ctx.lineTo(fieldX + i - fieldHeight + stripeWidth, fieldY + fieldHeight);
            this.ctx.lineTo(fieldX + i + stripeWidth, fieldY);
            this.ctx.closePath();
            this.ctx.fill();
        }

        // Adiciona textura de grama
        this.addGrassTexture(fieldX, fieldY, fieldWidth, fieldHeight);
    }

    addGrassTexture(fieldX, fieldY, fieldWidth, fieldHeight) {
        this.ctx.fillStyle = 'rgba(0, 100, 0, 0.1)';
        for (let i = 0; i < 100; i++) {
            const x = fieldX + Math.random() * fieldWidth;
            const y = fieldY + Math.random() * fieldHeight;
            this.ctx.fillRect(x, y, 1, 2);
        }
    }

    }

    drawFieldBoundaries(fieldX, fieldY, fieldWidth, fieldHeight) {
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 4;

        // Borda principal do campo
        this.ctx.beginPath();
        this.ctx.rect(fieldX, fieldY, fieldWidth, fieldHeight);
        this.ctx.stroke();

        // Círculo central
        const centerX = fieldX + fieldWidth / 2;
        const centerY = fieldY + fieldHeight / 2;
        const circleRadius = Math.min(fieldWidth, fieldHeight) / 6;

        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
        this.ctx.stroke();

        // Linha central
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, fieldY);
        this.ctx.lineTo(centerX, fieldY + fieldHeight);
        this.ctx.stroke();

        // LINHAS DE LIMITE DOS JOGADORES (como na referência)
        const limitDistance = 60; // Distância da borda onde jogadores não podem passar

        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 3;

        // Linha limite esquerda
        this.ctx.beginPath();
        this.ctx.moveTo(fieldX + limitDistance, fieldY);
        this.ctx.lineTo(fieldX + limitDistance, fieldY + fieldHeight);
        this.ctx.stroke();

        // Linha limite direita
        this.ctx.beginPath();
        this.ctx.moveTo(fieldX + fieldWidth - limitDistance, fieldY);
        this.ctx.lineTo(fieldX + fieldWidth - limitDistance, fieldY + fieldHeight);
        this.ctx.stroke();

        // Linha limite superior
        this.ctx.beginPath();
        this.ctx.moveTo(fieldX, fieldY + limitDistance);
        this.ctx.lineTo(fieldX + fieldWidth, fieldY + limitDistance);
        this.ctx.stroke();

        // Linha limite inferior
        this.ctx.beginPath();
        this.ctx.moveTo(fieldX, fieldY + fieldHeight - limitDistance);
        this.ctx.lineTo(fieldX + fieldWidth, fieldY + fieldHeight - limitDistance);
        this.ctx.stroke();

        // Armazena os limites para verificação de colisão
        this.playerBounds = {
            left: fieldX + limitDistance,
            right: fieldX + fieldWidth - limitDistance,
            top: fieldY + limitDistance,
            bottom: fieldY + fieldHeight - limitDistance
        };
    }

    drawGoombaZones(fieldX, fieldY, fieldWidth, fieldHeight) {
        // Zonas protegidas dos Goombas (áreas onde jogadores não podem entrar)
        const zoneWidth = 60;

        // Zona esquerda (time vermelho)
        this.ctx.fillStyle = 'rgba(220, 20, 60, 0.2)';
        this.ctx.fillRect(fieldX, fieldY, zoneWidth, fieldHeight);

        // Zona direita (time azul)
        this.ctx.fillStyle = 'rgba(30, 144, 255, 0.2)';
        this.ctx.fillRect(fieldX + fieldWidth - zoneWidth, fieldY, zoneWidth, fieldHeight);

        // Zona superior (neutra)
        this.ctx.fillStyle = 'rgba(218, 165, 32, 0.2)';
        this.ctx.fillRect(fieldX, fieldY, fieldWidth, zoneWidth);

        // Zona inferior (neutra)
        this.ctx.fillStyle = 'rgba(218, 165, 32, 0.2)';
        this.ctx.fillRect(fieldX, fieldY + fieldHeight - zoneWidth, fieldWidth, zoneWidth);

        // Desenha spots específicos para Goombas
        this.drawGoombaSpots(fieldX, fieldY, fieldWidth, fieldHeight);
    }

    drawGoombaSpots(fieldX, fieldY, fieldWidth, fieldHeight) {
        this.ctx.fillStyle = 'rgba(139, 69, 19, 0.6)';
        const spotSize = 20;
        const borderOffset = 30;

        // Spots na borda esquerda
        for (let i = 1; i <= 4; i++) {
            const spotY = fieldY + (fieldHeight / 5) * i - spotSize / 2;
            this.ctx.beginPath();
            this.ctx.arc(fieldX + borderOffset, spotY, spotSize / 2, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Spots na borda direita
        for (let i = 1; i <= 4; i++) {
            const spotY = fieldY + (fieldHeight / 5) * i - spotSize / 2;
            this.ctx.beginPath();
            this.ctx.arc(fieldX + fieldWidth - borderOffset, spotY, spotSize / 2, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Spots na borda superior
        for (let i = 1; i <= 6; i++) {
            const spotX = fieldX + (fieldWidth / 7) * i - spotSize / 2;
            this.ctx.beginPath();
            this.ctx.arc(spotX, fieldY + borderOffset, spotSize / 2, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Spots na borda inferior
        for (let i = 1; i <= 6; i++) {
            const spotX = fieldX + (fieldWidth / 7) * i - spotSize / 2;
            this.ctx.beginPath();
            this.ctx.arc(spotX, fieldY + fieldHeight - borderOffset, spotSize / 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawGoombas() {
        // Draw team 1 goombas
        this.goombaPositions.team1.forEach(goomba => {
            if (goomba.active) {
                this.drawGoomba(goomba.x, goomba.y, this.team1.color);
            }
        });

        // Draw team 2 goombas
        this.goombaPositions.team2.forEach(goomba => {
            if (goomba.active) {
                this.drawGoomba(goomba.x, goomba.y, this.team2.color);
            }
        });
    }

    drawGoomba(x, y, teamColor) {
        const radius = 12;

        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(x + 1, y + radius + 1, radius * 0.8, radius * 0.3, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Body
        this.ctx.fillStyle = '#8B4513';
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Eyes
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(x - radius * 0.3, y - radius * 0.2, radius * 0.2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(x + radius * 0.3, y - radius * 0.2, radius * 0.2, 0, Math.PI * 2);
        this.ctx.fill();

        // Pupils
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(x - radius * 0.3, y - radius * 0.2, radius * 0.1, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(x + radius * 0.3, y - radius * 0.2, radius * 0.1, 0, Math.PI * 2);
        this.ctx.fill();

        // Team indicator
        this.ctx.fillStyle = teamColor;
        this.ctx.beginPath();
        this.ctx.arc(x, y - radius * 0.8, radius * 0.15, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawPlayer(player, label) {
        const radius = player.radius;

        // Shadow (modificada para slide)
        let shadowOffsetX = 2;
        let shadowOffsetY = radius + 2;
        let shadowScaleX = 0.8;
        let shadowScaleY = 0.4;

        if (player.isSliding) {
            // Shadow mais alongada durante slide
            shadowScaleX = 1.5;
            shadowScaleY = 0.6;
            shadowOffsetX = player.slideDirection.x * 8;
            shadowOffsetY = radius + 2 + player.slideDirection.y * 4;
        }

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(player.x + shadowOffsetX, player.y + shadowOffsetY, radius * shadowScaleX, radius * shadowScaleY, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Body (modificado para estados especiais)
        let bodyColor = player.color;
        if (player.isStunned) {
            // Pisca quando atordoado
            const stunFlash = Math.sin(Date.now() * 0.02) > 0;
            bodyColor = stunFlash ? '#FF6B6B' : player.color;
        } else if (player.isSliding) {
            // Cor mais intensa durante slide
            bodyColor = player.team === 1 ? '#FF0000' : '#0000FF';
        }

        this.ctx.fillStyle = bodyColor;
        this.ctx.beginPath();
        this.ctx.arc(player.x, player.y, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Highlight
        this.ctx.fillStyle = player.lightColor;
        this.ctx.beginPath();
        this.ctx.arc(player.x - radius * 0.3, player.y - radius * 0.3, radius * 0.4, 0, Math.PI * 2);
        this.ctx.fill();

        // Label
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;
        this.ctx.strokeText(label, player.x, player.y);
        this.ctx.fillText(label, player.x, player.y);

        // Estado visual indicators
        if (player.isSliding) {
            // Indicador de slide - linhas de movimento
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 3;
            this.ctx.lineCap = 'round';

            for (let i = 0; i < 3; i++) {
                const lineLength = 20 + i * 5;
                const lineX = player.x - player.slideDirection.x * lineLength;
                const lineY = player.y - player.slideDirection.y * lineLength;

                this.ctx.save();
                this.ctx.globalAlpha = 0.8 - (i * 0.2);
                this.ctx.beginPath();
                this.ctx.moveTo(lineX, lineY);
                this.ctx.lineTo(lineX + player.slideDirection.x * 15, lineY + player.slideDirection.y * 15);
                this.ctx.stroke();
                this.ctx.restore();
            }
        }

        if (player.isStunned) {
            // Indicador de atordoamento - estrelas girando
            const stunTime = Date.now() * 0.01;
            for (let i = 0; i < 3; i++) {
                const angle = stunTime + (i * Math.PI * 2 / 3);
                const starX = player.x + Math.cos(angle) * (radius + 15);
                const starY = player.y + Math.sin(angle) * (radius + 15);

                this.ctx.fillStyle = '#FFD700';
                this.ctx.font = 'bold 12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('★', starX, starY);
            }
        }

        if (player.slideCooldown > 0) {
            // Indicador de cooldown - barra
            const cooldownRatio = player.slideCooldown / player.slideMaxCooldown;
            const barWidth = radius * 2;
            const barHeight = 4;
            const barX = player.x - barWidth / 2;
            const barY = player.y - radius - 15;

            // Fundo da barra
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(barX, barY, barWidth, barHeight);

            // Progresso da barra
            this.ctx.fillStyle = '#FF4500';
            this.ctx.fillRect(barX, barY, barWidth * cooldownRatio, barHeight);
        }

        // Shell indicator
        if (this.shell.owner === player) {
            this.ctx.strokeStyle = 'yellow';
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.arc(player.x, player.y, radius + 8, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
    }

    drawShell() {
        const radius = this.shell.radius;
        const speed = Math.sqrt(this.shell.vx * this.shell.vx + this.shell.vy * this.shell.vy);

        // Shadow (maior quando em movimento)
        const shadowSize = 0.8 + (speed * 0.1);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.beginPath();
        this.ctx.ellipse(this.shell.x + 3, this.shell.y + 3, radius * shadowSize, radius * 0.4, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Trail effect quando em movimento
        if (speed > 2) {
            for (let i = 1; i <= 3; i++) {
                const trailX = this.shell.x - (this.shell.vx * i * 0.3);
                const trailY = this.shell.y - (this.shell.vy * i * 0.3);
                const trailAlpha = 0.3 - (i * 0.1);
                const trailSize = radius * (1 - i * 0.1);

                this.ctx.save();
                this.ctx.globalAlpha = trailAlpha;
                this.ctx.fillStyle = '#90EE90';
                this.ctx.beginPath();
                this.ctx.arc(trailX, trailY, trailSize, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        }

        // Shell body (verde mais vibrante)
        this.ctx.fillStyle = '#32CD32';
        this.ctx.strokeStyle = '#228B22';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(this.shell.x, this.shell.y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Shell pattern (hexágonos como na referência)
        this.ctx.fillStyle = '#228B22';
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + (speed * 0.1); // Rotação baseada na velocidade
            const x = this.shell.x + Math.cos(angle) * radius * 0.5;
            const y = this.shell.y + Math.sin(angle) * radius * 0.5;

            // Desenha hexágono pequeno
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(angle);
            this.ctx.beginPath();
            for (let j = 0; j < 6; j++) {
                const hexAngle = (j / 6) * Math.PI * 2;
                const hexX = Math.cos(hexAngle) * radius * 0.15;
                const hexY = Math.sin(hexAngle) * radius * 0.15;
                if (j === 0) {
                    this.ctx.moveTo(hexX, hexY);
                } else {
                    this.ctx.lineTo(hexX, hexY);
                }
            }
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.restore();
        }

        // Centro brilhante
        this.ctx.fillStyle = '#90EE90';
        this.ctx.beginPath();
        this.ctx.arc(this.shell.x - radius * 0.3, this.shell.y - radius * 0.3, radius * 0.25, 0, Math.PI * 2);
        this.ctx.fill();

        // Efeito de velocidade (linhas de movimento)
        if (speed > 5) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.lineWidth = 2;
            this.ctx.lineCap = 'round';

            for (let i = 0; i < 3; i++) {
                const lineLength = 15 + speed;
                const lineX = this.shell.x - (this.shell.vx / speed) * lineLength * (1 + i * 0.5);
                const lineY = this.shell.y - (this.shell.vy / speed) * lineLength * (1 + i * 0.5);

                this.ctx.save();
                this.ctx.globalAlpha = 0.8 - (i * 0.2);
                this.ctx.beginPath();
                this.ctx.moveTo(lineX, lineY);
                this.ctx.lineTo(lineX + (this.shell.vx / speed) * 10, lineY + (this.shell.vy / speed) * 10);
                this.ctx.stroke();
                this.ctx.restore();
            }
        }
    }

    drawKickAim() {
        if (!this.kickSystem.chargingPlayer) return;

        const player = this.kickSystem.chargingPlayer;
        const currentTime = Date.now();
        const chargeTime = currentTime - this.kickSystem.chargeStartTime;
        const chargeRatio = Math.min(chargeTime / this.kickSystem.maxChargeTime, 1);

        // Calculate arrow length based on charge
        const minLength = 40;
        const maxLength = 100;
        const arrowLength = minLength + (maxLength - minLength) * chargeRatio;

        // Calculate arrow end position
        const endX = player.x + Math.cos(this.kickSystem.aimAngle) * arrowLength;
        const endY = player.y + Math.sin(this.kickSystem.aimAngle) * arrowLength;

        // Color based on charge (green -> yellow -> red)
        let color;
        if (chargeRatio < 0.5) {
            color = `rgb(${Math.floor(255 * chargeRatio * 2)}, 255, 0)`; // Green to Yellow
        } else {
            color = `rgb(255, ${Math.floor(255 * (1 - chargeRatio) * 2)}, 0)`; // Yellow to Red
        }

        // Draw arrow line (mais grossa)
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 6;
        this.ctx.beginPath();
        this.ctx.moveTo(player.x, player.y);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();

        // Draw arrow head (maior)
        const headSize = 12 + chargeRatio * 12; // Bigger head with more charge
        const headAngle1 = this.kickSystem.aimAngle + Math.PI * 0.8;
        const headAngle2 = this.kickSystem.aimAngle - Math.PI * 0.8;

        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(endX + Math.cos(headAngle1) * headSize, endY + Math.sin(headAngle1) * headSize);
        this.ctx.lineTo(endX + Math.cos(headAngle2) * headSize, endY + Math.sin(headAngle2) * headSize);
        this.ctx.closePath();
        this.ctx.fill();

        // Draw power indicator circle around player (mais visível)
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([8, 4]);
        this.ctx.beginPath();
        this.ctx.arc(player.x, player.y, player.radius + 8 + chargeRatio * 20, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Draw charge percentage text (maior)
        this.ctx.fillStyle = color;
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 3;
        const chargePercent = Math.floor(chargeRatio * 100);
        this.ctx.strokeText(`${chargePercent}%`, player.x, player.y - player.radius - 30);
        this.ctx.fillText(`${chargePercent}%`, player.x, player.y - player.radius - 30);

        // Adicionar indicador visual de que o jogador está "travado"
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([3, 3]);
        this.ctx.beginPath();
        this.ctx.arc(player.x, player.y, player.radius + 3, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    drawResetOverlay() {
        const currentTime = Date.now();
        const resetTime = currentTime - this.resetStartTime;
        const progress = Math.min(resetTime / this.resetDuration, 1);

        // Overlay semi-transparente
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Texto central
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 3;

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        this.ctx.strokeText('GOOMBA ELIMINADO!', centerX, centerY - 40);
        this.ctx.fillText('GOOMBA ELIMINADO!', centerX, centerY - 40);

        this.ctx.font = 'bold 24px Arial';
        this.ctx.strokeText('Reposicionando...', centerX, centerY + 20);
        this.ctx.fillText('Reposicionando...', centerX, centerY + 20);

        // Barra de progresso
        const barWidth = 300;
        const barHeight = 20;
        const barX = centerX - barWidth / 2;
        const barY = centerY + 60;

        // Fundo da barra
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);

        // Progresso da barra
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(barX, barY, barWidth * progress, barHeight);

        // Borda da barra
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);
    }

    drawCelebrationOverlay() {
        const currentTime = Date.now();
        const celebrationTime = currentTime - this.celebrationStartTime;
        const progress = Math.min(celebrationTime / this.celebrationDuration, 1);

        // Overlay semi-transparente pulsante
        const alpha = 0.3 + Math.sin(celebrationTime * 0.01) * 0.2;
        this.ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Texto central
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 4;

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Texto principal pulsante
        const scale = 1 + Math.sin(celebrationTime * 0.008) * 0.1;
        this.ctx.save();
        this.ctx.translate(centerX, centerY - 60);
        this.ctx.scale(scale, scale);
        this.ctx.strokeText('GOL!', 0, 0);
        this.ctx.fillText('GOL!', 0, 0);
        this.ctx.restore();

        // Informação do jogador
        if (this.celebratingPlayer) {
            this.ctx.font = 'bold 32px Arial';
            const playerTeam = this.celebratingPlayer.team === 1 ? 'Time Vermelho' : 'Time Azul';
            const playerNumber = this.players.indexOf(this.celebratingPlayer) + 1;

            this.ctx.strokeText(`Jogador ${playerNumber} (${playerTeam})`, centerX, centerY + 20);
            this.ctx.fillText(`Jogador ${playerNumber} (${playerTeam})`, centerX, centerY + 20);
        }

        // Barra de progresso da comemoração
        const barWidth = 400;
        const barHeight = 15;
        const barX = centerX - barWidth / 2;
        const barY = centerY + 80;

        // Fundo da barra
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);

        // Progresso da barra (dourado)
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(barX, barY, barWidth * progress, barHeight);

        // Borda da barra
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);

        // Efeitos de partículas (estrelas)
        this.drawCelebrationParticles(celebrationTime);
    }

    drawCelebrationParticles(time) {
        const particleCount = 20;

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + time * 0.002;
            const radius = 100 + Math.sin(time * 0.003 + i) * 50;
            const x = this.canvas.width / 2 + Math.cos(angle) * radius;
            const y = this.canvas.height / 2 + Math.sin(angle) * radius;

            // Desenha estrela
            this.drawStar(x, y, 8, 4, 2);
        }
    }

    drawStar(x, y, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let step = Math.PI / spikes;

        this.ctx.beginPath();
        this.ctx.moveTo(x, y - outerRadius);

        for (let i = 0; i < spikes; i++) {
            let x1 = x + Math.cos(rot) * outerRadius;
            let y1 = y + Math.sin(rot) * outerRadius;
            this.ctx.lineTo(x1, y1);
            rot += step;

            x1 = x + Math.cos(rot) * innerRadius;
            y1 = y + Math.sin(rot) * innerRadius;
            this.ctx.lineTo(x1, y1);
            rot += step;
        }

        this.ctx.lineTo(x, y - outerRadius);
        this.ctx.closePath();
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fill();
        this.ctx.strokeStyle = '#FFA500';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }

    drawHitEffects() {
        if (!this.hitEffects) return;

        this.hitEffects.forEach(effect => {
            const currentTime = Date.now();
            const elapsed = currentTime - effect.startTime;
            const progress = elapsed / effect.duration;

            // Desenha texto no início (diferente para cada tipo de efeito)
            if (progress < 0.3) {
                const textAlpha = 1 - (progress / 0.3);
                this.ctx.save();
                this.ctx.globalAlpha = textAlpha;
                this.ctx.fillStyle = 'white';
                this.ctx.strokeStyle = 'black';
                this.ctx.lineWidth = 2;
                this.ctx.font = 'bold 16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';

                const bounceY = effect.y - 20 - Math.sin(progress * Math.PI * 10) * 5;

                // Texto diferente baseado no tipo de efeito
                let text = 'POOF!';
                if (effect.type === 'steal') text = 'STEAL!';
                else if (effect.type === 'slide') text = 'SLIDE!';
                else if (effect.type === 'impact') text = 'IMPACT!';

                this.ctx.strokeText(text, effect.x, bounceY);
                this.ctx.fillText(text, effect.x, bounceY);
                this.ctx.restore();
            }

            // Desenha partículas
            effect.particles.forEach(particle => {
                if (particle.life <= 0) return;

                this.ctx.save();
                this.ctx.globalAlpha = particle.life;

                // Cor das partículas baseada no tipo ou cor específica da partícula
                const particleColor = particle.color || '#FFD700';
                this.ctx.fillStyle = particleColor;
                this.ctx.strokeStyle = particle.color ? '#FFA500' : '#FFA500';
                this.ctx.lineWidth = 1;

                // Desenha estrela pequena
                this.drawStar(particle.x, particle.y, 4, particle.size, particle.size * 0.5);

                this.ctx.restore();
            });
        });
    }

    updateUI() {
        document.getElementById('team1Goombas').textContent = `${this.team1.goombas} Goombas`;
        document.getElementById('team2Goombas').textContent = `${this.team2.goombas} Goombas`;
        document.getElementById('gameTimer').textContent = this.formatTime(this.gameTime);
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new CascobolGame();
});
