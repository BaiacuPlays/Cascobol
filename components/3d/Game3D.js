import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Cylinder, Plane } from '@react-three/drei';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

// Componente do Campo 3D - Carrega modelo OBJ com fallback
function Field() {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  let obj = null;

  try {
    obj = useLoader(OBJLoader, '/cenarioecampo.obj');
    if (obj && !modelLoaded) {
      setModelLoaded(true);
    }
  } catch (error) {
    console.error('Erro ao carregar modelo 3D:', error);
    if (!loadError) {
      setLoadError(true);
    }
  }

  useEffect(() => {
    if (obj) {
      // Configurar materiais e sombras para o modelo carregado
      obj.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          // Aplicar materiais baseados no nome do objeto ou posição
          if (child.material) {
            child.material.needsUpdate = true;
          }
        }
      });
    }
  }, [obj]);

  return (
    <group>
      {/* Modelo 3D do campo ou fallback */}
      {obj && modelLoaded ? (
        <primitive
          object={obj}
          position={[0, 0, 0]}
          scale={[1, 1, 1]}
        />
      ) : (
        // Fallback - campo simples estilo Mario Party 9
        <>
          <Plane args={[100, 60]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <meshLambertMaterial color="#2E8B57" />
          </Plane>

          {/* Linhas do campo */}
          <Plane args={[100, 0.8]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <meshLambertMaterial color="#FFFFFF" />
          </Plane>
          <Plane args={[0.8, 60]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <meshLambertMaterial color="#FFFFFF" />
          </Plane>

          {/* Círculo central */}
          <Cylinder args={[8, 8, 0.1]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <meshLambertMaterial color="#FFFFFF" transparent opacity={0.9} />
          </Cylinder>

          {/* Bordas coloridas */}
          <Box args={[104, 2, 3]} position={[0, 1, -31.5]} castShadow>
            <meshLambertMaterial color="#FF6B35" />
          </Box>
          <Box args={[104, 2, 3]} position={[0, 1, 31.5]} castShadow>
            <meshLambertMaterial color="#FF6B35" />
          </Box>
          <Box args={[3, 2, 65]} position={[-51.5, 1, 0]} castShadow>
            <meshLambertMaterial color="#FF6B35" />
          </Box>
          <Box args={[3, 2, 65]} position={[51.5, 1, 0]} castShadow>
            <meshLambertMaterial color="#FF6B35" />
          </Box>
        </>
      )}

      {/* Áreas dos Goombas - mantidas para gameplay */}
      <Box args={[10, 0.1, 40]} position={[-45, 0.05, 0]} receiveShadow>
        <meshLambertMaterial color="#DC143C" transparent opacity={0.3} />
      </Box>
      <Box args={[10, 0.1, 40]} position={[45, 0.05, 0]} receiveShadow>
        <meshLambertMaterial color="#4169E1" transparent opacity={0.3} />
      </Box>
    </group>
  );
}

// Componente do Jogador 3D
function Player3D({ player, label }) {
  const meshRef = useRef();
  const [bounceOffset, setBounceOffset] = useState(0);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.x = (player.x - 500) / 10; // Converter coordenadas 2D para 3D
      meshRef.current.position.z = (player.y - 300) / 10; // Corrigido: removido o sinal negativo

      // Animação de bounce quando se move
      const isMoving = Math.abs(player.vx) > 0.1 || Math.abs(player.vy) > 0.1;
      if (isMoving) {
        setBounceOffset(Math.sin(state.clock.elapsedTime * 10) * 0.2);
      } else {
        setBounceOffset(0);
      }

      meshRef.current.position.y = 2 + bounceOffset;

      // Rotação baseada na direção do movimento
      if (Math.abs(player.vx) > 0.1 || Math.abs(player.vy) > 0.1) {
        const angle = Math.atan2(player.vy, player.vx);
        meshRef.current.rotation.y = -angle;
      }
    }
  });

  return (
    <group ref={meshRef}>
      {/* Corpo principal do jogador - mais parecido com Mario Party */}
      <Sphere args={[2]} position={[0, 0, 0]} castShadow receiveShadow>
        <meshPhongMaterial
          color={player.color}
          emissive={player.isSliding ? "#ff0000" : player.color}
          emissiveIntensity={player.isSliding ? 0.4 : 0.1}
          shininess={50}
        />
      </Sphere>

      {/* Detalhes do jogador */}
      <Sphere args={[0.3]} position={[-0.6, 0.6, 1.5]} castShadow>
        <meshLambertMaterial color="#FFFFFF" />
      </Sphere>
      <Sphere args={[0.3]} position={[0.6, 0.6, 1.5]} castShadow>
        <meshLambertMaterial color="#FFFFFF" />
      </Sphere>
      <Sphere args={[0.15]} position={[-0.6, 0.6, 1.7]} castShadow>
        <meshLambertMaterial color="#000000" />
      </Sphere>
      <Sphere args={[0.15]} position={[0.6, 0.6, 1.7]} castShadow>
        <meshLambertMaterial color="#000000" />
      </Sphere>

      {/* Efeito de slide tackle */}
      {player.isSliding && (
        <Cylinder args={[3, 3, 0.2]} position={[0, -1.5, 0]}>
          <meshLambertMaterial
            color="#FFD700"
            transparent
            opacity={0.6}
          />
        </Cylinder>
      )}

      {/* Label do jogador */}
      <Text
        position={[0, 4, 0]}
        fontSize={1.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.1}
        outlineColor="black"
      >
        {label}
      </Text>

      {/* Indicador de time no chão */}
      <Cylinder args={[2.5, 2.5, 0.1]} position={[0, -1.7, 0]} receiveShadow>
        <meshLambertMaterial
          color={player.lightColor}
          transparent
          opacity={0.7}
        />
      </Cylinder>

      {/* Indicador de stun */}
      {player.isStunned && (
        <group position={[0, 3, 0]}>
          <Text
            fontSize={2}
            color="#FFD700"
            anchorX="center"
            anchorY="middle"
          >
            ⭐
          </Text>
        </group>
      )}
    </group>
  );
}

