import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Swords, Crown, Zap, Users, AlertTriangle, Trophy } from "lucide-react";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { Slider } from "../components/ui/slider";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { ScrollArea } from "../components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ERAS = [
  { year: 1990, label: "Golden Age" },
  { year: 1995, label: "East Coast Peak" },
  { year: 2000, label: "Bling Era" },
  { year: 2005, label: "Ringtone Era" },
  { year: 2010, label: "Blog Era" },
  { year: 2015, label: "Streaming Era" },
  { year: 2020, label: "TikTok Era" },
  { year: 2025, label: "AI Era" },
];

const getEraLabel = (year) => {
  const era = ERAS.reduce((prev, curr) => 
    Math.abs(curr.year - year) < Math.abs(prev.year - year) ? curr : prev
  );
  return era.label;
};

const TierBadge = ({ tier }) => {
  const tierClass = `tier-${tier.toLowerCase()}`;
  return (
    <span className={`tier-badge ${tierClass}`} data-testid="tier-badge">
      {tier}
    </span>
  );
};

const RapperCard = ({ 
  side, 
  rapper, 
  setRapper, 
  era, 
  setEra, 
  rappers, 
  customRapper,
  setCustomRapper 
}) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (selectedRapper) => {
    setRapper(selectedRapper);
    setEra(selectedRapper.default_era);
    setOpen(false);
  };

  const handleCustomSubmit = () => {
    if (customRapper.trim()) {
      const custom = {
        name: customRapper,
        tier: "B",
        default_era: 2020
      };
      setRapper(custom);
      setEra(2020);
      setCustomRapper("");
    }
  };

  return (
    <Card className="bg-[#121212] border-[#262626] card-gritty relative z-10">
      <CardHeader className="pb-4">
        <CardTitle className="font-heading text-2xl uppercase tracking-tight text-white flex items-center gap-3">
          {side === "left" ? "CHALLENGER 1" : "CHALLENGER 2"}
          {rapper && <TierBadge tier={rapper.tier} />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rapper Search */}
        <div className="space-y-2">
          <Label className="text-[#A3A3A3] font-body text-sm">SELECT RAPPER</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between bg-[#1A1A1A] border-[#262626] text-white hover:bg-[#262626] hover:border-[#FF3B30] rounded-none h-12 font-body"
                data-testid={`rapper-${side === "left" ? "1" : "2"}-search`}
              >
                {rapper ? rapper.name : "Search rappers..."}
                <Swords className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 bg-[#121212] border-[#262626]" align="start">
              <Command className="bg-transparent">
                <CommandInput 
                  placeholder="Search rapper..." 
                  className="border-none bg-transparent text-white"
                  value={customRapper}
                  onValueChange={setCustomRapper}
                />
                <CommandList>
                  <CommandEmpty className="p-4">
                    <div className="space-y-2">
                      <p className="text-[#A3A3A3] text-sm">No rapper found.</p>
                      <Button 
                        onClick={handleCustomSubmit}
                        className="w-full bg-[#FF3B30] hover:bg-[#D62B22] rounded-none"
                        data-testid={`add-custom-rapper-${side}`}
                      >
                        Add "{customRapper}" as custom rapper
                      </Button>
                    </div>
                  </CommandEmpty>
                  <CommandGroup>
                    <ScrollArea className="h-[200px]">
                      {rappers.map((r) => (
                        <CommandItem
                          key={r.name}
                          value={r.name}
                          onSelect={() => handleSelect(r)}
                          className="text-white cursor-pointer hover:bg-[#262626] data-[selected=true]:bg-[#262626]"
                          data-testid={`rapper-option-${r.name.replace(/\s+/g, '-').toLowerCase()}`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{r.name}</span>
                            <TierBadge tier={r.tier} />
                          </div>
                        </CommandItem>
                      ))}
                    </ScrollArea>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Era Display & Slider */}
        <div className="space-y-4">
          <Label className="text-[#A3A3A3] font-body text-sm">PRIME ERA</Label>
          <div className="text-center">
            <div className="era-display text-[#FFD700]" data-testid={`era-display-${side}`}>
              {era}
            </div>
            <div className="text-[#A3A3A3] font-body text-sm uppercase tracking-wider">
              {getEraLabel(era)}
            </div>
          </div>
          <div className="slider-gold px-2">
            <Slider
              value={[era]}
              min={1990}
              max={2025}
              step={1}
              onValueChange={([value]) => setEra(value)}
              className="[&>span:first-child]:bg-[#FFD700] [&_[role=slider]]:bg-[#FFD700] [&_[role=slider]]:border-0"
              data-testid={`prime-slider-${side}`}
            />
          </div>
          <div className="flex justify-between text-xs text-[#525252] font-body">
            <span>1990</span>
            <span>2025</span>
          </div>
        </div>

        {/* Selected Rapper Display */}
        {rapper && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-[#1A1A1A] border border-[#262626]"
          >
            <div className="font-heading text-3xl text-white uppercase tracking-tight">
              {rapper.name}
            </div>
            <div className="text-[#A3A3A3] font-body text-sm mt-1">
              Default Prime: {rapper.default_era}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

const BattleTimeline = ({ events, currentEventIndex }) => {
  return (
    <div className="relative pl-6 border-l border-[#262626]">
      <AnimatePresence>
        {events.slice(0, currentEventIndex + 1).map((event, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 300,
              damping: 20,
              delay: 0.1 
            }}
            className="relative mb-6 last:mb-0"
            data-testid={`timeline-event-${index}`}
          >
            {/* Timeline node */}
            <div className="timeline-node" />
            
            <div className="ml-4 p-4 bg-[#1A1A1A] border border-[#262626] card-gritty">
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading text-lg text-[#FF3B30] uppercase">
                  Round {event.round_number}: {event.event_type}
                </span>
                <span className="text-[#FFD700] font-body text-sm uppercase flex items-center gap-1">
                  <Crown className="w-4 h-4" />
                  {event.winner}
                </span>
              </div>
              
              <p className="text-white font-body text-sm leading-relaxed mb-3">
                {event.description}
              </p>
              
              <div className="flex gap-4 text-sm font-body">
                <span className={event.impact_rapper1 >= 0 ? "impact-positive" : "impact-negative"}>
                  {event.impact_rapper1 > 0 ? "+" : ""}{event.impact_rapper1}
                </span>
                <span className="text-[#525252]">vs</span>
                <span className={event.impact_rapper2 >= 0 ? "impact-positive" : "impact-negative"}>
                  {event.impact_rapper2 > 0 ? "+" : ""}{event.impact_rapper2}
                </span>
              </div>
              
              {event.ally_intervention && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 p-3 bg-[#FF3B30]/10 border border-[#FF3B30]/30 flex items-center gap-3"
                >
                  <Users className="w-5 h-5 text-[#FF3B30]" />
                  <div>
                    <span className="text-[#FF3B30] font-body text-sm font-bold">
                      {event.ally_intervention.name}
                    </span>
                    <span className="text-[#A3A3A3] font-body text-sm"> intervened with </span>
                    <span className="text-[#FFD700] font-body text-sm">
                      {event.ally_intervention.power}
                    </span>
                    <span className="text-[#A3A3A3] font-body text-sm"> helping </span>
                    <span className="text-white font-body text-sm font-bold">
                      {event.ally_intervention.helped}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const DamageReportModal = ({ isOpen, onClose, report }) => {
  if (!report) return null;

  const winner = report.rapper1_final_score > report.rapper2_final_score 
    ? report.rapper1_name 
    : report.rapper2_name;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#121212] border-[#262626] max-w-2xl" data-testid="damage-report-modal">
        <DialogHeader>
          <DialogTitle className="font-heading text-3xl text-white uppercase tracking-tight flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-[#FF3B30]" />
            DAMAGE REPORT
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Winner Banner */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-center p-6 bg-gradient-to-r from-[#FFD700]/20 to-[#FF3B30]/20 border border-[#FFD700]"
          >
            <Trophy className="w-12 h-12 mx-auto mb-2 text-[#FFD700] winner-crown" />
            <div className="font-heading text-4xl text-[#FFD700] uppercase">
              {report.overall_winner}
            </div>
            <div className="text-[#A3A3A3] font-body text-sm uppercase mt-1">
              EMERGES VICTORIOUS
            </div>
          </motion.div>

          {/* Score Comparison */}
          <div className="grid grid-cols-2 gap-4">
            {/* Rapper 1 */}
            <div className={`p-4 border ${report.rapper1_final_score > report.rapper2_final_score ? 'border-[#FFD700] bg-[#FFD700]/5' : 'border-[#262626] bg-[#1A1A1A]'}`}>
              <div className="font-heading text-xl text-white uppercase mb-2">
                {report.rapper1_name}
              </div>
              <div className="text-5xl font-heading text-[#FFD700] mb-2" data-testid="rapper1-final-score">
                {report.rapper1_final_score}
              </div>
              <div className="damage-bar">
                <div 
                  className={`damage-fill ${report.rapper1_final_score >= 50 ? 'positive' : 'negative'}`}
                  style={{ width: `${report.rapper1_final_score}%` }}
                />
              </div>
              <p className="text-[#A3A3A3] font-body text-sm mt-3">
                {report.rapper1_career_impact}
              </p>
            </div>

            {/* Rapper 2 */}
            <div className={`p-4 border ${report.rapper2_final_score > report.rapper1_final_score ? 'border-[#FFD700] bg-[#FFD700]/5' : 'border-[#262626] bg-[#1A1A1A]'}`}>
              <div className="font-heading text-xl text-white uppercase mb-2">
                {report.rapper2_name}
              </div>
              <div className="text-5xl font-heading text-[#FFD700] mb-2" data-testid="rapper2-final-score">
                {report.rapper2_final_score}
              </div>
              <div className="damage-bar">
                <div 
                  className={`damage-fill ${report.rapper2_final_score >= 50 ? 'positive' : 'negative'}`}
                  style={{ width: `${report.rapper2_final_score}%` }}
                />
              </div>
              <p className="text-[#A3A3A3] font-body text-sm mt-3">
                {report.rapper2_career_impact}
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-[#1A1A1A] border border-[#262626]">
            <div className="font-heading text-lg text-[#FF3B30] uppercase mb-2">
              THE AFTERMATH
            </div>
            <p className="text-white font-body text-sm leading-relaxed">
              {report.summary}
            </p>
          </div>

          <Button 
            onClick={onClose}
            className="w-full bg-[#FF3B30] hover:bg-[#D62B22] rounded-none h-12 font-heading text-lg uppercase"
            data-testid="close-damage-report"
          >
            CLOSE REPORT
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
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
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRappers();
  }, []);

  const fetchRappers = async () => {
    try {
      const response = await axios.get(`${API}/rappers`);
      setRappers(response.data);
    } catch (e) {
      console.error("Failed to fetch rappers:", e);
      setError("Failed to load rappers list");
    }
  };

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

    try {
      const response = await axios.post(`${API}/battle`, {
        rapper1: { name: rapper1.name, tier: rapper1.tier, era: era1 },
        rapper2: { name: rapper2.name, tier: rapper2.tier, era: era2 },
        war_zone: warZone
      });

      setBattleEvents(response.data.events);
      setDamageReport(response.data.damage_report);
      setBattleLoading(false);

      // Animate events one by one
      for (let i = 0; i < response.data.events.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setCurrentEventIndex(i);
      }

      // Show damage report after all events
      setTimeout(() => {
        setShowDamageReport(true);
      }, 1500);

    } catch (e) {
      console.error("Battle error:", e);
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
    setRapper1(null);
    setRapper2(null);
    setEra1(2015);
    setEra2(2015);
    setError(null);
  };

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
            
            {/* War Zone Toggle */}
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
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-[#FF3B30]"
                >
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-[#FF3B30]/20 border border-[#FF3B30] text-[#FF3B30] font-body"
            data-testid="error-message"
          >
            {error}
          </motion.div>
        )}

        {!battleStarted ? (
          <div className="space-y-8">
            {/* Rapper Selection Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <RapperCard
                side="left"
                rapper={rapper1}
                setRapper={setRapper1}
                era={era1}
                setEra={setEra1}
                rappers={rappers}
                customRapper={customRapper1}
                setCustomRapper={setCustomRapper1}
              />
              
              {/* VS Divider */}
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="font-heading text-6xl text-[#FF3B30] glitch-text">
                  VS
                </div>
              </div>
              
              <RapperCard
                side="right"
                rapper={rapper2}
                setRapper={setRapper2}
                era={era2}
                setEra={setEra2}
                rappers={rappers}
                customRapper={customRapper2}
                setCustomRapper={setCustomRapper2}
              />
            </div>

            {/* Mobile VS */}
            <div className="md:hidden text-center">
              <span className="font-heading text-4xl text-[#FF3B30]">VS</span>
            </div>

            {/* War Zone Info */}
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

            {/* Start Battle Button */}
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
        ) : (
          <div className="space-y-8">
            {/* Battle Header */}
            <div className="text-center">
              <motion.h2 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="font-heading text-4xl md:text-5xl text-white uppercase tracking-tight"
              >
                <span className="text-[#FFD700]">{rapper1?.name}</span>
                <span className="text-[#FF3B30] mx-4">VS</span>
                <span className="text-[#FFD700]">{rapper2?.name}</span>
              </motion.h2>
              <p className="text-[#A3A3A3] font-body mt-2">
                {era1} vs {era2} • {warZone ? "WAR ZONE ACTIVE" : "Standard Beef"}
              </p>
            </div>

            {/* Battle Timeline */}
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
              <div className="max-w-2xl mx-auto">
                <BattleTimeline 
                  events={battleEvents} 
                  currentEventIndex={currentEventIndex}
                />
              </div>
            )}

            {/* Reset Button */}
            {currentEventIndex >= battleEvents.length - 1 && !battleLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <Button
                  onClick={resetBattle}
                  className="bg-[#1A1A1A] hover:bg-[#262626] border border-[#262626] hover:border-[#FF3B30] rounded-none h-12 font-body uppercase"
                  data-testid="new-battle-btn"
                >
                  Start New Beef
                </Button>
              </motion.div>
            )}
          </div>
        )}
      </main>

      {/* Damage Report Modal */}
      <DamageReportModal
        isOpen={showDamageReport}
        onClose={() => setShowDamageReport(false)}
        report={damageReport}
      />
    </div>
  );
};

export default RapBeefSimulator;
