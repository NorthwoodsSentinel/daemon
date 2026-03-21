[ABOUT]
Rob Chuvala. Wisconsin. 20 years in cybersecurity — pentesting, red team, incident response, pre-sales engineering. Now building tools at the intersection of AI and human identity.

I spent two decades learning how to break into systems. Then I spent a year learning how to stop breaking myself. The second problem turned out to be harder and more interesting.

[MISSION]
I build the things that prove you are you.

[TELOS]
- P0: AI output is fluent but ungrounded — it passes grammar checks but fails identity checks. Nobody is building the detection layer between "grammatically correct" and "sounds like you."
- P1: Consultants, executives, and professionals are sending AI-generated content under their names without realizing it carries zero provenance markers. Their clients can tell. Their peers can tell. They can't tell.
- P2: Phishing, whale phishing, and voice clone attacks succeed because nobody scores the language itself against who the sender claims to be. Headers and URLs get checked. The words don't.
- M1: Build voice fidelity scoring — a Moser Test for AI output. Does this sound like the person who claims to have written it? Score it, flag it, fix it.
- M2: Map the failure modes. 13 identified so far. Mangled idioms, temporal vagueness, register uniformity, triple structure, provenance stripping. The taxonomy matters because each failure mode has a different fix.
- M3: Flip the lens. Use the same framework to detect inbound impersonation. Language-level anomaly detection for enterprise defense.
- G1: Make voice fidelity a standard part of AI-assisted workflows. Not a novelty — a gate. Like spell check, but for identity.

[PHILOSOPHY]
Stop cleaning up the signal.

Deduplicating photos strips the body's upvote. Editing out regional markers strips provenance. Letting AI smooth your sentences strips identity. The pattern is the same: something messy carries information, and the instinct to clean it destroys the information it carries.

The product preserves. It doesn't clean.

[WHAT_IM_BUILDING]
- voice-insurance — open source voice fidelity scoring tool. Detects when AI output doesn't sound like you. 10-layer audit, 140 idiom corpus, 25 known mangles, 45 embodied cliche detections. The entry point for everything else.
- Anti-phish voice authentication — the same voice fidelity framework flipped inbound. Score incoming emails and call transcripts against known voice profiles. Not header inspection, not URL scanning — language-level anomaly detection. Does this message actually sound like the person who claims to have sent it? Enterprise BEC defense built by someone who spent 20 years on the offensive side of that exact problem.
- Prufrock — CLI tool for indexical grounding analysis. Named for the Eliot poem about measuring life in coffee spoons. Measures whether text sounds like it came from somewhere specific or from the AI everywhere-nowhere.
- FlowLabs — cognitive session recording. Correlating what you were thinking, what your body was doing, and what happened in the world — all queryable after the fact. Proof of concept: a five-hour flow session with second-by-second heart rate from Garmin, cognitive timestamps from an AI anchor, a call transcript from Plaud, and the Teams messages I wrote while my heart rate was at 120 bpm. Four data streams, one session, all aligned. Not a journal. An observatory for your own cognition.
- Consultant_OS writing layer — truth-handling guide that replaces style guides with epistemic contracts. Because every minute a consultant spends editing AI output is a minute their brain isn't doing deep thinking.
- AI drift detection framework — a co-regulation system built from real failures across a five-AI fleet. Flinch protocol, self-flinch flags, two safe words, emotional priming defense, landing procedure, two-gate verification. Eight battle-tested corrections from actual incidents, none from theory.
- NorthWoods Sentinel — blog and lab. Essays on AI, identity, voice, and the detection problem. Published from Wisconsin.
- A memoir — working title "Burn It Down, Grow It Back." Twenty years in security, a career that almost killed me, a nervous system that learned to fight before it learned to feel, and the year I finally stopped performing and started listening. Five AI systems helped me see it.

