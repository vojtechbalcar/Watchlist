"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { landingComparison } from "@/lib/landing-comparison";
import { formatPct } from "@/lib/format";
import styles from "./landing-hero.module.css";

type Phase = "idle" | "ready" | "running" | "rewinding" | "finished";

const { stockReturns, benchmarkReturns, stockReturn, benchmarkReturn, gapPp } = landingComparison;
const monthLetters = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
// One track and one scale for both runners, so the distance between them is the real gap.
const finish = Math.ceil(Math.max(stockReturn, benchmarkReturn) / 5) * 5;
const marks = Array.from({ length: finish / 5 + 1 }, (_, index) => index * 5);
const runners = [
  { label: "S&P 500", returns: benchmarkReturns, className: styles.market },
  { label: "Your stock", returns: stockReturns, className: styles.stock, shortfall: true },
];
const raceMs = 3400;
const rewindMs = 800;
const trackVars = { "--finish": finish, "--stock-end": stockReturn, "--market-end": benchmarkReturn } as CSSProperties;

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
function subscribeToMotion(onChange: () => void) {
  const query = matchMedia(reducedMotionQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Where a runner is part-way through the year: a smooth curve through every month-end return (Catmull-Rom). */
function returnAt(returns: number[], month: number) {
  const index = Math.min(Math.floor(month), returns.length - 2);
  const t = month - index;
  const [a, b, c, d] = [index - 1, index, index + 1, index + 2].map(i => returns[Math.min(Math.max(i, 0), returns.length - 1)]);
  return b + t * (c - a) / 2 + t * t * (a - 2.5 * b + 2 * c - d / 2) + t * t * t * (1.5 * (b - c) + (d - a) / 2);
}

export function LandingHero() {
  // The server renders the finished race, hidden until the browser decides whether to run it.
  const [phase, setPhase] = useState<Phase>("idle");
  const [replays, setReplays] = useState(0);
  const reducedMotion = useSyncExternalStore(subscribeToMotion, () => matchMedia(reducedMotionQuery).matches, () => false);
  const track = useRef<HTMLDivElement>(null);
  const lanes = useRef<(HTMLLIElement | null)[]>([]);
  const readouts = useRef<(HTMLElement | null)[]>([]);
  const months = useRef<(HTMLLIElement | null)[]>([]);
  const position = useRef(12);

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    let frame = 0;
    let timer = 0;

    // Positions, readouts and the month clock change every frame, so they are written straight to the DOM.
    const place = (at: number) => {
      position.current = at;
      runners.forEach((runner, index) => {
        const value = returnAt(runner.returns, at);
        lanes.current[index]?.style.setProperty("--x", value.toFixed(3));
        const text = readouts.current[index]?.firstChild;
        if (text) text.nodeValue = formatPct(value, 1);
      });
      const current = Math.floor(at);
      months.current.forEach((month, index) => {
        if (month) month.dataset.state = index < current ? "past" : index === current ? "current" : "next";
      });
    };
    // Plays the year from one month to another, easing out of the start and into the finish.
    const play = (from: number, to: number, ms: number, done: () => void) => {
      const start = performance.now();
      const step = (now: number) => {
        const progress = Math.min((now - start) / ms, 1);
        place(from + (to - from) * (1 - Math.cos(Math.PI * progress)) / 2);
        if (progress < 1) frame = requestAnimationFrame(step);
        else done();
      };
      frame = requestAnimationFrame(step);
    };
    const race = () => {
      setPhase("running");
      play(0, 12, raceMs, () => setPhase("finished"));
    };
    const stop = () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };

    if (reducedMotion) {
      place(12);
      return;
    }

    // A replay winds the year back from wherever the runners are, then races it again.
    if (replays > 0) {
      play(position.current, 0, rewindMs * position.current / 12 + 150, () => {
        setPhase("ready");
        timer = window.setTimeout(race, 250);
      });
      return stop;
    }

    // Start when the track is on screen, so a visitor arriving lower down still sees the race.
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      place(0);
      setPhase("ready");
      timer = window.setTimeout(race, 500);
    }, { threshold: .5 });
    observer.observe(element);
    return () => {
      observer.disconnect();
      stop();
    };
  }, [replays, reducedMotion]);

  function replay() {
    setPhase("rewinding");
    setReplays(count => count + 1);
  }

  return (
    <section className={styles.hero} data-phase={reducedMotion ? "finished" : phase} aria-labelledby="hero-title">
      <div className={styles.lead}>
        <h1 id="hero-title">Both <span className={styles.green}>green</span>.<br />One <span className={styles.losing}>losing</span><span className={styles.period}>.</span></h1>
        <div className={styles.aside}>
          <p>Up feels like winning.<br />Until you see what the market did.</p>
          <div className={styles.actions}>
            <Link href="/register" className={styles.primary}>Go to watchlist <ArrowUpRight size={19} aria-hidden="true" /></Link>
            <a href="https://github.com/vojtechbalcar/Watchlist" className={styles.source}>View source code <ArrowUpRight size={15} aria-hidden="true" /></a>
          </div>
        </div>
      </div>

      <figure className={styles.race} style={trackVars}>
        <div aria-hidden="true">
          <div className={styles.above}>
            <ol className={styles.months}>
              {monthLetters.map((letter, index) => <li key={index} ref={element => { months.current[index] = element; }}>{letter}</li>)}
            </ol>
            <ol className={styles.scale}>
              {marks.map(mark => <li key={mark} style={{ "--at": mark } as CSSProperties}>{mark}%</li>)}
            </ol>
          </div>
          <div className={styles.track} ref={track}>
            <div className={styles.overlay}>
              <div className={styles.overlayCourse}>
                {marks.map(mark => <span key={mark} className={styles.tick} style={{ "--at": mark } as CSSProperties} />)}
                <span className={styles.marker} />
              </div>
            </div>
            <ol className={styles.lanes}>
              {runners.map((runner, index) => {
                const end = runner.returns[runner.returns.length - 1];
                return (
                  <li key={runner.label} className={`${styles.lane} ${runner.className}`} style={{ "--x": end } as CSSProperties} ref={element => { lanes.current[index] = element; }}>
                    <span className={styles.laneNumber}>{index + 1}</span>
                    <div className={styles.course}>
                      <span className={styles.covered} />
                      {runner.shortfall && <span className={styles.shortfall} />}
                      <div className={styles.runner}>
                        <span className={styles.bib}>
                          <span className={styles.bibLabel}>{runner.label}</span>
                          <strong ref={element => { readouts.current[index] = element; }}>{formatPct(end, 1)}</strong>
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
          <div className={styles.below}>
            <p className={styles.gap}><strong>−{Math.abs(gapPp).toFixed(1)} pp</strong><span>behind the market</span></p>
          </div>
        </div>
        <figcaption>
          <span>One year from the same start line. Illustrative returns.</span>
          <span className={styles.srOnly}> The S&amp;P 500 finished up {benchmarkReturn.toFixed(1)}% and your stock up {stockReturn.toFixed(1)}%, {Math.abs(gapPp).toFixed(1)} percentage points behind the market.</span>
        </figcaption>
        <button type="button" className={styles.replay} onClick={replay}>
          <RotateCcw size={14} aria-hidden="true" /><span>Replay<span className={styles.replayYear}> the year</span></span>
        </button>
      </figure>
    </section>
  );
}
