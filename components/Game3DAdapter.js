import React, { useEffect, useRef, useState } from 'react';
import { Game3D } from './3d/Game3D';
import styles from '../styles/Game.module.css';

// Classe do jogo adaptada para 3D
class CascobolGame3D {
    constructor(onGameDataUpdate) {
        this.onGameDataUpdate = onGameDataUpdate;

        // Game state
        this.gameState = 'menu';
        this.gameStartTime = 0;
        this.gameTime = 0;
        this.isResetting = false;
        this.resetStartTime = 0;
        this.resetDuration = 2000;

        // Sistema de comemoração
        this.isCelebrating = false;
        this.celebrationStartTime = 0;
        this.celebrationDuration = 3000;
        this.celebratingPlayer = null;
        this.playersLocked = false;

        // Teams
        this.team1 = {
            color: '#DC143C',
            lightColor: '#FF6B6B',
            goombas: 7
        };

        this.team2 = {
            color: '#4169E1',
            lightColor: '#6495ED',
            goombas: 7
        };

        // Input handling
        this.keys = {};

        // Initialize game objects
        this.initializeGameObjects();
        this.setupEventListeners();

        // Game loop
        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
    }

    initializeGameObjects() {
        // Players (4 players total - 2v2) - Todas as propriedades do 2D
        this.players = [
            // Team 1 (Red) - Jogador 1
            {
                id: 1,
                x: 200,
                y: 250,
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
            // Team 1 (Red) - Jogador 2
            {
                id: 2,
                x: 200,
                y: 350,
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
                slideMaxDuration: 300, // 300ms slide
                slideCooldown: 0,
                slideMaxCooldown: 2000, // 2 second cooldown
                isStunned: false,
                stunnedTime: 0,
                maxStunnedTime: 1000 // 1 second stun
            },
            // Team 2 (Blue)
            // Team 2 (Blue) - Jogador 3
            {
                id: 3,
                x: 800,
                y: 250,
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
                slideMaxDuration: 300, // 300ms slide
                slideCooldown: 0,
                slideMaxCooldown: 2000, // 2 second cooldown
                isStunned: false,
                stunnedTime: 0,
                maxStunnedTime: 1000 // 1 second stun
            },
            // Team 2 (Blue) - Jogador 4
            {
                id: 4,
                x: 800,
                y: 350,
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
                slideMaxDuration: 300, // 300ms slide
                slideCooldown: 0,
                slideMaxCooldown: 2000, // 2 second cooldown
                isStunned: false,
                stunnedTime: 0,
                maxStunnedTime: 1000 // 1 second stun
            }
        ];

        // Shell (ball) - Todas as propriedades do 2D
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

        // Sistema de movimento e chute 360° - Igual ao 2D
        this.kickSystem = {
            isCharging: false,
            chargingPlayer: null,
            chargeStartTime: 0,
            maxChargeTime: 1500, // 1.5 segundos para carga máxima
            minPower: 3,
            maxPower: 15,
            aimAngle: 0,
            actionType: 'kick' // 'kick' ou 'pass'
        };

        // Sistema de passe - Igual ao 2D
        this.passSystem = {
            passPower: 8, // Força fixa do passe
            passRange: 300 // Alcance máximo para encontrar companheiro
        };

        // Goomba positions
        this.initializeGoombas();

        // Sistema de comemoração de gol - Igual ao 2D
        this.goalCelebration = {
            isActive: false,
            startTime: 0,
            duration: 2000, // 2 segundos
            player: null
        };

        // Sistema de efeitos visuais
        this.hitEffects = [];

        // Estados do jogo
        this.isCelebrating = false;
        this.isResetting = false;
        this.playersLocked = false;

        // Hit effects
        this.hitEffects = [];

        // Goal celebration
        this.goalCelebration = {
            isActive: false,
            startTime: 0,
            duration: 2000,
            player: null
        };

        // Controls
        this.keys = {};
        this.setupEventListeners();

        // Game loop
        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
    }

    initializeGoombas() {
        this.goombaPositions = {
            team1: [
                { x: 100, y: 150, active: true },
                { x: 100, y: 200, active: true },
                { x: 100, y: 250, active: true },
                { x: 100, y: 300, active: true },
                { x: 100, y: 350, active: true },
                { x: 100, y: 400, active: true },
                { x: 100, y: 450, active: true }
            ],
            team2: [
                { x: 900, y: 150, active: true },
                { x: 900, y: 200, active: true },
                { x: 900, y: 250, active: true },
                { x: 900, y: 300, active: true },
                { x: 900, y: 350, active: true },
                { x: 900, y: 400, active: true },
                { x: 900, y: 450, active: true }
            ]
        };
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            if (!this.isResetting && !this.isCelebrating && !this.playersLocked) {
                this.players.forEach(player => {
                    if (e.code === player.controls.action) {
                        if (this.shell.owner === player && !this.kickSystem.isCharging) {
                            this.startKickCharge(player, 'kick');
                        }
                    }

                    if (e.code === player.controls.pass) {
                        if (this.shell.owner === player && !this.kickSystem.isCharging) {
                            this.executePass(player);
                        }
                    }

                    if (e.code === player.controls.steal) {
                        this.attemptSlideTackle(player);
                    }
                });
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;

            if (!this.isResetting && !this.isCelebrating && !this.playersLocked) {
                this.players.forEach(player => {
                    if (e.code === player.controls.action && this.kickSystem.chargingPlayer === player) {
                        this.releaseKick();
                    }
                });
            }
        });
    }

