import { useEffect, useRef, useState } from 'react';
import './App.css';
import ArrowIcon from './components/ArrowIcon';
import {
  HEADER_CANVAS_HIDE_SCROLL,
  HEADER_FRAMES,
  HEADER_FRAME_PROGRESS_DISTANCE,
  HEADER_IMAGE_RENDER_SCALE,
  HERO_FADE_END,
  HERO_FADE_START,
  LABELS,
  LANDING_LABEL_DELAY_FRAMES,
  MOON_FADE_END,
  MOON_FADE_START,
  MOON_FRAMES,
  MOON_IMAGE_RENDER_SCALE,
  MOON_TEXTS,
  PRE_SEPARATION_SEQUENCE_FRAME_RANGE,
  POST_INTRO_EARTH_FRAME_RANGE,
  POST_INTRO_IMAGE_FRAME_RANGE,
  SEPARATION_SEQUENCE_FRAME_RANGE,
} from './config/animationConfig';
import {
  buildHeaderPlayAreas,
  buildLocalFrameMap,
  buildLocalFrameSequence,
  buildMoonPlayAreas,
  clamp,
  drawCover,
  getActiveTextIndex,
  getFrameIndex,
  getScrollProgress,
  isInDelayedRange,
  loadImagesFromUrls,
} from './utils/animationUtils';

// Loads local header frame URLs at build time.
const LOCAL_HEADER_PLAY = import.meta.glob('/src/assets/Header/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
});

// Loads local moon frame URLs at build time.
const LOCAL_MOON_PLAY = import.meta.glob('/src/assets/Moon/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
});

const LOCAL_HEADER_FRAME_MAP = buildLocalFrameMap(LOCAL_HEADER_PLAY);
const LOCAL_MOON_FRAME_MAP = buildLocalFrameMap(LOCAL_MOON_PLAY);

const HEADER_PLAY_URLS = buildLocalFrameSequence(LOCAL_HEADER_FRAME_MAP, HEADER_FRAMES);
const MOON_PLAY_URLS = buildLocalFrameSequence(LOCAL_MOON_FRAME_MAP, MOON_FRAMES);

const POST_INTRO_IMAGE_URL = MOON_PLAY_URLS[15] || MOON_PLAY_URLS[0];
const POST_INTRO_EARTH_IMAGE_URL = MOON_PLAY_URLS[8] || MOON_PLAY_URLS[0];

const HEADER_PLAY_AREAS = buildHeaderPlayAreas(HEADER_PLAY_URLS);
const MOON_PLAY_AREAS = buildMoonPlayAreas(MOON_PLAY_URLS);
const FRAME_ADVANCE_INTERVAL_MS = 24;

/**
 * Main page component for the Chandrayaan-3 scroll story.
 */
