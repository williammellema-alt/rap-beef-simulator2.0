import { motion, AnimatePresence } from "framer-motion";
import { Crown, Users, Flame } from "lucide-react";

const TIMELINE_SPRING = { type: "spring", stiffness: 300, damping: 20, delay: 0.1 };
const ALLY_ANIM = { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 } };
const PROVOCATION_SPRING = { type: "spring", stiffness: 200, damping: 20 };
const EVENT_INITIAL = { opacity: 0, x: -20 };
const EVENT_ANIMATE = { opacity: 1, x: 0 };
const PROVOCATION_INITIAL = { opacity: 0, y: 30 };
const PROVOCATION_ANIMATE = { opacity: 1, y: 0 };

const cleanTrackName = (name) => name ? name.replace(/^["']+|["']+$/g, '') : '';

const AllyIntervention = ({ ally }) => (
  <motion.div
    {...ALLY_ANIM}
    className="mt-3 p-3 bg-[#FF3B30]/10 border border-[#FF3B30]/30 flex items-center gap-3"
  >
    <Users className="w-5 h-5 text-[#FF3B30]" />
    <div>
      <span className="text-[#FF3B30] font-body text-sm font-bold">{ally.name}</span>
      <span className="text-[#A3A3A3] font-body text-sm"> intervened with </span>
      <span className="text-[#FFD700] font-body text-sm">{ally.power}</span>
      <span className="text-[#A3A3A3] font-body text-sm"> helping </span>
      <span className="text-white font-body text-sm font-bold">{ally.helped}</span>
    </div>
  </motion.div>
);

const TimelineEvent = ({ event }) => (
  <motion.div
    key={`round-${event.round_number}`}
    initial={EVENT_INITIAL}
    animate={EVENT_ANIMATE}
    transition={TIMELINE_SPRING}
    className="relative mb-6 last:mb-0"
    data-testid={`timeline-event-${event.round_number - 1}`}
  >
    <div className="timeline-node" />
    <div className="ml-4 p-4 bg-[#1A1A1A] border border-[#262626] card-gritty">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="font-heading text-lg text-[#FF3B30] uppercase">
            Round {event.round_number}: {event.event_type}
          </span>
          {event.track_name && (
            <span className="ml-2 text-[#FFD700] font-body text-sm italic">
              "{cleanTrackName(event.track_name)}"
            </span>
          )}
        </div>
        <span className="text-[#FFD700] font-body text-sm uppercase flex items-center gap-1">
          <Crown className="w-4 h-4" />{event.winner}
        </span>
      </div>
      <p className="text-white font-body text-sm leading-relaxed mb-3">{event.description}</p>
      <div className="flex gap-4 text-sm font-body">
        <span className={event.impact_rapper1 >= 0 ? "impact-positive" : "impact-negative"}>
          {event.impact_rapper1 > 0 ? "+" : ""}{event.impact_rapper1}
        </span>
        <span className="text-[#525252]">vs</span>
        <span className={event.impact_rapper2 >= 0 ? "impact-positive" : "impact-negative"}>
          {event.impact_rapper2 > 0 ? "+" : ""}{event.impact_rapper2}
        </span>
      </div>
      {event.ally_intervention && <AllyIntervention ally={event.ally_intervention} />}
    </div>
  </motion.div>
);

export const BattleTimeline = ({ events, currentEventIndex }) => (
  <div className="relative pl-6 border-l border-[#262626]">
    <AnimatePresence>
      {events.slice(0, currentEventIndex + 1).map((event) => (
        <TimelineEvent key={`round-${event.round_number}`} event={event} />
      ))}
    </AnimatePresence>
  </div>
);

export const ProvocationRound = ({ provocation }) => (
  <motion.div
    initial={PROVOCATION_INITIAL}
    animate={PROVOCATION_ANIMATE}
    transition={PROVOCATION_SPRING}
    className="max-w-2xl mx-auto"
    data-testid="provocation-round"
  >
    <div className="p-6 bg-[#1A1A1A] border-2 border-[#FF3B30]/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#FF3B30]/5" />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <Flame className="w-6 h-6 text-[#FF3B30]" />
          <span className="font-heading text-xl text-[#FF3B30] uppercase">THE PROVOCATION</span>
          <span className="text-[#525252] font-body text-xs ml-auto uppercase">DOES NOT COUNT TOWARD SCORE</span>
        </div>
        {provocation.track_name && (
          <div className="text-[#FFD700] font-body text-sm italic mb-2">
            "{cleanTrackName(provocation.track_name)}"
          </div>
        )}
        <p className="text-white font-body text-sm leading-relaxed mb-3">{provocation.description}</p>
        <div className="text-[#A3A3A3] font-body text-xs uppercase">
          Instigated by: <span className="text-[#FFD700]">{provocation.instigator}</span>
        </div>
      </div>
    </div>
  </motion.div>
);
