import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Scale, Swords, Zap, AlertTriangle, Trophy } from "lucide-react";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { playScaleTilt, playBattleStart, playNextRound, playVictory, playProvocation } from "../utils/sounds";
import RapperCard from "../components/RapperCard";
import InteractiveScale from "../components/InteractiveScale";
import { BattleTimeline, ProvocationRound } from "../components/BattleTimeline";
import DamageReportModal from "../components/DamageReportModal";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FADE_DOWN = { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 } };
const SCALE_IN = { initial: { scale: 0.9 }, animate: { scale: 1 } };
const FADE_SCALE = { initial: { opacity: 0, scale: 0 }, animate: { opacity: 1, scale: 1 } };

const NextRoundButtonContent = ({ currentEventIndex, totalRounds }) => {
  if (currentEventIndex === -1) {
    return <><Swords className="w-5 h-5 mr-2" />BEGIN ROUND 1</>;
  }
  if (currentEventIndex < totalRounds - 1) {
    return <><Zap className="w-5 h-5 mr-2" />NEXT ROUND ({currentEventIndex + 2}/{totalRounds})</>;
  }
  return <><Trophy className="w-5 h-5 mr-2" />VIEW FINAL RESULTS</>;
};

const RapBeefSimulator = () => {
  const [rappers, setRappers] = useState([]);
  const [rapper1, setRapper1] = useState(null);
  const [rapper2, setRapper2] = useState(null);
  const [era1, setEra1] = useState(2015);
  const [era2, setEra2] = useState(2015);
  const [customRapper1, setCustomRapper1] = useState("");
  const [customRapper2, setCustomRapper2] = useState("");
  const [warZone, setWarZone] = useState(false);
  const [battleStarted, setBattleStarted] = useState(false);
  const [battleLoading, setBattleLoading] = useState(false);
  const [battleEvents, setBattleEvents] = useState([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(-1);
  const [damageReport, setDamageReport] = useState(null);
  const [showDamageReport, setShowDamageReport] = useState(false);
  const [battleComplete, setBattleComplete] = useState(false);
  const [provocation, setProvocation] = useState(null);
  const [showProvocation, setShowProvocation] = useState(false);
  const [error, setError] = useState(null);

  const fetchRappers = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/rappers`);
      setRappers(response.data);
    } catch (e) {
      setError("Failed to load rappers list");
    }
  }, []);

  useEffect(() => {
    fetchRappers();
  }, [fetchRappers]);

  const startBattle = async () => {
    if (!rapper1 || !rapper2) {
      setError("Please select both rappers");
      return;
    }
    if (rapper1.name === rapper2.name) {
      setError("A rapper can't beef with themselves!");
      return;
    }

    setError(null);
    setBattleLoading(true);
    setBattleStarted(true);
    setBattleEvents([]);
    setCurrentEventIndex(-1);
    setDamageReport(null);
    setBattleComplete(false);
    setProvocation(null);
    setShowProvocation(false);
    playBattleStart();

    try {
      const response = await axios.post(`${API}/battle`, {
        rapper1: { name: rapper1.name, tier: rapper1.tier, era: era1 },
        rapper2: { name: rapper2.name, tier: rapper2.tier, era: era2 },
        war_zone: warZone
      });

      setBattleEvents(response.data.events);
      setDamageReport(response.data.damage_report);
      setProvocation(response.data.provocation);
      setBattleLoading(false);
      setShowProvocation(true);
      playProvocation();
    } catch (e) {
      setError(e.response?.data?.detail || "Battle simulation failed");
      setBattleLoading(false);
      setBattleStarted(false);
    }
  };

  const resetBattle = () => {
    setBattleStarted(false);
    setBattleEvents([]);
    setCurrentEventIndex(-1);
    setDamageReport(null);
    setShowDamageReport(false);
    setBattleComplete(false);
    setProvocation(null);
    setShowProvocation(false);
    setRapper1(null);
    setRapper2(null);
    setEra1(2015);
    setEra2(2015);
    setError(null);
  };

  const nextRound = () => {
    if (showProvocation && currentEventIndex === -1) {
      setCurrentEventIndex(0);
      playNextRound();
      playScaleTilt();
    } else if (currentEventIndex < battleEvents.length - 1) {
      setCurrentEventIndex(prev => prev + 1);
      playNextRound();
      playScaleTilt();
    } else {
      setBattleComplete(true);
      setShowDamageReport(true);
      playVictory();
    }
  };

  const viewStats = () => setShowDamageReport(true);

  return (
    <div className={`min-h-screen gritty-bg ${warZone ? 'war-zone-active scanlines' : ''}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Scale className="w-8 h-8 text-[#FF3B30]" strokeWidth={1.5} data-testid="scales-icon" />
              <h1 className="font-heading text-3xl md:text-4xl text-white uppercase tracking-tight">
                THE RAP BEEF SIMULATOR
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Label 
                htmlFor="war-zone" 
                className={`font-body text-sm uppercase ${warZone ? 'text-[#FF3B30]' : 'text-[#A3A3A3]'}`}
              >
                WAR ZONE
              </Label>
              <Switch
                id="war-zone"
                checked={warZone}
                onCheckedChange={setWarZone}
                className={`switch-war-zone ${warZone ? 'bg-[#FF3B30]' : ''}`}
                data-testid="war-zone-toggle"
              />
              {warZone && (
                <motion.span {...FADE_SCALE} className="text-[#FF3B30]">
                  <Zap className="w-5 h-5" />
                </motion.span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 relative z-10">
        {error && (
          <motion.div
            {...FADE_DOWN}
            className="mb-6 p-4 bg-[#FF3B30]/20 border border-[#FF3B30] text-[#FF3B30] font-body"
            data-testid="error-message"
          >
            {error}
          </motion.div>
        )}

        {!battleStarted ? (
          <SelectionPhase
            rapper1={rapper1} setRapper1={setRapper1}
            rapper2={rapper2} setRapper2={setRapper2}
            era1={era1} setEra1={setEra1}
            era2={era2} setEra2={setEra2}
            customRapper1={customRapper1} setCustomRapper1={setCustomRapper1}
            customRapper2={customRapper2} setCustomRapper2={setCustomRapper2}
            rappers={rappers} warZone={warZone}
            startBattle={startBattle}
          />
        ) : (
          <BattlePhase
            rapper1={rapper1} rapper2={rapper2}
            era1={era1} era2={era2}
            warZone={warZone}
            battleLoading={battleLoading}
            battleEvents={battleEvents}
            currentEventIndex={currentEventIndex}
            provocation={provocation}
            showProvocation={showProvocation}
            battleComplete={battleComplete}
            nextRound={nextRound}
            viewStats={viewStats}
            resetBattle={resetBattle}
          />
        )}
      </main>

      <DamageReportModal
        isOpen={showDamageReport}
        onClose={() => setShowDamageReport(false)}
        report={damageReport}
      />
    </div>
  );
};

const SelectionPhase = ({
  rapper1, setRapper1, rapper2, setRapper2,
  era1, setEra1, era2, setEra2,
  customRapper1, setCustomRapper1, customRapper2, setCustomRapper2,
  rappers, warZone, startBattle
}) => (
  <div className="space-y-8">
    <div className="grid md:grid-cols-2 gap-6">
      <RapperCard
        side="left" rapper={rapper1} setRapper={setRapper1}
        era={era1} setEra={setEra1} rappers={rappers}
        customRapper={customRapper1} setCustomRapper={setCustomRapper1}
      />
      
      <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="font-heading text-6xl text-[#FF3B30] glitch-text">VS</div>
      </div>
      
      <RapperCard
        side="right" rapper={rapper2} setRapper={setRapper2}
        era={era2} setEra={setEra2} rappers={rappers}
        customRapper={customRapper2} setCustomRapper={setCustomRapper2}
      />
    </div>

    <div className="md:hidden text-center">
      <span className="font-heading text-4xl text-[#FF3B30]">VS</span>
    </div>

    {warZone && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        className="p-4 bg-[#FF3B30]/10 border border-[#FF3B30]/30 text-center"
      >
        <div className="flex items-center justify-center gap-2 text-[#FF3B30] font-heading text-lg uppercase">
          <AlertTriangle className="w-5 h-5" />
          WAR ZONE ACTIVATED
        </div>
        <p className="text-[#A3A3A3] font-body text-sm mt-2">
          Random allies may intervene during the beef!
        </p>
      </motion.div>
    )}

    <Button
      onClick={startBattle}
      disabled={!rapper1 || !rapper2}
      className="w-full h-16 bg-[#FF3B30] hover:bg-[#D62B22] disabled:bg-[#262626] disabled:text-[#525252] rounded-none font-heading text-2xl uppercase tracking-tight"
      data-testid="start-battle-btn"
    >
      <Swords className="w-6 h-6 mr-3" />
      START THE BEEF
    </Button>
  </div>
);

const BattlePhase = ({
  rapper1, rapper2, era1, era2, warZone,
  battleLoading, battleEvents, currentEventIndex,
  provocation, showProvocation, battleComplete,
  nextRound, viewStats, resetBattle
}) => (
  <div className="space-y-8">
    <div className="text-center">
      <motion.h2 
        {...SCALE_IN}
        className="font-heading text-4xl md:text-5xl text-white uppercase tracking-tight"
      >
        <span className="text-[#FFD700]">{rapper1?.name}</span>
        <span className="text-[#FF3B30] mx-4">VS</span>
        <span className="text-[#FFD700]">{rapper2?.name}</span>
      </motion.h2>
      <p className="text-[#A3A3A3] font-body mt-2">
        {era1} vs {era2} {warZone ? "WAR ZONE ACTIVE" : "Standard Beef"}
      </p>
    </div>

    {battleLoading ? (
      <div className="text-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 mx-auto border-4 border-[#FF3B30] border-t-transparent rounded-full"
        />
        <p className="text-[#A3A3A3] font-body mt-4">Generating epic beef...</p>
      </div>
    ) : (
      <>
        {currentEventIndex >= 0 && (
          <InteractiveScale 
            rapper1={rapper1} rapper2={rapper2}
            events={battleEvents} currentEventIndex={currentEventIndex}
          />
        )}

        {showProvocation && provocation && currentEventIndex === -1 && (
          <ProvocationRound provocation={provocation} />
        )}

        {currentEventIndex >= 0 && (
          <div className="max-w-2xl mx-auto">
            <BattleTimeline events={battleEvents} currentEventIndex={currentEventIndex} />
          </div>
        )}

        <div className="flex justify-center gap-4 mt-8">
          {!battleComplete ? (
            <Button
              onClick={nextRound}
              className="bg-[#FF3B30] hover:bg-[#D62B22] rounded-none h-14 px-8 font-heading text-xl uppercase"
              data-testid="next-round-btn"
            >
              <NextRoundButtonContent 
                currentEventIndex={currentEventIndex} 
                totalRounds={battleEvents.length} 
              />
            </Button>
          ) : (
            <>
              <Button
                onClick={viewStats}
                className="bg-[#FFD700] hover:bg-[#DAA520] text-black rounded-none h-12 px-6 font-heading text-lg uppercase"
                data-testid="view-stats-btn"
              >
                <Trophy className="w-5 h-5 mr-2" />
                VIEW STATS
              </Button>
              <Button
                onClick={resetBattle}
                className="bg-[#1A1A1A] hover:bg-[#262626] border border-[#262626] hover:border-[#FF3B30] rounded-none h-12 px-6 font-body uppercase"
                data-testid="new-battle-btn"
              >
                NEW BEEF
              </Button>
            </>
          )}
        </div>
      </>
    )}
  </div>
);

export default RapBeefSimulator;
