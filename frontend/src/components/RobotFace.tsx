import { useState } from "react";
import { motion } from "framer-motion";

export type RobotState = "idle" | "listening" | "thinking" | "speaking";
export type RobotExpression = "neutral" | "happy" | "sad" | "surprised" | "thinking" | "concerned";

interface RobotFaceProps {
  state: RobotState;
  expression: RobotExpression;
  onClick?: () => void;
}

export default function RobotFace({ state, expression, onClick }: RobotFaceProps) {
  // Local animation state for interactive limb movements
  const [localExpression, setLocalExpression] = useState<RobotExpression | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const [leftArmRotate, setLeftArmRotate] = useState<number | number[]>(0);
  const [rightArmRotate, setRightArmRotate] = useState<number | number[]>(0);
  const [leftLegRotate, setLeftLegRotate] = useState<number | number[]>(0);
  const [rightLegRotate, setRightLegRotate] = useState<number | number[]>(0);
  const [bodyYOffset, setBodyYOffset] = useState<number | number[]>(0);
  const [bodyRotate, setBodyRotate] = useState<number | number[]>(0);

  // Combine parent expression and local animation expression
  const currentExpression = localExpression || expression;

  // Determine primary glowing color based on state
  const getGlowColor = () => {
    switch (state) {
      case "listening":
        return "#10b981"; // Emerald green
      case "thinking":
        return "#f59e0b"; // Amber orange
      case "speaking":
        return "#06b6d4"; // Cyan
      case "idle":
      default:
        return "#3b82f6"; // Blue
    }
  };

  const glowColor = getGlowColor();

  // State-dependent movement animation helper functions
  const getLeftArmAnimation = () => {
    if (isAnimating) {
      return {
        rotate: leftArmRotate,
        transition: { type: "spring" as const, stiffness: 140, damping: 12 }
      };
    }
    
    switch (state) {
      case "speaking":
        return {
          rotate: [-15, -35, -15],
          transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" as const }
        };
      case "listening":
        return {
          rotate: [-25, -20, -25],
          transition: { duration: 2.0, repeat: Infinity, ease: "easeInOut" as const }
        };
      case "thinking":
        return {
          rotate: [-10],
          transition: { duration: 0.5 }
        };
      case "idle":
      default:
        return {
          rotate: [-5, 5, -5],
          transition: { duration: 4.0, repeat: Infinity, ease: "easeInOut" as const }
        };
    }
  };

  const getRightArmAnimation = () => {
    if (isAnimating) {
      return {
        rotate: rightArmRotate,
        transition: { type: "spring" as const, stiffness: 140, damping: 12 }
      };
    }
    
    switch (state) {
      case "speaking":
        return {
          rotate: [15, 35, 15],
          transition: { duration: 1.0, repeat: Infinity, ease: "easeInOut" as const, delay: 0.2 }
        };
      case "listening":
        return {
          rotate: [25, 20, 25],
          transition: { duration: 2.0, repeat: Infinity, ease: "easeInOut" as const }
        };
      case "thinking":
        return {
          rotate: [110, 120, 110],
          transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const }
        };
      case "idle":
      default:
        return {
          rotate: [5, -5, 5],
          transition: { duration: 4.0, repeat: Infinity, ease: "easeInOut" as const }
        };
    }
  };

  const getLeftLegAnimation = () => {
    if (isAnimating) {
      return {
        rotate: leftLegRotate,
        transition: { type: "spring" as const, stiffness: 120, damping: 10 }
      };
    }
    
    switch (state) {
      case "speaking":
        return {
          rotate: [-5, 5, -5],
          transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const }
        };
      case "thinking":
        return {
          rotate: [5, -5, 5],
          transition: { duration: 2.0, repeat: Infinity, ease: "easeInOut" as const }
        };
      case "idle":
      default:
        return {
          rotate: [0, -3, 0],
          transition: { duration: 6.0, repeat: Infinity, ease: "easeInOut" as const }
        };
    }
  };

  const getRightLegAnimation = () => {
    if (isAnimating) {
      return {
        rotate: rightLegRotate,
        transition: { type: "spring" as const, stiffness: 120, damping: 10 }
      };
    }
    
    switch (state) {
      case "speaking":
        return {
          rotate: [5, -5, 5],
          transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const, delay: 0.3 }
        };
      case "thinking":
        return {
          rotate: [-5, 5, -5],
          transition: { duration: 2.0, repeat: Infinity, ease: "easeInOut" as const }
        };
      case "idle":
      default:
        return {
          rotate: [0, 3, 0],
          transition: { duration: 6.0, repeat: Infinity, ease: "easeInOut" as const }
        };
    }
  };

  // Trigger a random physics-like animation on the robot's limbs
  const triggerRandomMovement = () => {
    if (isAnimating) return; // Prevent overlapping click triggers
    setIsAnimating(true);

    // Call the parent click handler if provided
    if (onClick) {
      onClick();
    }

    const randomAnimType = Math.floor(Math.random() * 6);
    
    switch (randomAnimType) {
      case 0: // Left Arm Wave
        setLeftArmRotate([0, -135, -90, -135, 0]);
        setBodyRotate([0, -4, 0]);
        setLocalExpression("happy");
        setTimeout(() => {
          setLeftArmRotate(0);
          setBodyRotate(0);
          setLocalExpression(null);
          setIsAnimating(false);
        }, 1000);
        break;

      case 1: // Right Arm Wave
        setRightArmRotate([0, 135, 90, 135, 0]);
        setBodyRotate([0, 4, 0]);
        setLocalExpression("happy");
        setTimeout(() => {
          setRightArmRotate(0);
          setBodyRotate(0);
          setLocalExpression(null);
          setIsAnimating(false);
        }, 1000);
        break;

      case 2: // Double Arm Jump / High Five
        setLeftArmRotate([0, -150, -150, 0]);
        setRightArmRotate([0, 150, 150, 0]);
        setLeftLegRotate([0, 20, -10, 0]);
        setRightLegRotate([0, -20, 10, 0]);
        setBodyYOffset([0, -30, -30, 0]);
        setLocalExpression("surprised");
        setTimeout(() => {
          setLeftArmRotate(0);
          setRightArmRotate(0);
          setLeftLegRotate(0);
          setRightLegRotate(0);
          setBodyYOffset(0);
          setLocalExpression(null);
          setIsAnimating(false);
        }, 900);
        break;

      case 3: // Kick Left Leg
        setLeftLegRotate([0, -45, 10, 0]);
        setLeftArmRotate([0, 30, 0]);
        setRightArmRotate([0, -20, 0]);
        setBodyRotate([0, -8, 0]);
        setLocalExpression("thinking");
        setTimeout(() => {
          setLeftLegRotate(0);
          setLeftArmRotate(0);
          setRightArmRotate(0);
          setBodyRotate(0);
          setLocalExpression(null);
          setIsAnimating(false);
        }, 700);
        break;

      case 4: // Kick Right Leg
        setRightLegRotate([0, 45, -10, 0]);
        setRightArmRotate([0, -30, 0]);
        setLeftArmRotate([0, 20, 0]);
        setBodyRotate([0, 8, 0]);
        setLocalExpression("thinking");
        setTimeout(() => {
          setRightLegRotate(0);
          setRightArmRotate(0);
          setLeftArmRotate(0);
          setBodyRotate(0);
          setLocalExpression(null);
          setIsAnimating(false);
        }, 700);
        break;

      case 5: // Happy Dance / Wiggle
      default:
        setLeftArmRotate([0, -60, 60, -60, 60, 0]);
        setRightArmRotate([0, 60, -60, 60, -60, 0]);
        setLeftLegRotate([0, 15, -15, 15, -15, 0]);
        setRightLegRotate([0, -15, 15, -15, 15, 0]);
        setBodyYOffset([0, -10, 10, -10, 10, 0]);
        setBodyRotate([0, -10, 10, -10, 10, 0]);
        setLocalExpression("happy");
        setTimeout(() => {
          setLeftArmRotate(0);
          setRightArmRotate(0);
          setLeftLegRotate(0);
          setRightLegRotate(0);
          setBodyYOffset(0);
          setBodyRotate(0);
          setLocalExpression(null);
          setIsAnimating(false);
        }, 1200);
        break;
    }
  };

  // Eye paths/shapes based on expression
  const renderEyes = () => {
    const eyeVariants: any = {
      neutral: {
        scaleY: [1, 1, 0.1, 1, 1], // Eye blink animation
        transition: {
          duration: 3,
          repeat: Infinity,
          repeatDelay: 2.5,
          ease: "easeInOut",
        },
      },
      thinking: {
        scaleY: 0.6,
        rotate: [0, 5, -5, 0],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
      },
      happy: {
        scaleY: 1,
        rotate: 0,
      },
      sad: {
        scaleY: 1,
        rotate: 0,
      },
      surprised: {
        scale: 1.25,
      },
      concerned: {
        scaleY: 0.85,
        rotate: 0,
      }
    };

    const isBlinkingDisabled = state === "thinking" || currentExpression === "happy" || currentExpression === "sad" || currentExpression === "surprised";

    return (
      <g className="eyes-group">
        {/* Left Eye */}
        <motion.g
          animate={isBlinkingDisabled ? undefined : "neutral"}
          variants={eyeVariants}
          style={{ originX: "65px", originY: "75px" }}
        >
          {/* Eyelashes */}
          <g stroke={glowColor} strokeWidth="3" strokeLinecap="round" filter="url(#neon-glow)">
            <line x1="57" y1="68" x2="45" y2="60" />
            <line x1="63" y1="65" x2="54" y2="54" />
            <line x1="70" y1="66" x2="65" y2="54" />
          </g>

          {currentExpression === "happy" ? (
            // Happy eyes: ^ ^
            <path
              d="M50,80 Q65,60 80,80"
              fill="none"
              stroke={glowColor}
              strokeWidth="10"
              strokeLinecap="round"
              filter="url(#neon-glow)"
            />
          ) : currentExpression === "sad" ? (
            // Sad eyes: / \
            <path
              d="M50,70 Q65,85 80,70"
              fill="none"
              stroke={glowColor}
              strokeWidth="10"
              strokeLinecap="round"
              filter="url(#neon-glow)"
            />
          ) : currentExpression === "surprised" ? (
            // Surprised eyes: large circles
            <circle
              cx="65"
              cy="75"
              r="14"
              fill="none"
              stroke={glowColor}
              strokeWidth="6"
              filter="url(#neon-glow)"
            />
          ) : currentExpression === "concerned" ? (
            // Concerned eyes: slight downward slant
            <path
              d="M52,78 Q65,72 78,76"
              fill="none"
              stroke={glowColor}
              strokeWidth="9"
              strokeLinecap="round"
              filter="url(#neon-glow)"
            />
          ) : (
            // Default: glowing circles
            <circle
              cx="65"
              cy="75"
              r="10"
              fill={glowColor}
              filter="url(#neon-glow)"
            />
          )}
        </motion.g>

        {/* Right Eye */}
        <motion.g
          animate={isBlinkingDisabled ? undefined : "neutral"}
          variants={eyeVariants}
          style={{ originX: "135px", originY: "75px" }}
        >
          {/* Eyelashes */}
          <g stroke={glowColor} strokeWidth="3" strokeLinecap="round" filter="url(#neon-glow)">
            <line x1="143" y1="68" x2="155" y2="60" />
            <line x1="137" y1="65" x2="146" y2="54" />
            <line x1="130" y1="66" x2="135" y2="54" />
          </g>

          {currentExpression === "happy" ? (
            // Happy eyes: ^ ^
            <path
              d="M120,80 Q135,60 150,80"
              fill="none"
              stroke={glowColor}
              strokeWidth="10"
              strokeLinecap="round"
              filter="url(#neon-glow)"
            />
          ) : currentExpression === "sad" ? (
            // Sad eyes: / \
            <path
              d="M120,70 Q135,85 150,70"
              fill="none"
              stroke={glowColor}
              strokeWidth="10"
              strokeLinecap="round"
              filter="url(#neon-glow)"
            />
          ) : currentExpression === "surprised" ? (
            // Surprised eyes: large circles
            <circle
              cx="135"
              cy="75"
              r="14"
              fill="none"
              stroke={glowColor}
              strokeWidth="6"
              filter="url(#neon-glow)"
            />
          ) : currentExpression === "concerned" ? (
            // Concerned eyes
            <path
              d="M122,76 Q135,72 148,78"
              fill="none"
              stroke={glowColor}
              strokeWidth="9"
              strokeLinecap="round"
              filter="url(#neon-glow)"
            />
          ) : (
            // Default: glowing circles
            <circle
              cx="135"
              cy="75"
              r="10"
              fill={glowColor}
              filter="url(#neon-glow)"
            />
          )}
        </motion.g>

        {/* Subtle Eyebrows for expressions */}
        {currentExpression === "thinking" && (
          <g>
            <motion.path
              d="M48,58 L82,64"
              stroke={glowColor}
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#neon-glow)"
            />
            <motion.path
              d="M118,60 L152,56"
              stroke={glowColor}
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#neon-glow)"
            />
          </g>
        )}
        {currentExpression === "concerned" && (
          <g>
            <motion.path
              d="M50,62 L80,68"
              stroke={glowColor}
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#neon-glow)"
            />
            <motion.path
              d="M120,68 L150,62"
              stroke={glowColor}
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#neon-glow)"
            />
          </g>
        )}
      </g>
    );
  };

  // Rendering mouth/visualizer
  const renderMouth = () => {
    if (state === "speaking") {
      // Premium Audio Equalizer visualizer when speaking
      const bars = Array.from({ length: 9 });
      return (
        <g transform="translate(60, 115)">
          {bars.map((_, i) => {
            const width = 6;
            const gap = 4;
            const x = i * (width + gap);
            // Stagger animation for equalizer bars
            return (
              <motion.rect
                key={i}
                x={x}
                y={-15}
                width={width}
                height={30}
                rx={3}
                fill={glowColor}
                filter="url(#neon-glow)"
                animate={{
                  height: [10, 45, 10],
                  y: [-5, -22.5, -5],
                }}
                transition={{
                  duration: 0.4 + (i % 3) * 0.15,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </g>
      );
    }

    if (state === "listening") {
      // Glowing pulsing recording dot or soundwave
      return (
        <g transform="translate(100, 115)">
          <motion.circle
            r={10}
            fill={glowColor}
            filter="url(#neon-glow)"
            animate={{
              scale: [0.8, 1.4, 0.8],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </g>
      );
    }

    if (state === "thinking") {
      // Ellipsis processing points
      return (
        <g transform="translate(76, 115)">
          {[0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              cx={i * 24}
              cy={0}
              r={5}
              fill={glowColor}
              filter="url(#neon-glow)"
              animate={{
                y: [0, -10, 0],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.25,
                ease: "easeInOut",
              }}
            />
          ))}
        </g>
      );
    }

    // Default Idle mouth by expression
    return (
      <g transform="translate(100, 115)">
        {currentExpression === "happy" ? (
          // Smile
          <path
            d="M-25,-5 Q0,20 25,-5"
            fill="none"
            stroke={glowColor}
            strokeWidth="8"
            strokeLinecap="round"
            filter="url(#neon-glow)"
          />
        ) : currentExpression === "sad" ? (
          // Frown
          <path
            d="M-25,10 Q0,-10 25,10"
            fill="none"
            stroke={glowColor}
            strokeWidth="8"
            strokeLinecap="round"
            filter="url(#neon-glow)"
          />
        ) : currentExpression === "surprised" ? (
          // Small O mouth
          <circle
            cx="0"
            cy="0"
            r="10"
            fill="none"
            stroke={glowColor}
            strokeWidth="7"
            filter="url(#neon-glow)"
          />
        ) : (
          // Neutral horizontal bar
          <line
            x1="-20"
            y1="0"
            x2="20"
            y2="0"
            stroke={glowColor}
            strokeWidth="8"
            strokeLinecap="round"
            filter="url(#neon-glow)"
          />
        )}
      </g>
    );
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      {/* Outer ambient blur shadow */}
      <div
        className="absolute w-40 h-40 rounded-full blur-[35px] opacity-20 transition-all duration-700 pointer-events-none"
        style={{ backgroundColor: glowColor }}
      />

      {/* Interactive Full Body Robot SVG */}
      <motion.svg
        viewBox="0 0 200 320"
        onClick={triggerRandomMovement}
        className="w-full h-full cursor-pointer drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] active:scale-95 transition-transform duration-100"
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <defs>
          {/* Neon Glow Filter */}
          <filter id="neon-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur1" />
            <feGaussianBlur stdDeviation="2" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Screen Honeycomb Pattern */}
          <pattern id="screen-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 10 M 0 0 L 10 10" stroke="rgba(255,255,255,0.012)" strokeWidth="1" />
          </pattern>
        </defs>

        {/* --- ROBOT BODY COMPONENT --- */}
        <motion.g
          animate={{
            y: bodyYOffset,
            rotate: bodyRotate,
          }}
          transition={{
            type: "spring",
            stiffness: 150,
            damping: 15,
          }}
        >
          {/* 1. Left Leg */}
          <motion.g
            animate={getLeftLegAnimation()}
            style={{ originX: "78px", originY: "255px" }}
          >
            <rect x="70" y="252" width="16" height="42" rx="8" fill="#374151" stroke="#4b5563" strokeWidth="2.5" />
            {/* Calf join */}
            <circle cx="78" cy="275" r="4" fill={glowColor} />
            {/* Foot */}
            <ellipse cx="78" cy="296" rx="13" ry="7" fill="#1f2937" stroke="#4b5563" strokeWidth="2.5" />
          </motion.g>

          {/* 2. Right Leg */}
          <motion.g
            animate={getRightLegAnimation()}
            style={{ originX: "122px", originY: "255px" }}
          >
            <rect x="114" y="252" width="16" height="42" rx="8" fill="#374151" stroke="#4b5563" strokeWidth="2.5" />
            {/* Calf join */}
            <circle cx="122" cy="275" r="4" fill={glowColor} />
            {/* Foot */}
            <ellipse cx="122" cy="296" rx="13" ry="7" fill="#1f2937" stroke="#4b5563" strokeWidth="2.5" />
          </motion.g>

          {/* 3. Left Arm */}
          <motion.g
            animate={getLeftArmAnimation()}
            style={{ originX: "48px", originY: "190px" }}
          >
            {/* Shoulder */}
            <circle cx="48" cy="190" r="9" fill="#4b5563" />
            {/* Arm Shaft */}
            <rect x="42" y="190" width="12" height="45" rx="6" fill="#374151" stroke="#4b5563" strokeWidth="2" />
            {/* Glowing Hand Claw */}
            <circle cx="48" cy="240" r="7.5" fill={glowColor} filter="url(#neon-glow)" />
          </motion.g>

          {/* 4. Right Arm */}
          <motion.g
            animate={getRightArmAnimation()}
            style={{ originX: "152px", originY: "190px" }}
          >
            {/* Shoulder */}
            <circle cx="152" cy="190" r="9" fill="#4b5563" />
            {/* Arm Shaft */}
            <rect x="146" y="190" width="12" height="45" rx="6" fill="#374151" stroke="#4b5563" strokeWidth="2" />
            {/* Glowing Hand Claw */}
            <circle cx="152" cy="240" r="7.5" fill={glowColor} filter="url(#neon-glow)" />
          </motion.g>

          {/* 5. Neck Join */}
          <rect x="88" y="152" width="24" height="25" rx="4" fill="#4b5563" stroke="#374151" strokeWidth="2.5" />
          {/* Neck ribs */}
          <line x1="92" y1="160" x2="108" y2="160" stroke="#1f2937" strokeWidth="3.5" />
          <line x1="92" y1="167" x2="108" y2="167" stroke="#1f2937" strokeWidth="3.5" />

          {/* 6. Torso / Body */}
          <rect x="54" y="172" width="92" height="84" rx="22" fill="#1f2937" stroke="#4b5563" strokeWidth="4.5" />

          {/* Cute Flared Skirt/Dress */}
          <path
            d="M 64 218 L 42 258 C 42 265, 158 265, 158 258 L 136 218 Z"
            fill="#2c3545"
            stroke="#ec4899"
            strokeWidth="3.5"
            filter="url(#neon-glow)"
          />
          {/* Cute Belt / Sash on the dress waist */}
          <rect x="62" y="214" width="76" height="6" rx="3" fill="#f43f5e" />
          
          {/* Glowing Arc Reactor-style status light in the chest */}
          <circle cx="100" cy="214" r="16" fill="#0b0f19" stroke="#374151" strokeWidth="2.5" />
          <motion.circle
            cx="100"
            cy="214"
            r="10"
            fill={glowColor}
            filter="url(#neon-glow)"
            animate={{
              opacity: state === "listening" ? [0.5, 1, 0.5] : state === "thinking" ? [0.3, 0.9, 0.3] : 0.7,
              scale: state === "speaking" ? [0.9, 1.15, 0.9] : 1,
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Decorative chest detailing lines */}
          <path d="M 66 188 L 134 188" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
          <path d="M 72 242 L 128 242" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />

          {/* --- ROBOT HEAD --- */}
          {/* Antenna */}
          <g className="antenna">
            <line x1="100" y1="40" x2="100" y2="15" stroke="#4b5563" strokeWidth="6.5" />
            <motion.circle
              cx="100"
              cy="15"
              r="8"
              fill={glowColor}
              filter="url(#neon-glow)"
              animate={{
                opacity: state === "thinking" ? [0.4, 1, 0.4] : 1,
                scale: state === "listening" ? [1, 1.3, 1] : 1,
              }}
              transition={{
                duration: 1.0,
                repeat: state === "thinking" || state === "listening" ? Infinity : 0,
                ease: "easeInOut",
              }}
            />
          </g>

          {/* Glowing Ears / Speakers */}
          <g className="ears">
            {/* Left Ear */}
            <rect x="15" y="65" width="8" height="50" rx="4" fill="#374151" />
            <motion.rect
              x="7"
              y="72"
              width="8"
              height="36"
              rx="4"
              fill={glowColor}
              filter="url(#neon-glow)"
              animate={
                state === "listening"
                  ? { scaleX: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }
                  : state === "speaking"
                  ? { scaleX: [1, 1.25, 1] }
                  : {}
              }
              transition={{ duration: 0.8, repeat: Infinity }}
              style={{ originX: "15px" }}
            />

            {/* Right Ear */}
            <rect x="177" y="65" width="8" height="50" rx="4" fill="#374151" />
            <motion.rect
              x="185"
              y="72"
              width="8"
              height="36"
              rx="4"
              fill={glowColor}
              filter="url(#neon-glow)"
              animate={
                state === "listening"
                  ? { scaleX: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }
                  : state === "speaking"
                  ? { scaleX: [1, 1.25, 1] }
                  : {}
              }
              transition={{ duration: 0.8, repeat: Infinity }}
              style={{ originX: "185px" }}
            />
          </g>

          {/* Head Shell Casing */}
          <rect
            x="25"
            y="40"
            width="150"
            height="120"
            rx="32"
            fill="#1f2937"
            stroke="#4b5563"
            strokeWidth="4"
          />

          {/* Cute Lady Hair Bow */}
          <g className="hair-bow" transform="translate(48, 38)">
            {/* Left wing */}
            <path d="M 0 0 L -18 -12 L -18 6 Z" fill="#ec4899" stroke="#f43f5e" strokeWidth="1.5" filter="url(#neon-glow)" />
            {/* Right wing */}
            <path d="M 0 0 L 18 -12 L 18 6 Z" fill="#ec4899" stroke="#f43f5e" strokeWidth="1.5" filter="url(#neon-glow)" />
            {/* Center knot */}
            <circle cx="0" cy="-3" r="5.5" fill="#f43f5e" stroke="#db2777" strokeWidth="1.5" />
          </g>

          {/* Inner Screen Screen Glass */}
          <rect
            x="33"
            y="48"
            width="134"
            height="104"
            rx="24"
            fill="#0f172a"
            stroke={glowColor}
            strokeWidth="2.5"
            className="transition-colors duration-500"
            style={{
              boxShadow: `0 0 10px ${glowColor} opacity 0.2`,
            }}
          />

          {/* Screen pattern overlay */}
          <rect x="33" y="48" width="134" height="104" rx="24" fill="url(#screen-pattern)" />

          {/* Cute Cheek Blush (soft pink glow on the sides) */}
          <ellipse cx="54" cy="102" rx="9" ry="4.5" fill="#f43f5e" opacity="0.4" filter="url(#neon-glow)" />
          <ellipse cx="146" cy="102" rx="9" ry="4.5" fill="#f43f5e" opacity="0.4" filter="url(#neon-glow)" />

          {/* Render Eye Component */}
          {renderEyes()}

          {/* Render Mouth Component */}
          {renderMouth()}

          {/* Gloss Overlay Reflector */}
          <path
            d="M 33 60 C 33 60, 60 50, 110 50 C 160 50, 167 60, 167 60 C 167 60, 150 53, 100 53 C 50 53, 33 60, 33 60 Z"
            fill="rgba(255, 255, 255, 0.08)"
          />
        </motion.g>
      </motion.svg>
    </div>
  );
}

