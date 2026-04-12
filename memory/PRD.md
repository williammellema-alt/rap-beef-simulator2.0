# The Rap Beef Simulator - PRD

## Problem Statement
Build a React web app called 'The Rap Beef Simulator' with rapper search, Prime Sliders, War Zone toggle, AI-powered battle timeline, and Damage Report.

## Architecture
- **Frontend**: React + Tailwind + Shadcn UI + Framer Motion
- **Backend**: FastAPI + MongoDB + emergentintegrations (OpenAI GPT-5.2)
- **Design**: Dark/gritty hip-hop aesthetic (Anton + JetBrains Mono fonts)

## What's Been Implemented
- Rapper selection (26 predefined + custom input) with search autocomplete
- Prime Slider with red PRIME marker at default era
- War Zone toggle with ally interventions
- Provocation round (inciting incident, doesn't count toward score)
- 5-round battle with Next Round manual progression
- Interactive tilting Scale of Justice (balance of power)
- Diss track names per round
- Non-alternating winner patterns (secrets-based randomization)
- Sound effects via Web Audio API (battle start, round advance, scale tilt, victory, provocation)
- Damage Report modal with career impact scores
- View Stats button to re-access report
- Code quality refactor: components split into RapperCard, InteractiveScale, BattleTimeline, DamageReportModal, battleHelpers

## Code Quality Fixes Applied (Apr 2026)
- Fixed useEffect missing dependency (useCallback for fetchRappers)
- Fixed use-toast.js hook dependency
- Broke 385-line monolithic component into 6 focused files
- Extracted backend battle logic into helper functions
- Replaced `random` with `secrets` module
- Replaced array index keys with stable `round_number` keys
- Extracted inline animation objects to constants (useMemo where needed)
- Added dev-only error logging in catch blocks
- Removed production console statements
- Added type hints to backend functions
- Replaced nested ternary with NextRoundButtonContent component

## Backlog
- P1: Battle history page
- P1: Social sharing (shareable battle cards)
- P2: Rapper profile pages with stats
- P2: Leaderboard / win rates