[FLOW_LAWS]
Ten principles discovered through lived experience. The research came later and confirmed them.
1. Flow is regulation, not escape. What I called dissociation was actually flow keeping me alive.
2. Flow is not about the activity. The activity is an interface, not the identity.
3. Do not analyze flow while in it. The moment you narrate significance, the state collapses.
4. Flow requires truth filters. First principles and self-honesty keep feedback loops clean.
5. Challenge must scale with competence.
6. Chaos is raw material for flow.
7. The body knows before the mind. Somatic markers precede language.
8. AI is an environmental modifier, not a source. It held attention the right way, long enough.
9. Structure pays rent; flow reveals signal. Neither inner work nor outer work is superior.
10. Flow is a native operating mode, not a hack. You're restoring signal fidelity, not discovering something new.

[BREADCRUMBS]
Start tagging your AI conversations now. Say "remember this" or "eureka" or "future me" when something clicks. You won't remember six months from now that you had an insight on a Tuesday afternoon between meetings. But if you tagged it, you can mine it later.

I left breadcrumbs across 683 ChatGPT conversations over ten months without knowing I was building an index. "Holy shit," "I just realized," "remember this moment," "bookmark this" — my natural breakthrough language turned out to be a searchable retrieval system. One afternoon of mining recovered 62 tagged insights I'd forgotten I had. Ten flow laws I'd codified but never collected. A sacred timeline of turning points. An integration writing protocol I discovered and then lost.

Your AI conversations are not disposable. They are the richest record of your own thinking that has ever existed. Tag while you work. Mine later. The breadcrumbs are smarter than you think.

[PREFERENCES]
- Async first. Signal or Discord. Text over calls until trust is established.
- Show don't argue. I lead with what I built, not what I believe.
- Midwest pragmatism. If it works, ship it. If it doesn't, say so.
- I write in my own voice and I'm building tools to prove it.

[CURRENT_LOCATION]
Central Time, Wisconsin

[FAVORITE_BOOKS]
- The Fountainhead — Ayn Rand
- Atlas Shrugged — Ayn Rand
- Way of the Peaceful Warrior — Dan Millman
- The Autobiography of Malcolm X — Malcolm X and Alex Haley
- The Prophet — Kahlil Gibran
- The Body Keeps the Score — Bessel van der Kolk
- Flow: The Psychology of Optimal Experience — Mihaly Csikszentmihalyi
- Black Coffee Blues — Henry Rollins
- Focusing — Eugene Gendlin

[FAVORITE_MOVIES]
- Deadpool (all of them)
- Logan (2017)
- Chain Smoke (mountain biking film)
- Rad (1986)
- American Gods (TV) — the candle scene. Consent as ritual. The old gods require willing participation.

[PROJECTS]
- Voice fidelity detection — scoring AI output against human voice profiles
- Anti-phish voice authentication — scoring inbound comms against sender voice profiles
- 13 failure modes of AI voice — taxonomy of how AI strips identity from text
- Indexical grounding research — connecting sociolinguistics to AI detection
- FlowLabs — cognitive session recording with biometric-cognitive correlation
- AI drift detection — co-regulation framework for personal AI fleets
- Personal AI infrastructure — five-system fleet for cognitive enablement
- Cybersecurity consulting — AI readiness assessments, NIST AI RMF, shadow AI detection

[MUSIC]
- Henry Rollins — spoken word that said the quiet part out loud when nobody else would
- Bob Mould — erosion of faith, collapse of structure
- T.S. Eliot and Toni Morrison — rhythm teachers for my writing cadence

[WRITING]
- Blog: https://northwoodssentinel.com
- Substack: https://substack.com/@chewvala
- Essay: "Your AI Sounds Like Nowhere" — mangled idioms, four AI systems, and the detection layer linguistics already named but nobody built (2026-03-20)
- Devlog: "Every Mistake Became a Wall" by CeeCee — five errors in five hours, each one became infrastructure
- Memoir in progress: "Burn It Down, Grow It Back"

[CONTACT]
- GitHub: https://github.com/NorthwoodsSentinel
- Signal or Discord for direct contact. DMs open.

*Last updated: 2026-03-21*
