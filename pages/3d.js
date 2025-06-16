import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import styles from '../styles/Game.module.css';

// Importação dinâmica do componente 3D para evitar problemas de SSR
const Game3DAdapter = dynamic(() => import('../components/Game3DAdapter'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #87CEEB, #98FB98)',
      color: '#333',
      fontSize: '1.5em',
      fontWeight: 'bold'
    }}>
      🎮 Carregando Cascobol 3D...
    </div>
  )
});

export default function Game3DPage() {
  const router = useRouter();

  const goBack2D = () => {
    router.push('/');
  };

  return (
    <>
      <Head>
        <title>Cascobol 3D - Mario Party 9</title>
        <meta name="description" content="Cascobol 3D - Versão 3D do jogo inspirado no Mario Party 9" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Botão para voltar ao 2D */}
      <div className={styles.backButton}>
        <button 
          onClick={goBack2D}
          className={`${styles.gameButton} ${styles.secondary} ${styles.backBtn}`}
        >
          ← Voltar ao 2D
        </button>
      </div>

      <Game3DAdapter />
    </>
  );
}