// Componente da Bola/Shell 3D
function Shell3D({ shell }) {
  const meshRef = useRef();
  const trailRef = useRef();
  const [isMoving, setIsMoving] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.x = (shell.x - 500) / 10;
      meshRef.current.position.z = (shell.y - 300) / 10; // Corrigido: removido o sinal negativo

      // Altura da bola com bounce
      const speed = Math.sqrt(shell.vx * shell.vx + shell.vy * shell.vy);
      const bounceHeight = Math.min(speed * 0.1, 2);
      meshRef.current.position.y = 1 + Math.abs(Math.sin(state.clock.elapsedTime * 8)) * bounceHeight;

      // Rotação da bola baseada na velocidade
      meshRef.current.rotation.x += shell.vx * 0.02;
      meshRef.current.rotation.z += shell.vy * 0.02;

      // Detectar se está se movendo
      setIsMoving(speed > 1);
    }
  });

  return (
    <group>
      {/* Rastro da bola quando em movimento */}
      {isMoving && (
        <Cylinder ref={trailRef} args={[1.2, 1.2, 0.1]} position={[(shell.x - 500) / 10, 0.05, (shell.y - 300) / 10]}>
          <meshLambertMaterial
            color="#FFD700"
            transparent
            opacity={0.3}
          />
        </Cylinder>
      )}

      {/* Bola principal - aumentada para ser mais visível */}
      <Sphere ref={meshRef} args={[1.5]} castShadow>
        <meshPhongMaterial
          color="#FFD700"
          emissive="#FFA500"
          emissiveIntensity={0.4}
          shininess={100}
        />
      </Sphere>

      {/* Brilho da bola */}
      <Sphere args={[1.7]} position={[(shell.x - 500) / 10, 1, (shell.y - 300) / 10]}>
        <meshLambertMaterial
          color="#FFFF00"
          transparent
          opacity={0.15}
        />
      </Sphere>
    </group>
  );
}