    // Métodos simplificados para o exemplo - implementação completa seria muito longa
    startKickCharge(player, type) {
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

        // Normaliza direção
        if (dx !== 0 || dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
        }

        // Aplica força à bola
        this.shell.vx = dx * power;
        this.shell.vy = dy * power;
        this.shell.owner = null;
        this.shell.lastOwner = player;
        this.shell.protectionTime = 0; // Chute pode ser interceptado

        // Reset kick system
        this.kickSystem.isCharging = false;
        this.kickSystem.chargingPlayer = null;
        this.kickSystem.chargeStartTime = 0;

        console.log(`Jogador ${player.id} chutou com força ${power.toFixed(1)}!`);
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

        console.log(`Jogador ${player.id} passou para jogador ${teammate.id}!`);
    }

    findNearestTeammate(player) {
        let nearestTeammate = null;
        let nearestDistance = Infinity;

        this.players.forEach(p => {
            if (p.team === player.team && p.id !== player.id && !p.isStunned) {
                const dx = p.x - player.x;
                const dy = p.y - player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestTeammate = p;
                }
            }
        });

        return nearestTeammate;
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
        player.slideCooldown = player.slideMaxCooldown;

        console.log(`Jogador ${player.id} iniciou slide tackle!`);
    }

    startGame() {
        console.log('Starting 3D game...');
        this.gameState = 'playing';
        this.gameStartTime = Date.now();
        this.showScreen('gameScreen');
        this.gameLoop(performance.now());
        console.log('3D game started successfully!');
    }

    showScreen(screenId) {
        console.log('Showing screen:', screenId);

        // Usar seletor mais específico para CSS Modules
        const screens = document.querySelectorAll('[class*="screen"]');
        console.log('Found screens:', screens.length);

        screens.forEach(screen => {
            screen.classList.remove('active');
            // Remover também a classe CSS Module
            const classList = Array.from(screen.classList);
            classList.forEach(className => {
                if (className.includes('active')) {
                    screen.classList.remove(className);
                }
            });
        });

        const targetScreen = document.getElementById(screenId);
        console.log('Target screen found:', targetScreen);

        if (targetScreen) {
            targetScreen.classList.add('active');
            // Adicionar também a classe CSS Module
            targetScreen.classList.add(styles.active);
            console.log('Screen activated:', screenId);
        } else {
            console.error('Screen not found:', screenId);
        }
    }

    gameLoop(currentTime) {
        if (this.gameState !== 'playing') return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.updateUI();

        // Enviar dados atualizados para o componente 3D
        this.onGameDataUpdate({
            players: this.players,
            shell: this.shell,
            goombaPositions: this.goombaPositions,
            gameState: this.gameState,
            team1: this.team1,
            team2: this.team2,
            kickSystem: this.kickSystem
        });

        requestAnimationFrame(this.gameLoop);
    }

    update(deltaTime) {
        this.gameTime = Date.now() - this.gameStartTime;

        if (!this.isCelebrating && !this.isResetting) {
            this.updatePlayerMovement();
            this.updateKickSystem();
            this.updateShell();
            this.updateBallProtection();
            this.checkCollisions();
            this.updateGoalCelebration();
            this.checkWinCondition();
        }

        this.updateHitEffects();
    }

    // Sistema de movimento completo igual ao 2D
    updatePlayerMovement() {
        if (this.isResetting || this.isCelebrating || this.playersLocked) return;

        const speed = 0.8;
        const friction = 0.88;
        const deltaTime = 16; // Assumindo 60fps

        this.players.forEach(player => {
            // Update slide tackle
            if (player.isSliding) {
                player.slideDuration += deltaTime;
                if (player.slideDuration >= player.slideMaxDuration) {
                    player.isSliding = false;
                    player.slideDuration = 0;
                    player.slideSpeed = 0;
                }

                // Move during slide
                player.x += player.slideDirection.x * player.slideSpeed;
                player.y += player.slideDirection.y * player.slideSpeed;
                player.slideSpeed *= 0.9; // Decelerate
            }

            // Update stun
            if (player.isStunned) {
                player.stunnedTime -= deltaTime;
                if (player.stunnedTime <= 0) {
                    player.isStunned = false;
                    player.stunnedTime = 0;
                }
            }

            // Update cooldowns
            if (player.slideCooldown > 0) {
                player.slideCooldown -= deltaTime;
                if (player.slideCooldown < 0) player.slideCooldown = 0;
            }

            // Se o jogador está carregando chute/passe, fica completamente parado (vulnerável)
            if (this.kickSystem.isCharging && this.kickSystem.chargingPlayer === player) {
                // Para completamente - mais vulnerável para roubo
                player.vx = 0;
                player.vy = 0;
            } else if (!player.isStunned && !player.isSliding) {
                // Sistema de movimento livre com física melhorada
                let inputX = 0, inputY = 0;

                // Captura input das teclas
                if (this.keys[player.controls.up]) inputY -= 1;
                if (this.keys[player.controls.down]) inputY += 1;
                if (this.keys[player.controls.left]) inputX -= 1;
                if (this.keys[player.controls.right]) inputX += 1;

                // Normaliza movimento diagonal
                if (inputX !== 0 || inputY !== 0) {
                    const length = Math.sqrt(inputX * inputX + inputY * inputY);
                    inputX /= length;
                    inputY /= length;
                }

                // Aplica aceleração baseada no input
                const acceleration = speed;
                player.vx += inputX * acceleration;
                player.vy += inputY * acceleration;

                // Aplica atrito
                player.vx *= friction;
                player.vy *= friction;

                // Atualiza posição
                player.x += player.vx;
                player.y += player.vy;
            }

            // Manter dentro dos limites do campo
            player.x = Math.max(player.radius, Math.min(1000 - player.radius, player.x));
            player.y = Math.max(player.radius, Math.min(600 - player.radius, player.y));
        });
    }

    updateKickSystem() {
        if (this.kickSystem.isCharging && this.kickSystem.chargingPlayer) {
            const player = this.kickSystem.chargingPlayer;

            // Update aim angle based on player input (igual ao 2D)
            let aimX = 0, aimY = 0;
            if (this.keys[player.controls.up]) aimY -= 1;
            if (this.keys[player.controls.down]) aimY += 1;
            if (this.keys[player.controls.left]) aimX -= 1;
            if (this.keys[player.controls.right]) aimX += 1;

            if (aimX !== 0 || aimY !== 0) {
                this.kickSystem.aimAngle = Math.atan2(aimY, aimX);
            } else {
                // Direção padrão se não há input
                this.kickSystem.aimAngle = player.team === 1 ? 0 : Math.PI; // Time 1 para direita, Time 2 para esquerda
            }

            // NÃO auto-release - jogador deve soltar manualmente
            // Apenas limita a força máxima
        }
    }

    updateShell() {
        // Se a bola tem dono, ela fica grudada no jogador (sistema de drible igual ao 2D)
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

        // Update rotation for visual effect
        const speed = Math.sqrt(this.shell.vx * this.shell.vx + this.shell.vy * this.shell.vy);
        this.shell.rotation += speed * 0.1;

        // Add to trail for visual effect
        this.shell.trail.push({ x: this.shell.x, y: this.shell.y, time: Date.now() });
        this.shell.trail = this.shell.trail.filter(point => Date.now() - point.time < 200);

        // Colisão com bordas (igual ao 2D)
        if (this.shell.x <= this.shell.radius || this.shell.x >= 1000 - this.shell.radius) {
            this.shell.vx *= -0.8;
            this.shell.x = Math.max(this.shell.radius, Math.min(1000 - this.shell.radius, this.shell.x));
        }

        if (this.shell.y <= this.shell.radius || this.shell.y >= 600 - this.shell.radius) {
            this.shell.vy *= -0.8;
            this.shell.y = Math.max(this.shell.radius, Math.min(600 - this.shell.radius, this.shell.y));
        }

        // Bounce off goomba protection zones (players can't enter, but ball can pass through)
        // Left goomba zone (team 1)
        if (this.shell.x < 150 && this.shell.y > 100 && this.shell.y < 500) {
            // Ball can pass through but bounces slightly
            if (this.shell.vx < 0) {
                this.shell.vx *= -0.6;
            }
        }

        // Right goomba zone (team 2)
        if (this.shell.x > 850 && this.shell.y > 100 && this.shell.y < 500) {
            // Ball can pass through but bounces slightly
            if (this.shell.vx > 0) {
                this.shell.vx *= -0.6;
            }
        }
    }

    updateBallProtection() {
        // Atualiza proteção da bola (sistema do 2D)
        if (this.shell.protectionTime > 0) {
            this.shell.protectionTime -= 16; // deltaTime fixo
            if (this.shell.protectionTime < 0) this.shell.protectionTime = 0;
        }
    }

    checkCollisions() {
        // Implementação simplificada das colisões
        this.checkPlayerShellCollisions();
        this.checkShellGoombaCollisions();
        this.checkPlayerCollisions();
    }

    checkPlayerShellCollisions() {
        this.players.forEach(player => {
            if (player.isStunned) return;

            const dx = this.shell.x - player.x;
            const dy = this.shell.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < player.radius + this.shell.radius) {
                const shellSpeed = Math.sqrt(this.shell.vx * this.shell.vx + this.shell.vy * this.shell.vy);

                // Se a bola não tem dono, jogador pega a bola
                if (!this.shell.owner) {
                    this.shell.owner = player;
                    this.shell.vx = 0;
                    this.shell.vy = 0;
                    this.shell.protectionTime = this.shell.protectionDuration; // Ativa proteção
                    console.log(`Jogador ${player.id} pegou a bola!`);
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
        });
    }

    checkShellGoombaCollisions() {
        const shellSpeed = Math.sqrt(this.shell.vx * this.shell.vx + this.shell.vy * this.shell.vy);

        if (shellSpeed < 1) return; // Shell must be moving

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

    addHitEffect(x, y, color) {
        // Adiciona efeito visual quando goomba é atingido
        this.hitEffects.push({
            x: x,
            y: y,
            color: color,
            startTime: Date.now(),
            duration: 1000 // 1 segundo
        });
    }

    checkPlayerCollisions() {
        // Sistema completo de colisões entre jogadores igual ao 2D
        for (let i = 0; i < this.players.length; i++) {
            for (let j = i + 1; j < this.players.length; j++) {
                const player1 = this.players[i];
                const player2 = this.players[j];

                const dx = player2.x - player1.x;
                const dy = player2.y - player1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < player1.radius + player2.radius) {
                    // Separar jogadores fisicamente
                    const overlap = (player1.radius + player2.radius) - distance;
                    const separationX = (dx / distance) * overlap * 0.5;
                    const separationY = (dy / distance) * overlap * 0.5;

                    player1.x -= separationX;
                    player1.y -= separationY;
                    player2.x += separationX;
                    player2.y += separationY;

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

        // Cancela qualquer chute em andamento da vítima
        if (this.kickSystem.chargingPlayer === victim) {
            this.kickSystem.isCharging = false;
            this.kickSystem.chargingPlayer = null;
            this.kickSystem.chargeStartTime = 0;
        }

        // Empurra a vítima para longe
        const pushForce = 3;
        const dx = victim.x - tackler.x;
        const dy = victim.y - tackler.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            victim.vx += (dx / distance) * pushForce;
            victim.vy += (dy / distance) * pushForce;
        }
    }

    startGoalCelebration(player) {
        this.goalCelebration.isActive = true;
        this.goalCelebration.startTime = Date.now();
        this.goalCelebration.player = player;
    }

    updateGoalCelebration() {
        if (this.goalCelebration.isActive) {
            if (Date.now() - this.goalCelebration.startTime > this.goalCelebration.duration) {
                this.goalCelebration.isActive = false;
            }
        }
    }

    checkWinCondition() {
        if (this.team1.goombas <= 0) {
            this.endGame('Time Vermelho');
        } else if (this.team2.goombas <= 0) {
            this.endGame('Time Azul');
        }
    }

    endGame(winner) {
        this.gameState = 'ended';
        document.getElementById('winnerText').textContent = `${winner} Venceu!`;
        document.getElementById('finalTime').textContent = this.formatTime(this.gameTime);
        document.getElementById('finalGoombas').textContent = winner === 'Time Vermelho' ? this.team2.goombas : this.team1.goombas;
        this.showScreen('endScreen');
    }

    updateHitEffects() {
        // Implementação simplificada dos efeitos
        this.hitEffects = this.hitEffects.filter(effect => {
            return Date.now() - effect.startTime < effect.duration;
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

    resetGame() {
        this.team1.goombas = 7;
        this.team2.goombas = 7;
        this.initializeGoombas();

        // Reset players
        this.players[0].x = 200; this.players[0].y = 250;
        this.players[1].x = 200; this.players[1].y = 350;
        this.players[2].x = 800; this.players[2].y = 250;
        this.players[3].x = 800; this.players[3].y = 350;

        this.players.forEach(player => {
            player.vx = 0;
            player.vy = 0;
            player.isSliding = false;
            player.isStunned = false;
            player.slideCooldown = 0;
            player.stunnedTime = 0;
            player.slideDuration = 0;
            player.slideSpeed = 0;
        });

        // Reset shell (todas as propriedades do 2D)
        this.shell.x = 500;
        this.shell.y = 300;
        this.shell.vx = 0;
        this.shell.vy = 0;
        this.shell.owner = null;
        this.shell.lastOwner = null;
        this.shell.protectionTime = 0;
        this.shell.trail = [];
        this.shell.rotation = 0;

        // Reset systems
        this.kickSystem.isCharging = false;
        this.kickSystem.chargingPlayer = null;
        this.kickSystem.chargeStartTime = 0;
        this.kickSystem.aimAngle = 0;
        this.goalCelebration.isActive = false;
        this.goalCelebration.player = null;
        this.hitEffects = [];

        this.isCelebrating = false;
        this.isResetting = false;
        this.playersLocked = false;
    }

    setupUI() {
        console.log('Setting up UI for 3D game...');

        const startButton = document.getElementById('startButton');
        console.log('Start button found:', startButton);

        if (startButton) {
            startButton.addEventListener('click', () => {
                console.log('Start button clicked - starting 3D game!');
                this.startGame();
            });
        } else {
            console.error('Start button not found!');
        }

        const playAgainButton = document.getElementById('playAgainButton');
        if (playAgainButton) {
            playAgainButton.addEventListener('click', () => {
                console.log('Play again button clicked');
                this.resetGame();
                this.startGame();
            });
        }

        const backToMenuButton = document.getElementById('backToMenuButton');
        if (backToMenuButton) {
            backToMenuButton.addEventListener('click', () => {
                console.log('Back to menu button clicked');
                this.showScreen('startScreen');
                this.gameState = 'menu';
            });
        }
    }
}

// Componente React que integra o jogo 3D
export default function Game3DAdapter() {
    const [gameData, setGameData] = useState(null);
    const gameInstanceRef = useRef(null);

    useEffect(() => {
        // Inicializar o jogo apenas uma vez
        if (!gameInstanceRef.current) {
            console.log('Initializing 3D game instance...');
            gameInstanceRef.current = new CascobolGame3D((data) => {
                setGameData(data);
            });
        }

        return () => {
            // Cleanup se necessário
        };
    }, []);

    // Handlers para os botões usando React
    const handleStartGame = () => {
        console.log('Start game button clicked!');
        if (gameInstanceRef.current) {
            gameInstanceRef.current.startGame();
        }
    };

    const handlePlayAgain = () => {
        console.log('Play again button clicked!');
        if (gameInstanceRef.current) {
            gameInstanceRef.current.resetGame();
            gameInstanceRef.current.startGame();
        }
    };

    const handleBackToMenu = () => {
        console.log('Back to menu button clicked!');
        if (gameInstanceRef.current) {
            gameInstanceRef.current.showScreen('startScreen');
            gameInstanceRef.current.gameState = 'menu';
        }
    };

    return (
        <div className={styles.gameContainer} id="gameContainer">
            {/* Tela de Início */}
            <div id="startScreen" className={`${styles.screen} ${styles.active}`}>
                <div className={styles.startContent}>
                    <h1>🎮 Cascobol 3D</h1>
                    <p className={styles.subtitle}>Versão 3D - Inspirado no Mario Party 9</p>
                    <div className={styles.gameInfo}>
                        <h3>Como Jogar:</h3>
                        <ul>
                            <li>🎯 <strong>Objetivo:</strong> Elimine todos os 7 Goombas do time adversário</li>
                            <li>⚽ <strong>Jogabilidade:</strong> Segure para chutar ou pressione para passar</li>
                            <li>🏃 <strong>Carrinho:</strong> Use para roubar a bola ou atordoar adversários</li>
                            <li>🎮 <strong>Controles:</strong></li>
                            <li className={styles.controls}>
                                <div className={styles.controlsGrid}>
                                    <span className={`${styles.playerControls} ${styles.team1}`}>
                                        <strong>Jogador 1 (Vermelho):</strong><br />
                                        WASD + Espaço (Chute) + C (Passe) + Shift Esq (Carrinho)
                                    </span>
                                    <span className={`${styles.playerControls} ${styles.team1}`}>
                                        <strong>Jogador 2 (Vermelho):</strong><br />
                                        TFGH + R (Chute) + V (Passe) + Q (Carrinho)
                                    </span>
                                    <span className={`${styles.playerControls} ${styles.team2}`}>
                                        <strong>Jogador 3 (Azul):</strong><br />
                                        Setas + Enter (Chute) + / (Passe) + Shift Dir (Carrinho)
                                    </span>
                                    <span className={`${styles.playerControls} ${styles.team2}`}>
                                        <strong>Jogador 4 (Azul):</strong><br />
                                        IJKL + O (Chute) + P (Passe) + U (Carrinho)
                                    </span>
                                </div>
                            </li>
                            <li>🎯 <strong>Sistema de Chute:</strong> Segure o botão de chute para parar e mirar</li>
                            <li>🏆 <strong>Vitória:</strong> Primeiro a eliminar todos os Goombas adversários</li>
                        </ul>
                    </div>
                    <button id="startButton" className={styles.gameButton} onClick={handleStartGame}>
                        Iniciar Jogo 3D
                    </button>
                </div>
            </div>

            {/* Tela do Jogo 3D */}
            <div id="gameScreen" className={styles.screen}>
                <div className={styles.gameHeader}>
                    <div className={styles.scoreDisplay}>
                        <div className={`${styles.teamScore} ${styles.team1}`}>
                            <span className={styles.teamName}>Time Vermelho</span>
                            <span className={styles.goombaCount} id="team1Goombas">7 Goombas</span>
                        </div>
                        <div className={styles.gameTimer}>
                            <span id="gameTimer">0:00</span>
                        </div>
                        <div className={`${styles.teamScore} ${styles.team2}`}>
                            <span className={styles.teamName}>Time Azul</span>
                            <span className={styles.goombaCount} id="team2Goombas">7 Goombas</span>
                        </div>
                    </div>
                </div>

                {/* Renderização 3D */}
                <Game3D gameData={gameData} />
            </div>

            {/* Tela de Fim de Jogo */}
            <div id="endScreen" className={styles.screen}>
                <div className={styles.endContent}>
                    <h1 id="winnerText">Time Vermelho Venceu!</h1>
                    <div className={styles.finalStats}>
                        <p>Tempo de jogo: <span id="finalTime">0:00</span></p>
                        <p>Goombas eliminados: <span id="finalGoombas">7</span></p>
                    </div>
                    <div className={styles.endButtons}>
                        <button id="playAgainButton" className={styles.gameButton}>Jogar Novamente</button>
                        <button id="backToMenuButton" className={`${styles.gameButton} ${styles.secondary}`}>Voltar ao Menu</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
