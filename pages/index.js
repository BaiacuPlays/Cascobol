import Head from 'next/head';
import { useEffect, useRef } from 'react';
import styles from '../styles/Game.module.css';

export default function Home() {
  const gameRef = useRef(null);
  const gameInstanceRef = useRef(null);

  useEffect(() => {
    // Importa e inicializa o jogo quando o componente monta
    const initGame = async () => {
      // Importa o script do jogo dinamicamente
      const { CascobolGame } = await import('../components/Game');

      // Inicializa o jogo apenas uma vez
      if (gameRef.current && !gameInstanceRef.current) {
        console.log('Inicializando jogo...');
        gameInstanceRef.current = new CascobolGame();
      }
    };

    // Aguarda um pouco para garantir que o DOM está pronto
    const timer = setTimeout(initGame, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

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
            <div className={styles.gameInfo}>
              <h3>Como Jogar:</h3>
              <ul>
                <li>🎯 <strong>Objetivo:</strong> Elimine todos os 7 Goombas do time adversário</li>
                <li>⚽ <strong>Controles:</strong></li>
                <li className={styles.controls}>
                  <div className={styles.controlsGrid}>
                    <span className={`${styles.playerControls} ${styles.team1}`}>
                      <strong>Jogador 1 (Vermelho):</strong><br />
                      WASD + Segure Espaço + Shift Esq (Carrinho)
                    </span>
                    <span className={`${styles.playerControls} ${styles.team1}`}>
                      <strong>Jogador 2 (Vermelho):</strong><br />
                      TFGH + Segure R + Q (Carrinho)
                    </span>
                    <span className={`${styles.playerControls} ${styles.team2}`}>
                      <strong>Jogador 3 (Azul):</strong><br />
                      Setas + Segure Enter + Shift Dir (Carrinho)
                    </span>
                    <span className={`${styles.playerControls} ${styles.team2}`}>
                      <strong>Jogador 4 (Azul):</strong><br />
                      IJKL + Segure O + U (Carrinho)
                    </span>
                  </div>
                </li>
                <li>🎯 <strong>Sistema de Chute:</strong> Segure o botão de chute para parar e mirar. Use as teclas de movimento para girar e escolher a direção. Solte para chutar!</li>
                <li>🏆 <strong>Vitória:</strong> Primeiro a eliminar todos os Goombas adversários</li>
              </ul>
            </div>
            <button id="startButton" className={styles.gameButton}>Iniciar Jogo</button>
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

          <div className={styles.controlsDisplay}>
            <div className={styles.playerControlsInfo}>
              <div className={styles.team1Controls}>
                <strong>Time Vermelho:</strong><br />
                P1: WASD + Segure Espaço + Shift Esq | P2: TFGH + Segure R + Q
              </div>
              <div className={styles.team2Controls}>
                <strong>Time Azul:</strong><br />
                P3: Setas + Segure Enter + Shift Dir | P4: IJKL + Segure O + U
              </div>
            </div>
            <div className={styles.kickInstructions}>
              💡 <strong>Dica:</strong> Segure o botão de chute para parar e mirar. Use movimento para girar. Solte no momento certo!<br />
              ⚡ <strong>Carrinho:</strong> Pressione a tecla de carrinho para fazer um slide tackle! Rouba a bola e atordoa adversários!<br />
              ⏱️ <strong>Cooldown:</strong> Após um carrinho, aguarde 2 segundos para fazer outro. Jogadores atordoados ficam imóveis por 1 segundo.
            </div>
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