// Componente dos Goombas 3D
function Goomba3D({ goomba, teamColor, index }) {
  const meshRef = useRef();

  if (!goomba.active) return null;

  const position = [
    (goomba.x - 500) / 10,
    0.75,
    (goomba.y - 300) / 10 // Corrigido: removido o sinal negativo
  ];

  useFrame((state) => {
    if (meshRef.current) {
      // Animação de respiração/pulsação
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={position}>
      {/* Corpo do Goomba - mais parecido com Mario Party */}
      <Cylinder ref={meshRef} args={[2, 2, 2]} castShadow receiveShadow>
        <meshPhongMaterial
          color={teamColor}
          emissive={teamColor}
          emissiveIntensity={0.3}
          shininess={30}
        />
      </Cylinder>

      {/* Olhos do Goomba maiores */}
      <Sphere args={[0.3]} position={[-0.7, 0.5, 1.8]}>
        <meshLambertMaterial color="#FFFFFF" />
      </Sphere>
      <Sphere args={[0.3]} position={[0.7, 0.5, 1.8]}>
        <meshLambertMaterial color="#FFFFFF" />
      </Sphere>
      <Sphere args={[0.15]} position={[-0.7, 0.5, 2]}>
        <meshLambertMaterial color="#000000" />
      </Sphere>
      <Sphere args={[0.15]} position={[0.7, 0.5, 2]}>
        <meshLambertMaterial color="#000000" />
      </Sphere>

      {/* Boca do Goomba */}
      <Sphere args={[0.2]} position={[0, 0, 2]}>
        <meshLambertMaterial color="#000000" />
      </Sphere>

      {/* Base do Goomba mais visível */}
      <Cylinder args={[2.3, 2.3, 0.3]} position={[0, -1.15, 0]} receiveShadow>
        <meshLambertMaterial
          color={teamColor}
          transparent
          opacity={0.6}
        />
      </Cylinder>

      {/* Brilho no topo */}
      <Sphere args={[0.4]} position={[0, 1.2, 0]}>
        <meshLambertMaterial
          color="#FFFFFF"
          transparent
          opacity={0.7}
        />
      </Sphere>
    </group>
  );
}

// Câmera fixa estilo Mario Party 9
function Camera3D({ players, shell }) {
  const { camera } = useThree();

  useFrame(() => {
    // Câmera completamente fixa - visão isométrica exata do Mario Party 9
    // Posição e ângulo para mostrar todo o campo como na referência
    camera.position.set(0, 60, 45);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  });

  return null;
}

// Componente de indicador de mira
function KickAim3D({ kickSystem }) {
  if (!kickSystem.isCharging || !kickSystem.chargingPlayer) return null;

  const player = kickSystem.chargingPlayer;
  const chargeTime = Date.now() - kickSystem.chargeStartTime;
  const power = Math.min(chargeTime / kickSystem.maxChargeTime, 1);

  const playerPos = [
    (player.x - 500) / 10,
    2,
    (player.y - 300) / 10 // Corrigido: removido o sinal negativo
  ];

  const aimLength = 5 + (power * 10);
  const aimEnd = [
    playerPos[0] + Math.cos(kickSystem.aimAngle) * aimLength,
    playerPos[1],
    playerPos[2] + Math.sin(kickSystem.aimAngle) * aimLength // Corrigido: removido o sinal negativo
  ];

  return (
    <group>
      {/* Linha de mira */}
      <Box
        args={[aimLength, 0.2, 0.2]}
        position={[
          playerPos[0] + Math.cos(kickSystem.aimAngle) * aimLength / 2,
          playerPos[1],
          playerPos[2] + Math.sin(kickSystem.aimAngle) * aimLength / 2 // Corrigido: removido o sinal negativo
        ]}
        rotation={[0, -kickSystem.aimAngle, 0]}
      >
        <meshLambertMaterial
          color={power > 0.8 ? "#FF0000" : power > 0.5 ? "#FFA500" : "#FFFF00"}
          transparent
          opacity={0.8}
        />
      </Box>

      {/* Indicador de força */}
      <Cylinder
        args={[0.5 + power * 1.5, 0.5 + power * 1.5, 0.1]}
        position={playerPos}
      >
        <meshLambertMaterial
          color={power > 0.8 ? "#FF0000" : power > 0.5 ? "#FFA500" : "#FFFF00"}
          transparent
          opacity={0.6}
        />
      </Cylinder>
    </group>
  );
}

// Componente principal do jogo 3D
export function Game3D({ gameData }) {
  if (!gameData || !gameData.players || !gameData.shell || !gameData.goombaPositions) {
    return (
      <div style={{ width: '100vw', height: '100vh', background: '#87CEEB' }}>
        <Canvas>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Field />
          <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
        </Canvas>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(to bottom, #87CEEB 0%, #98FB98 100%)' }}>
      <Canvas shadows camera={{ position: [0, 60, 45], fov: 35 }}>
        {/* Iluminação estilo Mario Party 9 - mais brilhante e colorida */}
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[30, 40, 20]}
          intensity={1.6}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={120}
          shadow-camera-left={-70}
          shadow-camera-right={70}
          shadow-camera-top={70}
          shadow-camera-bottom={-70}
        />
        <directionalLight position={[-25, 25, -15]} intensity={1.0} />
        <pointLight position={[0, 20, 0]} intensity={1.2} color="#FFD700" />
        <pointLight position={[-45, 15, 0]} intensity={0.8} color="#FF6B35" />
        <pointLight position={[45, 15, 0]} intensity={0.8} color="#FF6B35" />

        {/* Fog para profundidade - mais sutil */}
        <fog attach="fog" args={['#87CEEB', 80, 150]} />

        {/* Campo */}
        <Field />

        {/* Jogadores */}
        {gameData.players.map((player, index) => (
          <Player3D
            key={player.id}
            player={player}
            label={`P${index + 1}`}
          />
        ))}

        {/* Bola */}
        <Shell3D shell={gameData.shell} />

        {/* Indicador de mira */}
        {gameData.kickSystem && (
          <KickAim3D kickSystem={gameData.kickSystem} />
        )}

        {/* Goombas Time 1 */}
        {gameData.goombaPositions.team1.map((goomba, index) => (
          <Goomba3D
            key={`team1-${index}`}
            goomba={goomba}
            teamColor="#DC143C"
            index={index}
          />
        ))}

        {/* Goombas Time 2 */}
        {gameData.goombaPositions.team2.map((goomba, index) => (
          <Goomba3D
            key={`team2-${index}`}
            goomba={goomba}
            teamColor="#4169E1"
            index={index}
          />
        ))}

        {/* Câmera */}
        <Camera3D players={gameData.players} shell={gameData.shell} />

        {/* Controles (desabilitados para manter câmera fixa) */}
        <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
      </Canvas>
    </div>
  );
}

export default Game3D;
