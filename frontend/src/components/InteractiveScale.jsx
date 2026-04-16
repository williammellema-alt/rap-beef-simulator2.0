import { useMemo } from "react";
import { motion } from "framer-motion";
import { Scale } from "lucide-react";

const SPRING_CONFIG = { type: "spring", stiffness: 100, damping: 15 };
const TRANSFORM_ORIGIN = { transformOrigin: "top center" };
const FADE_IN_UP = { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 } };

const ScoreDisplay = ({ name, score, isWinning }) => (
  <div className="text-center">
    <div className={`font-heading text-xl uppercase ${isWinning ? 'text-[#FFD700]' : 'text-[#A3A3A3]'}`}>
      {name || 'P1'}
    </div>
    <div className={`font-body text-3xl font-bold ${score >= 0 ? 'text-green-500' : 'text-[#FF3B30]'}`}>
      {score > 0 ? '+' : ''}{score}
    </div>
  </div>
);

const ScalePan = ({ tiltAngle, isWinning, side }) => (
  <motion.div
    className={`absolute ${side === 'left' ? '-left-2' : '-right-2'} top-0 flex flex-col items-center`}
    style={TRANSFORM_ORIGIN}
    animate={{ rotate: -tiltAngle }}
  >
    <div className="w-0.5 h-6 bg-[#525252]" />
    <div className={`w-12 h-2 rounded-b-full ${isWinning ? 'bg-gradient-to-b from-[#FFD700] to-[#B8860B]' : 'bg-[#525252]'}`} />
  </motion.div>
);

const InteractiveScale = ({ rapper1, rapper2, events, currentEventIndex }) => {
  const { rapper1Score, rapper2Score, tiltAngle } = useMemo(() => {
    let r1 = 0;
    let r2 = 0;
    for (let i = 0; i <= currentEventIndex && i < events.length; i++) {
      r1 += events[i].impact_rapper1;
      r2 += events[i].impact_rapper2;
    }
    const diff = r1 - r2;
    return {
      rapper1Score: r1,
      rapper2Score: r2,
      tiltAngle: Math.max(-25, Math.min(25, diff * 2)),
    };
  }, [events, currentEventIndex]);

  const r1Winning = rapper1Score > rapper2Score;
  const r2Winning = rapper2Score > rapper1Score;

  return (
    <motion.div className="flex flex-col items-center py-4 mb-6" {...FADE_IN_UP}>
      <div className="flex items-center justify-center gap-12 mb-4">
        <ScoreDisplay name={rapper1?.name} score={rapper1Score} isWinning={r1Winning} />
        <div className="text-[#525252] font-heading text-2xl">VS</div>
        <ScoreDisplay name={rapper2?.name} score={rapper2Score} isWinning={r2Winning} />
      </div>

      <div className="text-[#A3A3A3] font-body text-xs uppercase tracking-widest mb-2">
        BALANCE OF POWER
      </div>

      <div className="relative w-full max-w-md h-24">
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-1 h-10 bg-gradient-to-t from-[#262626] to-[#525252]" />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-10 w-3 h-3 bg-[#FFD700] rotate-45" />

        <motion.div
          className="absolute left-1/2 -translate-x-1/2 bottom-14 w-64 h-1 bg-[#525252] origin-center flex items-center justify-between"
          animate={{ rotate: tiltAngle }}
          transition={SPRING_CONFIG}
          data-testid="scale-beam"
        >
          <ScalePan tiltAngle={tiltAngle} isWinning={r1Winning} side="left" />
          <ScalePan tiltAngle={tiltAngle} isWinning={r2Winning} side="right" />
          <div className="absolute left-1/2 -translate-x-1/2 -top-2">
            <Scale className="w-4 h-4 text-[#FFD700]" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default InteractiveScale;
