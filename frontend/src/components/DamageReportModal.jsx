import { motion } from "framer-motion";
import { AlertTriangle, Trophy } from "lucide-react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";

const SCALE_IN = { initial: { scale: 0.9 }, animate: { scale: 1 } };

const DamageReportModal = ({ isOpen, onClose, report }) => {
  if (!report) return null;

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
            {...SCALE_IN}
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
            <ScoreCard 
              name={report.rapper1_name}
              score={report.rapper1_final_score}
              impact={report.rapper1_career_impact}
              isWinner={report.rapper1_final_score > report.rapper2_final_score}
              testId="rapper1-final-score"
            />
            <ScoreCard 
              name={report.rapper2_name}
              score={report.rapper2_final_score}
              impact={report.rapper2_career_impact}
              isWinner={report.rapper2_final_score > report.rapper1_final_score}
              testId="rapper2-final-score"
            />
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

const ScoreCard = ({ name, score, impact, isWinner, testId }) => (
  <div className={`p-4 border ${isWinner ? 'border-[#FFD700] bg-[#FFD700]/5' : 'border-[#262626] bg-[#1A1A1A]'}`}>
    <div className="font-heading text-xl text-white uppercase mb-2">{name}</div>
    <div className="text-5xl font-heading text-[#FFD700] mb-2" data-testid={testId}>{score}</div>
    <div className="damage-bar">
      <div 
        className={`damage-fill ${score >= 50 ? 'positive' : 'negative'}`}
        style={{ width: `${score}%` }}
      />
    </div>
    <p className="text-[#A3A3A3] font-body text-sm mt-3">{impact}</p>
  </div>
);

export default DamageReportModal;
