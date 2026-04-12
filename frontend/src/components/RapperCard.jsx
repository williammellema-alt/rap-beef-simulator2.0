import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Swords } from "lucide-react";
import { Button } from "../components/ui/button";
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
import { TierBadge, getEraLabel } from "./battleHelpers";

const FADE_IN = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

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
      setRapper({ name: customRapper, tier: "B", default_era: 2020 });
      setEra(2020);
      setCustomRapper("");
    }
  };

  const primeMarkerLeft = useMemo(() => {
    if (!rapper) return null;
    return `calc(${((rapper.default_era - 1990) / (2025 - 1990)) * 100}% + 8px)`;
  }, [rapper]);

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
          <div className="slider-gold px-2 relative">
            {rapper && (
              <div 
                className="absolute -top-1 w-0.5 h-3 bg-[#FF3B30] z-10 pointer-events-none"
                style={{ left: primeMarkerLeft }}
                data-testid={`prime-marker-${side}`}
              >
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[#FF3B30] text-[10px] font-body whitespace-nowrap">
                  PRIME
                </div>
              </div>
            )}
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
          <motion.div {...FADE_IN} className="p-4 bg-[#1A1A1A] border border-[#262626]">
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

export default RapperCard;
