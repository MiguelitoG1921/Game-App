"use client";

import { useEffect, useRef, useState } from "react";

type NeedState = {
  hunger: number;
  sleep: number;
  food: number;
  minutes: number;
  day: number;
  activity: "gathering" | "eating" | "sleeping";
  activityLeft: number;
};

const STARTING_STATE: NeedState = {
  hunger: 28,
  sleep: 18,
  food: 9,
  minutes: 8 * 60 + 20,
  day: 1,
  activity: "gathering",
  activityLeft: 0,
};

const clamp = (value: number) => Math.max(0, Math.min(100, value));

function clockLabel(minutes: number) {
  const hours = Math.floor(minutes / 60) % 24;
  const remainder = minutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 || 12;
  return `${hour}:${String(remainder).padStart(2, "0")} ${period}`;
}

function Icon({ name, size = 18 }: { name: "leaf" | "food" | "moon" | "sun" | "pause" | "play" | "reset" | "spark" | "chevron"; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  if (name === "leaf") return <svg {...common}><path d="M20.5 3.5C13 3.4 6.1 4.8 4 10c-1.7 4.1 1 7.4 4.6 7.2C15 16.8 18.4 10.8 20.5 3.5Z"/><path d="M3 21c3.4-5.7 7.3-8.7 13-11.5"/></svg>;
  if (name === "food") return <svg {...common}><path d="M4 13.5h16l-1.6 6H5.6L4 13.5Z"/><path d="M6.2 10.5c.8-1.9 2.1-2.8 3.8-2.8 1.1-2.4 4.1-2.2 5 0 1.5-.3 2.7.7 2.9 2.8"/><path d="M8 3.7v1.5m4-2.7v1.7m4-1v1.5"/></svg>;
  if (name === "moon") return <svg {...common}><path d="M20.3 15.2A8.3 8.3 0 0 1 8.8 3.7 8.5 8.5 0 1 0 20.3 15.2Z"/><path d="m16.8 5 .4 1.2 1.2.4-1.2.4-.4 1.2-.4-1.2-1.2-.4 1.2-.4.4-1.2Z"/></svg>;
  if (name === "sun") return <svg {...common}><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>;
  if (name === "pause") return <svg {...common} fill="currentColor" stroke="none"><rect x="6.5" y="5" width="4" height="14" rx="1"/><rect x="13.5" y="5" width="4" height="14" rx="1"/></svg>;
  if (name === "play") return <svg {...common} fill="currentColor" stroke="none"><path d="M7 4.9c0-.8.9-1.2 1.6-.8l11 7c.6.4.6 1.4 0 1.8l-11 7c-.7.4-1.6 0-1.6-.8V4.9Z"/></svg>;
  if (name === "reset") return <svg {...common}><path d="M3.5 11a8.5 8.5 0 1 1 .6 4.5"/><path d="M3.5 4.5V11h6.2"/></svg>;
  if (name === "spark") return <svg {...common}><path d="m12 2 1.8 7.1L21 12l-7.2 2.1L12 21l-1.8-6.9L3 12l7.2-2.9L12 2Z"/></svg>;
  return <svg {...common}><path d="m9 18 6-6-6-6"/></svg>;
}

export default function Home() {
  const [sim, setSim] = useState<NeedState>(STARTING_STATE);
  const [running, setRunning] = useState(true);
  const stateRef = useRef(sim);
  const runningRef = useRef(running);

  useEffect(() => { stateRef.current = sim; }, [sim]);
  useEffect(() => { runningRef.current = running; }, [running]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!runningRef.current) return;
      const old = stateRef.current;
      let hunger = clamp(old.hunger + 0.65);
      let sleep = clamp(old.sleep + 0.32);
      let food = old.food;
      let activity = old.activity;
      let activityLeft = Math.max(0, old.activityLeft - 1);

      if (activity === "eating") {
        activity = activityLeft === 0 ? "gathering" : "eating";
      } else if (activity === "sleeping") {
        sleep = clamp(sleep - 2.7);
        activity = activityLeft === 0 ? "gathering" : "sleeping";
      } else if (sleep >= 88) {
        activity = "sleeping";
        activityLeft = 32;
      } else if (hunger >= 72 && food > 0) {
        food -= 1;
        hunger = clamp(hunger - 48);
        activity = "eating";
        activityLeft = 4;
      } else {
        food = Math.min(99, food + 1);
      }

      const crossedMidnight = old.minutes + 5 >= 1440;
      const next = { hunger, sleep, food, minutes: (old.minutes + 5) % 1440, day: old.day + (crossedMidnight ? 1 : 0), activity, activityLeft };
      stateRef.current = next;
      setSim(next);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const reset = () => {
    setSim(STARTING_STATE);
    stateRef.current = STARTING_STATE;
    setRunning(true);
    runningRef.current = true;
  };

  const status = sim.activity === "gathering" ? "Hunting & gathering" : sim.activity === "eating" ? "Having a meal" : "Sleeping";
  const isNight = sim.minutes >= 19 * 60 || sim.minutes < 6 * 60;

  return (
    <main className="game-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Little Life home"><span className="brand-mark"><Icon name="leaf" size={19}/></span><span>little<span className="brand-light">life</span></span></a>
        <div className="topbar-right"><span className="live-indicator"><i/> LIVE SIMULATION</span><button className="icon-button reset-button" onClick={reset} aria-label="Start a new day" title="Start a new day"><Icon name="reset" size={17}/></button></div>
      </header>

      <section className="intro" id="home">
        <div><p className="eyebrow"><span className="eyebrow-line"/> A VERY SMALL WORLD</p><h1>One little life,<br/><span>one day at a time.</span></h1></div>
        <p className="intro-note">A quiet life unfolds in the clearing.<br className="desktop-break"/> Keep an eye on your little friend.</p>
      </section>

      <section className={`world-card ${isNight ? "world-night" : ""}`} aria-label="The little person's world">
        <div className="world-topline"><span><span className="world-dot"/> THEIR LITTLE WORLD</span><span className="world-date">DAY {String(sim.day).padStart(2, "0")} <b>·</b> {clockLabel(sim.minutes)}</span></div>
        <div className="landscape">
          <div className="sky-glow"/><span className="sky-sun"><Icon name={isNight ? "moon" : "sun"} size={26}/></span>
          <div className="cloud cloud-one"/><div className="cloud cloud-two"/>
          <div className="hill hill-back"/><div className="hill hill-front"/>
          <span className="tree tree-left">♠</span><span className="tree tree-right">♠</span>
          <div className={`person-wrap ${sim.activity === "sleeping" ? "person-sleeping" : ""} ${sim.activity === "eating" ? "person-eating" : ""}`}><div className="person-dot"/><span className="person-shadow"/></div>
          {sim.activity === "sleeping" && <span className="sleep-z z-one">z</span>}{sim.activity === "sleeping" && <span className="sleep-z z-two">z</span>}
          <div className="ground"><span className="grass grass-a"/><span className="grass grass-b"/><span className="grass grass-c"/><span className="flower flower-a">✳</span><span className="flower flower-b">✳</span></div>
          <div className="world-caption"><span className="caption-icon"><Icon name={sim.activity === "sleeping" ? "moon" : sim.activity === "eating" ? "food" : "leaf"} size={15}/></span><span><strong>{status}</strong><small>{sim.activity === "sleeping" ? "Resting up for a new day" : sim.activity === "eating" ? "Taking a moment to eat" : "Looking for something to eat"}</small></span><span className="caption-arrow"><Icon name="chevron" size={16}/></span></div>
        </div>
        <div className="world-footer"><span><Icon name="spark" size={14}/> 1 second = 5 minutes</span><span>All is well in the clearing</span></div>
      </section>

      <section className="needs-section" aria-labelledby="needs-heading">
        <div className="section-heading"><div><p className="eyebrow"><span className="eyebrow-line"/> THE BASICS</p><h2 id="needs-heading">How they’re doing</h2></div><span className="needs-note">Needs rise as time passes</span></div>
        <div className="needs-grid">
          <NeedCard icon="food" title="Hunger" amount={sim.hunger} detail={sim.hunger >= 72 ? "Ready for a meal" : "Feeling comfortably full"} tone="hunger"/>
          <NeedCard icon="moon" title="Sleepiness" amount={sim.sleep} detail={sim.activity === "sleeping" ? "Getting some rest" : sim.sleep >= 68 ? "Could use a nap soon" : "Wide awake"} tone="sleep"/>
          <div className="stock-card"><div className="card-title"><span className="need-icon stock-icon"><Icon name="leaf" size={17}/></span><span className="need-label">Food gathered</span><span className="stock-label">STOCKPILE</span></div><div className="stock-count">{sim.food}<span> portions</span></div><div className="stock-bottom"><div className="food-dots" aria-label={`${sim.food} food portions`}>{Array.from({length: 9}, (_, i) => <i key={i} className={i < Math.min(9, sim.food) ? "filled" : ""}/>)}</div><span>Enough for later</span></div></div>
        </div>
      </section>

      <footer className="bottom-bar"><div className="footer-message"><span className="footer-flower">✳</span><span><strong>Nothing to worry about.</strong><small>Your little life takes care of itself.</small></span></div><div className="sim-controls"><span className="sim-label">SIMULATION</span><button className={`play-button ${running ? "is-running" : ""}`} onClick={() => setRunning(!running)}><Icon name={running ? "pause" : "play"} size={14}/><span>{running ? "Pause" : "Continue"}</span></button><button className="reset-text" onClick={reset}>Start over</button></div></footer>
    </main>
  );
}

function NeedCard({ icon, title, amount, detail, tone }: { icon: "food" | "moon"; title: string; amount: number; detail: string; tone: "hunger" | "sleep" }) {
  const warning = amount >= 72;
  return <div className={`need-card ${tone}`}><div className="card-title"><span className={`need-icon ${tone}-icon`}><Icon name={icon} size={17}/></span><span className="need-label">{title}</span><span className="need-number">{Math.round(amount)}<small>%</small></span></div><div className="meter" role="meter" aria-label={title} aria-valuenow={Math.round(amount)} aria-valuemin={0} aria-valuemax={100}><span style={{width: `${amount}%`}}/></div><div className="need-bottom"><span className={warning ? "warning-detail" : ""}><i className="detail-dot"/>{detail}</span><span>{warning ? "NEEDS ATTENTION" : "ALL GOOD"}</span></div></div>;
}
