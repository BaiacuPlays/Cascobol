import React, { useRef, useEffect, useState, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Box, Cylinder, Plane, Sphere, Environment, Sky, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { TextureLoader } from 'three';


// Componente Ground para o campo
function Ground() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.5, 0]}
      receiveShadow
    >
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial 
        color="#2e8b57"
        metalness={0}
        roughness={1}
      />
    </mesh>
  );
}

// Componente de Ambiente
function SceneEnvironment() {
  return (
    <>
      <Sky 
        distance={450000}
        sunPosition={[100, 100, 20]}
        inclination={0.6}
        azimuth={0.25}
        rayleigh={0.5}
      />
      <fog attach="fog" args={['#87CEEB', 50, 190]} />
    </>
  );
}

// Componente de Luzes
function Lights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight
        position={[-10, 10, -5]}
        intensity={0.5}
        castShadow
      />
    </>
  );
}

const modelCache = new Map();


function Player3D({ player, isCharging = false }) {
  const playerRef = useRef();
  const bodyRef = useRef();


  useFrame((state) => {
    if (playerRef.current && player) {

      playerRef.current.position.x = (player.x - 500) * 0.07;
      playerRef.current.position.z = -(player.y - 300) * 0.07;
      playerRef.current.position.y = 1;


      if (bodyRef.current) {
        bodyRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.08;
        bodyRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;


        if (player.vx !== 0 || player.vy !== 0) {
          const angle = Math.atan2(-player.vy, player.vx);
          playerRef.current.rotation.y = THREE.MathUtils.lerp(playerRef.current.rotation.y, angle, 0.1);


          bodyRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 8) * 0.1;
        } else {
          bodyRef.current.rotation.z = THREE.MathUtils.lerp(bodyRef.current.rotation.z, 0, 0.1);
        }
      }
    }
  });

  if (!player) return null;

  const teamColor = player.team === 1 ? '#DC143C' : '#4169E1';
  const lightColor = player.team === 1 ? '#FF6B6B' : '#87CEEB';
  const accentColor = player.team === 1 ? '#FFD700' : '#FFFFFF';

  return (
    <group ref={playerRef}>

      <group ref={bodyRef}>

        <Sphere args={[1.2]} position={[0, 0, 0]} castShadow receiveShadow>
          <meshStandardMaterial
            color={teamColor}
            roughness={0.3}
            metalness={0.1}
          />
        </Sphere>


        <Sphere args={[0.9]} position={[0, 1.6, 0]} castShadow receiveShadow>
          <meshStandardMaterial
            color={lightColor}
            roughness={0.2}
            metalness={0.0}
          />
        </Sphere>


        <Sphere args={[0.2]} position={[-0.35, 1.7, 0.7]} castShadow>
          <meshStandardMaterial color="white" />
        </Sphere>
        <Sphere args={[0.2]} position={[0.35, 1.7, 0.7]} castShadow>
          <meshStandardMaterial color="white" />
        </Sphere>


        <Sphere args={[0.12]} position={[-0.35, 1.7, 0.85]} castShadow>
          <meshStandardMaterial color="black" />
        </Sphere>
        <Sphere args={[0.12]} position={[0.35, 1.7, 0.85]} castShadow>
          <meshStandardMaterial color="black" />
        </Sphere>


        <Sphere args={[0.05]} position={[-0.3, 1.75, 0.9]} castShadow>
          <meshBasicMaterial color="white" />
        </Sphere>
        <Sphere args={[0.05]} position={[0.4, 1.75, 0.9]} castShadow>
          <meshBasicMaterial color="white" />
        </Sphere>


        <Sphere args={[0.08]} position={[0, 1.6, 0.85]} castShadow>
          <meshStandardMaterial color={accentColor} />
        </Sphere>


        <Sphere args={[0.3]} position={[-1.2, 0.5, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={lightColor} />
        </Sphere>
        <Sphere args={[0.3]} position={[1.2, 0.5, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={lightColor} />
        </Sphere>


        <Sphere args={[0.5]} position={[-0.7, -1.2, 0.2]} castShadow receiveShadow>
          <meshStandardMaterial color="#654321" />
        </Sphere>
        <Sphere args={[0.5]} position={[0.7, -1.2, 0.2]} castShadow receiveShadow>
          <meshStandardMaterial color="#654321" />
        </Sphere>


        <Box args={[0.8, 0.8, 0.1]} position={[0, 0.5, 1.25]} castShadow>
          <meshStandardMaterial color="white" />
        </Box>
        <Box args={[0.6, 0.6, 0.12]} position={[0, 0.5, 1.26]} castShadow>
          <meshStandardMaterial color={teamColor} />
        </Box>
      </group>


      {isCharging && (
        <group>
          <Cylinder args={[2, 2, 0.1]} position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <meshBasicMaterial color="yellow" transparent opacity={0.5} />
          </Cylinder>

          <Box args={[0.3, 0.3, 2]} position={[0, 2.5, 1]} castShadow>
            <meshBasicMaterial color="red" />
          </Box>
          <Box args={[0.8, 0.3, 0.3]} position={[0, 2.5, 2]} castShadow>
            <meshBasicMaterial color="red" />
          </Box>
        </group>
      )}



      {player.id === 1 && (
        <Cylinder args={[1.8, 1.8, 0.05]} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="gold" transparent opacity={0.6} />
        </Cylinder>
      )}


      <Cylinder args={[1.5, 1.5, 0.05]} position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="black" transparent opacity={0.3} />
      </Cylinder>
    </group>
  );
}

// Componente Field para o campo de jogo
function Field({ gameData }) {
  const [campo, setCampo] = useState(null);
  const [texturas, setTexturas] = useState({});

  useEffect(() => {
    // Carregador de texturas
    const textureLoader = new TextureLoader();
    
    // Lista de texturas para carregar
    const texturesToLoad = [
      { name: 'campo', path: '/campo/Part1_diff.png' },
      { name: 'linhas', path: '/campo/Part378_diff.png' },
    ];

    // Carrega todas as texturas
    Promise.all(
      texturesToLoad.map(tex => 
        new Promise(resolve => {
          textureLoader.load(tex.path, texture => {
            resolve({ name: tex.name, texture });
          });
        })
      )
    ).then(loadedTextures => {
      const textureMap = {};
      loadedTextures.forEach(({ name, texture }) => {
        textureMap[name] = texture;
      });
      setTexturas(textureMap);
    });

    // Carrega o modelo 3D (sem MTL - usando apenas OBJ)
    const objLoader = new OBJLoader();
    objLoader.load('/campo/cenarioecampo.obj', (obj) => {
      obj.traverse((child) => {
        if (child.isMesh) {
          // Aplica materiais e texturas apropriados
          child.material = new THREE.MeshStandardMaterial({
            map: texturas.campo || null,
            normalMap: texturas.linhas || null,
            color: '#2e8b57', // Verde do campo como fallback
            roughness: 0.8,
            metalness: 0.2,
          });
          child.receiveShadow = true;
          child.castShadow = true;
        }
      });

      // Ajusta a escala e posição do campo
      obj.scale.set(0.1, 0.1, 0.1);
      obj.position.set(0, 0, 0);
      setCampo(obj);
    },
    // Progress callback
    (progress) => {
      console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
    },
    // Error callback
    (error) => {
      console.error('Error loading OBJ model:', error);
      // Se falhar ao carregar o modelo, usa apenas o plano verde
    });
  }, []);

  return (
    <group>
      {campo && <primitive object={campo} />}
      <Ground /> {/* Mantém o plano verde como backup */}
    </group>
  );
}

// Componente para a câmera isométrica fixa
function FixedIsometricCamera() {
  const cameraRef = useRef();
  const { set } = useThree();

  useEffect(() => {
    if (cameraRef.current) {
      // Configura a posição da câmera para uma vista melhor do campo
      cameraRef.current.position.set(0, 40, 40);
      cameraRef.current.lookAt(0, 0, 0);
      set({ camera: cameraRef.current });
    }
  }, [set]);

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      fov={60}
      near={0.1}
      far={1000}
      position={[0, 40, 40]}
    />
  );
}

export default function Game3D({ gameData, onAction }) {
  return (
    <>
      <Canvas
        shadows
        camera={{ position: [0, 35, 25], fov: 75 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#87CEEB' }}
      >
        <color attach="background" args={['#87CEEB']} />
        <SceneEnvironment />
        <Lights />
        <Ground />

        <Field gameData={gameData} />

        {/* Renderizar jogadores */}
        {gameData && gameData.players && gameData.players.map(player => (
          <Player3D
            key={player.id}
            player={player}
            isCharging={gameData.kickSystem && gameData.kickSystem.chargingPlayer === player}
          />
        ))}

        {/* Renderizar bola/shell */}
        {gameData && gameData.shell && (
          <Sphere
            args={[0.8]}
            position={[
              (gameData.shell.x - 500) * 0.07,
              1,
              -(gameData.shell.y - 300) * 0.07
            ]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color="#8B4513"
              roughness={0.3}
              metalness={0.1}
            />
          </Sphere>
        )}

        {/* Renderizar Goombas */}
        {gameData && gameData.goombaPositions && (
          <>
            {/* Goombas Team 1 */}
            {gameData.goombaPositions.team1.map((goomba, index) =>
              goomba.active && (
                <group key={`team1-goomba-${index}`} position={[
                  (goomba.x - 500) * 0.07,
                  0.5,
                  -(goomba.y - 300) * 0.07
                ]}>
                  {/* Corpo do Goomba */}
                  <Sphere args={[0.6]} castShadow receiveShadow>
                    <meshStandardMaterial color="#8B4513" />
                  </Sphere>
                  {/* Pés do Goomba */}
                  <Sphere args={[0.3]} position={[-0.3, -0.5, 0]} castShadow>
                    <meshStandardMaterial color="#654321" />
                  </Sphere>
                  <Sphere args={[0.3]} position={[0.3, -0.5, 0]} castShadow>
                    <meshStandardMaterial color="#654321" />
                  </Sphere>
                  {/* Olhos */}
                  <Sphere args={[0.1]} position={[-0.2, 0.2, 0.5]} castShadow>
                    <meshBasicMaterial color="white" />
                  </Sphere>
                  <Sphere args={[0.1]} position={[0.2, 0.2, 0.5]} castShadow>
                    <meshBasicMaterial color="white" />
                  </Sphere>
                  <Sphere args={[0.05]} position={[-0.2, 0.2, 0.55]} castShadow>
                    <meshBasicMaterial color="black" />
                  </Sphere>
                  <Sphere args={[0.05]} position={[0.2, 0.2, 0.55]} castShadow>
                    <meshBasicMaterial color="black" />
                  </Sphere>
                </group>
              )
            )}

            {/* Goombas Team 2 */}
            {gameData.goombaPositions.team2.map((goomba, index) =>
              goomba.active && (
                <group key={`team2-goomba-${index}`} position={[
                  (goomba.x - 500) * 0.07,
                  0.5,
                  -(goomba.y - 300) * 0.07
                ]}>
                  {/* Corpo do Goomba */}
                  <Sphere args={[0.6]} castShadow receiveShadow>
                    <meshStandardMaterial color="#8B4513" />
                  </Sphere>
                  {/* Pés do Goomba */}
                  <Sphere args={[0.3]} position={[-0.3, -0.5, 0]} castShadow>
                    <meshStandardMaterial color="#654321" />
                  </Sphere>
                  <Sphere args={[0.3]} position={[0.3, -0.5, 0]} castShadow>
                    <meshStandardMaterial color="#654321" />
                  </Sphere>
                  {/* Olhos */}
                  <Sphere args={[0.1]} position={[-0.2, 0.2, 0.5]} castShadow>
                    <meshBasicMaterial color="white" />
                  </Sphere>
                  <Sphere args={[0.1]} position={[0.2, 0.2, 0.5]} castShadow>
                    <meshBasicMaterial color="white" />
                  </Sphere>
                  <Sphere args={[0.05]} position={[-0.2, 0.2, 0.55]} castShadow>
                    <meshBasicMaterial color="black" />
                  </Sphere>
                  <Sphere args={[0.05]} position={[0.2, 0.2, 0.55]} castShadow>
                    <meshBasicMaterial color="black" />
                  </Sphere>
                </group>
              )
            )}
          </>
        )}

        <FixedIsometricCamera />
        <ambientLight intensity={1.2} />
        <hemisphereLight
          skyColor="#ffffff"
          groundColor="#8eb4e6"
          intensity={1}
        />
      </Canvas>


      <div style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        zIndex: 10,
        fontFamily: 'Arial, sans-serif'
      }}>
        {/* [Rest of the HUD remains unchanged] */}
      </div>
    </>
  );
}
