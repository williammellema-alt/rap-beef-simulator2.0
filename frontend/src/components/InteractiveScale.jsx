import { useMemo } from "react";
import { motion } from "framer-motion";
import { Scale } from "lucide-react";

const SPRING_CONFIG = { type: "spring", stiffness: 100, damping: 15 };
const TRANSFORM_ORIGIN = { transformOrigin: "top center" };

const InteractiveScale = ({ rapper1, rapper2, events, currentEventIndex }) => {
  const { rapper1Score, rapper2Score, tiltAngle } = useMemo(() => {
    let r1 = 0;
    let r2 = 0;
    events.slice(0, currentEventIndex + 1).forEach(event => {
      r1 += event.impact_rapper1;
      r2 += event.impact_rapper2;
    });
    const diff = r1 - r2;
    const angle = Math.max(-25, Math.min(25, diff * 2));
    return { rapper1Score: r1, rapper2Score: r2, tiltAngle: angle };
  }, [events, currentEventIndex]);

  return (
    <motion.div 
      className="flex flex-col items-center py-4 mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Score Display - Above Scale */}
      <div className="flex items-center justify-center gap-12 mb-4">
        <div className="text-center">
          <div className={`font-heading text-xl uppercase ${rapper1Score > rapper2Score ? 'text-[#FFD700]' : 'text-[#A3A3A3]'}`}>
            {rapper1?.name || 'P1'}
          </div>
          <div className={`font-body text-3xl font-bold ${rapper1Score >= 0 ? 'text-green-500' : 'text-[#FF3B30]'}`}>
            {rapper1Score > 0 ? '+' : ''}{rapper1Score}
          </div>
        </div>
        
        <div className="text-[#525252] font-heading text-2xl">VS</div>
        
        <div className="text-center">
          <div className={`font-heading text-xl uppercase ${rapper2Score > rapper1Score ? 'text-[#FFD700]' : 'text-[#A3A3A3]'}`}>
            {rapper2?.name || 'P2'}
          </div>
          <div className={`font-body text-3xl font-bold ${rapper2Score >= 0 ? 'text-green-500' : 'text-[#FF3B30]'}`}>
            {rapper2Score > 0 ? '+' : ''}{rapper2Score}
          </div>
        </div>
      </div>

      <div className="text-[#A3A3A3] font-body text-xs uppercase tracking-widest mb-2">
        BALANCE OF POWER
      </div>
      
      {/* Scale Container - Compact */}
      <div className="relative w-full max-w-md h-24">
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-1 h-10 bg-gradient-to-t from-[#262626] to-[#525252]" />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-10 w-3 h-3 bg-[#FFD700] rotate-45" />
        
        <motion.div 
          className="absolute left-1/2 -translate-x-1/2 bottom-14 w-64 h-1 bg-[#525252] origin-center flex items-center justify-between"
          animate={{ rotate: tiltAngle }}
          transition={SPRING_CONFIG}
          data-testid="scale-beam"
        >
          <motion.div 
            className="absolute -left-2 top-0 flex flex-col items-center"
            style={TRANSFORM_ORIGIN}
            animate={{ rotate: -tiltAngle }}
          >
            <div className="w-0.5 h-6 bg-[#525252]" />
            <div className={`w-12 h-2 rounded-b-full ${rapper1Score > rapper2Score ? 'bg-gradient-to-b from-[#FFD700] to-[#B8860B]' : 'bg-[#525252]'}`} />
          </motion.div>
          
          <motion.div 
            className="absolute -right-2 top-0 flex flex-col items-center"
            style={TRANSFORM_ORIGIN}
            animate={{ rotate: -tiltAngle }}
          >
            <div className="w-0.5 h-6 bg-[#525252]" />
            <div className={`w-12 h-2 rounded-b-full ${rapper2Score > rapper1Score ? 'bg-gradient-to-b from-[#FFD700] to-[#B8860B]' : 'bg-[#525252]'}`} />
          </motion.div>
          
          <div className="absolute left-1/2 -translate-x-1/2 -top-2">
            <Scale className="w-4 h-4 text-[#FFD700]" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default InteractiveScale;
