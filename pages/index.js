import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Game.module.css';

export default function Home() {
  const gameRef = useRef(null);
  const gameInstanceRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // Importa e inicializa o jogo quando o componente monta
    const initGame = async () => {
      // Importa o script do jogo dinamicamente
      const { CascobolGame } = await import('../components/Game');

      // Inicializa o jogo apenas uma vez
      if (gameRef.current && !gameInstanceRef.current) {
        console.log('Inicializando jogo 2D...');
        gameInstanceRef.current = new CascobolGame();
      }
    };

    // Aguarda um pouco para garantir que o DOM está pronto
    const timer = setTimeout(initGame, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const goTo3D = () => {
    router.push('/3d');
  };

  return (
    <>
      <Head>
        <title>Cascobol - Mario Party 9</title>
        <meta name="description" content="Cascobol - Jogo inspirado no Mario Party 9" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.gameContainer} id="gameContainer" ref={gameRef}>
        {/* Tela de Início */}
        <div id="startScreen" className={`${styles.screen} ${styles.active}`}>
          <div className={styles.startContent}>
            <h1>🎮 Cascobol</h1>
            <p className={styles.subtitle}>Inspirado no Mario Party 9</p>

            {/* Seletor de Versão */}
            <div className={styles.versionSelector}>
              <h3>Escolha a Versão:</h3>
              <div className={styles.versionButtons}>
                <button className={`${styles.gameButton} ${styles.versionButton}`} id="startButton">
                  🎮 Jogar 2D (Original)
                </button>
                <button className={`${styles.gameButton} ${styles.versionButton} ${styles.new3d}`} onClick={goTo3D}>
                  🌟 Jogar 3D (Novo!)
                </button>
              </div>
            </div>

            <div className={styles.gameInfo}>
              <h3>Como Jogar:</h3>
              <ul>
                <li>🎯 <strong>Objetivo:</strong> Elimine todos os 7 Goombas do time adversário</li>
                <li>⚽ <strong>Jogabilidade:</strong> Segure para chutar (seta vermelha) ou pressione para passar (seta azul). Jogador fica parado durante ações!</li>
                <li>🏃 <strong>Carrinho Inteligente:</strong> Sem bola = roubar/atordoar | Com bola = passe automático para companheiro!</li>
                <li>🎮 <strong>Controles:</strong></li>
                <li className={styles.controls}>
                  <div className={styles.controlsGrid}>
                    <span className={`${styles.playerControls} ${styles.team1}`}>
                      <strong>Jogador 1 (Vermelho):</strong><br />
                      WASD + Espaço (Chute) + C (Passe) + Shift Esq (Carrinho/Passe)
                    </span>
                    <span className={`${styles.playerControls} ${styles.team1}`}>
                      <strong>Jogador 2 (Vermelho):</strong><br />
                      TFGH + R (Chute) + V (Passe) + Q (Carrinho/Passe)
                    </span>
                    <span className={`${styles.playerControls} ${styles.team2}`}>
                      <strong>Jogador 3 (Azul):</strong><br />
                      Setas + Enter (Chute) + / (Passe) + Shift Dir (Carrinho/Passe)
                    </span>
                    <span className={`${styles.playerControls} ${styles.team2}`}>
                      <strong>Jogador 4 (Azul):</strong><br />
                      IJKL + O (Chute) + P (Passe) + U (Carrinho/Passe)
                    </span>
                  </div>
                </li>
                <li>🎯 <strong>Sistema de Chute:</strong> Segure o botão de chute para parar e mirar. Use as teclas de movimento para girar e escolher a direção. Solte para chutar!</li>
                <li>🏆 <strong>Vitória:</strong> Primeiro a eliminar todos os Goombas adversários</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tela do Jogo */}
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

          <div className={styles.gameArea}>
            <canvas id="gameCanvas" width="1000" height="600" className={styles.gameCanvas}></canvas>
          </div>


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
    </>
  );
}