export default function App() {
  const [loading, setLoading] = useState(true);
  const [moonFrame, setMoonFrame] = useState(0);
  const [isMoonSectionActive, setIsMoonSectionActive] = useState(false);
  const [isMoonSequencePhaseActive, setIsMoonSequencePhaseActive] = useState(false);

  const headerCanvas = useRef(null);
  const moonCanvas = useRef(null);
  const headerPlay = useRef(null);
  const moonPlay = useRef(null);
  const heroEl = useRef(null);
  const headerImgs = useRef([]);
  const moonImgs = useRef([]);
  const prevHeader = useRef(-1);
  const prevMoon = useRef(-1);
  const targetHeader = useRef(0);
  const targetMoon = useRef(0);
  const animationFrameId = useRef(null);
  const lastPlaybackStepAt = useRef(0);

  /**
   * Preloads all frame images once before running any scroll animation.
   */
  useEffect(() => {
    const totalFrames = HEADER_PLAY_URLS.length + MOON_PLAY_URLS.length;
    let loadedFrames = 0;

    /**
     * Tracks single-frame load progress and unlocks rendering when complete.
     */
    const onSingleFrameLoaded = () => {
      loadedFrames += 1;
      if (loadedFrames === totalFrames) setLoading(false);
    };

    Promise.all([
      loadImagesFromUrls(HEADER_PLAY_URLS, onSingleFrameLoaded),
      loadImagesFromUrls(MOON_PLAY_URLS, onSingleFrameLoaded),
    ]).then(([headerFrames, moonFrames]) => {
      headerImgs.current = headerFrames;
      moonImgs.current = moonFrames;
      setLoading(false);
    });
  }, []);

  /**
   * Drives canvas redraws from scroll position and handles viewport resize.
   */
  useEffect(() => {
    if (loading) return;

    /**
     * Moves one frame toward target index to avoid expensive jumps.
     */
    function stepToTarget(currentFrame, targetFrame) {
      if (currentFrame < targetFrame) return currentFrame + 1;
      if (currentFrame > targetFrame) return currentFrame - 1;
      return currentFrame;
    }

    /**
     * Draws a single header frame to its canvas.
     */
    function drawHeaderFrame(frameIndex) {
      drawCover(headerCanvas.current, headerImgs.current[frameIndex], HEADER_IMAGE_RENDER_SCALE);
    }

    /**
     * Draws a single moon frame and syncs overlay state.
     */
    function drawMoonFrame(frameIndex) {
      drawCover(moonCanvas.current, moonImgs.current[frameIndex], MOON_IMAGE_RENDER_SCALE);
      setMoonFrame(frameIndex);
    }

    /**
     * Starts the playback loop only when it is not already running.
     */
    function requestPlayback() {
      if (animationFrameId.current !== null) return;
      animationFrameId.current = requestAnimationFrame(tickPlayback);
    }

    /**
     * Renders frames incrementally in RAF for smooth and efficient playback.
     */
    function tickPlayback(now) {
      if (!lastPlaybackStepAt.current) {
        lastPlaybackStepAt.current = now;
      }

      const canAdvanceFrame = now - lastPlaybackStepAt.current >= FRAME_ADVANCE_INTERVAL_MS;

      if (headerImgs.current.length) {
        const currentHeader = prevHeader.current < 0 ? targetHeader.current : prevHeader.current;
        const nextHeader = canAdvanceFrame
          ? stepToTarget(currentHeader, targetHeader.current)
          : currentHeader;
        if (nextHeader !== prevHeader.current) {
          prevHeader.current = nextHeader;
          drawHeaderFrame(nextHeader);
        }
      }

      if (moonImgs.current.length) {
        const currentMoon = prevMoon.current < 0 ? targetMoon.current : prevMoon.current;
        const nextMoon = canAdvanceFrame
          ? stepToTarget(currentMoon, targetMoon.current)
          : currentMoon;
        if (nextMoon !== prevMoon.current) {
          prevMoon.current = nextMoon;
          drawMoonFrame(nextMoon);
        }
      }

      if (canAdvanceFrame) {
        lastPlaybackStepAt.current = now;
      }

      const hasPendingFrameUpdates =
        prevHeader.current !== targetHeader.current ||
        prevMoon.current !== targetMoon.current;

      if (hasPendingFrameUpdates) {
        animationFrameId.current = requestAnimationFrame(tickPlayback);
      } else {
        animationFrameId.current = null;
      }
    }

    /**
     * Resizes canvases for device pixel ratio and forces redraw.
     */
    function resizeCanvases() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      [headerCanvas, moonCanvas].forEach(ref => {
        const c = ref.current;
        if (!c) return;
        c.width = innerWidth * dpr;
        c.height = innerHeight * dpr;
      });

      // DPR-aware canvas resize requires a forced redraw.
      prevHeader.current = -1;
      prevMoon.current = -1;
      targetHeader.current = 0;
      targetMoon.current = 0;
      lastPlaybackStepAt.current = 0;
      handleScroll();
      requestPlayback();
    }

    /**
     * Computes current frame indices and updates related overlays.
     */
    function handleScroll() {
      const currentScroll = scrollY;
      const moonSequencePhaseActive = currentScroll >= HEADER_CANVAS_HIDE_SCROLL;
      setIsMoonSequencePhaseActive(prev =>
        prev === moonSequencePhaseActive ? prev : moonSequencePhaseActive
      );

      if (heroEl.current) {
        // Fade out hero copy as user enters animation section.
        const heroOpacity = currentScroll < HERO_FADE_START
          ? 1
          : clamp(1 - (currentScroll - HERO_FADE_START) / (HERO_FADE_END - HERO_FADE_START), 0, 1);
        heroEl.current.style.opacity = heroOpacity;
      }

      if (headerPlay.current && headerImgs.current.length) {
        const headerStart = headerPlay.current.offsetTop;
        // Header sequence uses a fixed scroll window for predictable pacing.
        const headerProgress = getScrollProgress(currentScroll, headerStart, HEADER_FRAME_PROGRESS_DISTANCE);
        const headerFrameIndex = currentScroll <= headerStart
          ? 0
          : getFrameIndex(headerProgress, headerImgs.current.length);
        targetHeader.current = headerFrameIndex;

        const headerCanvasElement = headerCanvas.current;
        if (headerCanvasElement) {
          const headerStillVisible = currentScroll < HEADER_CANVAS_HIDE_SCROLL;
          headerCanvasElement.style.visibility = headerStillVisible ? 'visible' : 'hidden';
        }
      }

      if (moonPlay.current && moonImgs.current.length) {
        const moonStart = moonPlay.current.offsetTop;
        const moonLength = moonPlay.current.offsetHeight;
        const moonSectionActive =
          currentScroll >= moonStart && currentScroll <= moonStart + moonLength;
        setIsMoonSectionActive(prev => (prev === moonSectionActive ? prev : moonSectionActive));
        const moonProgress = getScrollProgress(currentScroll, moonStart, moonLength);
        const moonFrameIndex = getFrameIndex(moonProgress, moonImgs.current.length);
        targetMoon.current = moonFrameIndex;

        const moonCanvasElement = moonCanvas.current;
        if (moonCanvasElement) {
          const moonOpacity = getScrollProgress(currentScroll, MOON_FADE_START, MOON_FADE_END - MOON_FADE_START);
          // Moon canvas starts only after pre-separation sequence is complete.
          const preSeparationEndIndex = PRE_SEPARATION_SEQUENCE_FRAME_RANGE[1] - 1;
          const moonInVisibleRange =
            currentScroll > MOON_FADE_START && moonFrameIndex > preSeparationEndIndex;
          moonCanvasElement.style.opacity = moonInVisibleRange ? moonOpacity : 0;
          moonCanvasElement.style.visibility = moonInVisibleRange ? 'visible' : 'hidden';
        }
      }

      requestPlayback();
    }

    resizeCanvases();
    // Ensure first paint starts from frame 1 before any scroll input.
    if (headerImgs.current.length) {
      targetHeader.current = 0;
      prevHeader.current = 0;
      drawHeaderFrame(0);
      requestPlayback();
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', resizeCanvases);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', resizeCanvases);
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [loading]);

  const activeText = getActiveTextIndex(moonFrame);
  const showPostIntroFrame =
    moonFrame >= POST_INTRO_IMAGE_FRAME_RANGE[0] &&
    moonFrame <= POST_INTRO_IMAGE_FRAME_RANGE[1];
  const showPostIntroEarthFrame =
    moonFrame >= POST_INTRO_EARTH_FRAME_RANGE[0] &&
    moonFrame <= POST_INTRO_EARTH_FRAME_RANGE[1];
  const preSeparationStartIndex = PRE_SEPARATION_SEQUENCE_FRAME_RANGE[0] - 1;
  const preSeparationEndIndex = PRE_SEPARATION_SEQUENCE_FRAME_RANGE[1] - 1;
  const showPreSeparationSequence =
    isMoonSectionActive &&
    isMoonSequencePhaseActive &&
    moonFrame >= preSeparationStartIndex &&
    moonFrame <= preSeparationEndIndex;
  const preSeparationImageIndex = clamp(moonFrame, preSeparationStartIndex, preSeparationEndIndex);
  const activePreSeparationImage =
    MOON_PLAY_URLS[preSeparationImageIndex] || MOON_PLAY_URLS[preSeparationEndIndex];
  const separationStartIndex = SEPARATION_SEQUENCE_FRAME_RANGE[0] - 1;
  const separationEndIndex = SEPARATION_SEQUENCE_FRAME_RANGE[1] - 1;
  const showSeparationSequence =
    isMoonSectionActive &&
    isMoonSequencePhaseActive &&
    moonFrame >= separationStartIndex &&
    moonFrame <= separationEndIndex;
  const separationImageIndex = clamp(moonFrame, separationStartIndex, separationEndIndex);
  const activeSeparationImage = MOON_PLAY_URLS[separationImageIndex] || MOON_PLAY_URLS[separationStartIndex];

  if (loading) return null;

  return (
    <>
      {/* Scroll content */}
      <div className="screen-wrapper">
        <div ref={heroEl} className="first-screen h-100">
          <h2 className="headline">India's <span>Moonshot</span></h2>
          <h1 className="sub-heading">Chandrayaan-3 on <span>final approach</span></h1>
          <ul className="by-tags">
            <li>story By: </li>
            <li>Barkha Singh</li>
          </ul>
          <div className="scroll-nav">
            <div className="scroll-text">Scroll</div>
            <div className="scroll-icon">
              <svg viewBox="0 0 330 330" xmlns="http://www.w3.org/2000/svg">
                <path d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="header-video-wrapper">
          <canvas ref={headerCanvas} id="header_video" className="anim-canvas" />
          <div ref={headerPlay} className="header-play-area" id="header_canvasPlay">
            {HEADER_PLAY_AREAS.map(frame => (
              <div
                key={frame.index}
                image_src={frame.imageSrc}
                className="image-get-container"
                style={{ height: frame.height }}
              />
            ))}
          </div>
        </div>

        {/* Intro text */}
        <section className="intro">
          <p>
            It was in the wee hours of September 6, 2019, when the dust on the Moon's surface
            began to flicker from its ancient hibernation, feeling the rumblings of engines
            hurtling overhead. Chandrayaan-2 was on the final stretch. But it all ended in
            despair. Four years later, India is back at it. Chandrayaan-3 is on the final
            approach as it eyes the prize awaiting below. Join this epic journey, and be part
            of history as we take you to the Moon.
          </p>
        </section>

        {/* Moon animation */}
        <div className="moon-launcher-panel">
          <canvas ref={moonCanvas} id="moon_video" className="anim-canvas anim-canvas--moon" />
          <div ref={moonPlay} className="moon-play-area" id="moon_canvasPlay">
            {MOON_PLAY_AREAS.map(frame => (
              <div
                key={frame.id}
                image_src={frame.imageSrc}
                id={frame.id}
                className="image-get-container"
                style={{ height: frame.height }}
              />
            ))}
          </div>
        </div>

        <div style={{ height: '1px' }} />

      </div>

      <div className={`post-intro-shot ${showPostIntroFrame ? 'show' : ''}`}>
        <img src={POST_INTRO_IMAGE_URL} alt="Chandrayaan craft" />
      </div>
      <div className={`post-intro-shot ${showPostIntroEarthFrame ? 'show' : ''}`}>
        <img src={POST_INTRO_EARTH_IMAGE_URL} alt="Chandrayaan with Earth view" />
      </div>
      <div className={`post-intro-shot ${showPreSeparationSequence ? 'show' : ''}`}>
        <img src={activePreSeparationImage} alt="Moon approach sequence before separation" />
      </div>
      <div className={`post-intro-shot ${showSeparationSequence ? 'show' : ''}`}>
        <img src={activeSeparationImage} alt="Chandrayaan separation sequence" />
      </div>

      {/* Text overlays (fixed, shown per frame) */}
      {MOON_TEXTS.map((item, i) => (
        <div key={i} className={`text-card ${activeText === i ? 'show' : ''}`}>
          <div className={`text-card-inner ${item.caps ? 'caps' : ''}`}>
            <p>{item.text}</p>
          </div>
        </div>
      ))}

      {/* Landing status labels */}
      <div className="landing-status-container">
        {LABELS.map((l, i) => (
          <div
            key={i}
            className={`landing-mesage-panel ${
              isInDelayedRange(moonFrame, l.range, LANDING_LABEL_DELAY_FRAMES)
                ? 'show'
                : ''
            }`}
            style={l.style}
          >
            <div className={`landing_message_inner-container ${l.pos}`}>
              <div className="arraw-icon"><ArrowIcon /></div>
              <div className="landing-text-message">{l.text}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
