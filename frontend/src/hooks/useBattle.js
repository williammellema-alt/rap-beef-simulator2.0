import { useState, useCallback } from "react";
import axios from "axios";
import { playBattleStart, playProvocation, playNextRound, playScaleTilt, playVictory } from "../utils/sounds";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const INITIAL_STATE = {
  battleStarted: false,
  battleLoading: false,
  battleEvents: [],
  currentEventIndex: -1,
  damageReport: null,
  showDamageReport: false,
  battleComplete: false,
  provocation: null,
  showProvocation: false,
  error: null,
};

export const useBattle = ({ rapper1, rapper2, era1, era2, warZone, resetSelections }) => {
  const [state, setState] = useState(INITIAL_STATE);

  const patch = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const startBattle = useCallback(async () => {
    if (!rapper1 || !rapper2) {
      patch({ error: "Please select both rappers" });
      return;
    }
    if (rapper1.name === rapper2.name) {
      patch({ error: "A rapper can't beef with themselves!" });
      return;
    }

    patch({
      error: null,
      battleLoading: true,
      battleStarted: true,
      battleEvents: [],
      currentEventIndex: -1,
      damageReport: null,
      battleComplete: false,
      provocation: null,
      showProvocation: false,
    });
    playBattleStart();

    try {
      const response = await axios.post(`${API}/battle`, {
        rapper1: { name: rapper1.name, tier: rapper1.tier, era: era1 },
        rapper2: { name: rapper2.name, tier: rapper2.tier, era: era2 },
        war_zone: warZone,
      });

      patch({
        battleEvents: response.data.events,
        damageReport: response.data.damage_report,
        provocation: response.data.provocation,
        battleLoading: false,
        showProvocation: true,
      });
      playProvocation();
    } catch (e) {
      patch({
        error: e.response?.data?.detail || "Battle simulation failed",
        battleLoading: false,
        battleStarted: false,
      });
    }
  }, [rapper1, rapper2, era1, era2, warZone, patch]);

  const nextRound = useCallback(() => {
    if (state.showProvocation && state.currentEventIndex === -1) {
      patch({ currentEventIndex: 0 });
      playNextRound();
      playScaleTilt();
    } else if (state.currentEventIndex < state.battleEvents.length - 1) {
      patch({ currentEventIndex: state.currentEventIndex + 1 });
      playNextRound();
      playScaleTilt();
    } else {
      patch({ battleComplete: true, showDamageReport: true });
      playVictory();
    }
  }, [state.showProvocation, state.currentEventIndex, state.battleEvents.length, patch]);

  const resetBattle = useCallback(() => {
    setState(INITIAL_STATE);
    resetSelections();
  }, [resetSelections]);

  const viewStats = useCallback(() => patch({ showDamageReport: true }), [patch]);
  const closeDamageReport = useCallback(() => patch({ showDamageReport: false }), [patch]);

  return { ...state, startBattle, nextRound, resetBattle, viewStats, closeDamageReport };
};

export const useRappers = () => {
  const [rappers, setRappers] = useState([]);
  const [error, setError] = useState(null);

  const fetchRappers = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/rappers`);
      setRappers(response.data);
    } catch (_) {
      setError("Failed to load rappers list");
    }
  }, []);

  return { rappers, fetchError: error, fetchRappers };
};
