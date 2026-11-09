import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLang } from "../i18n/LangContext";

export function Loader({ onDone }: { onDone: () => void }) {
  const { dir } = useLang();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [gone, setGone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bgColor, setBgColor] = useState("#0c076a");
  const hasFinishedRef = useRef(false);

  const finish = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setGone(true);
    window.setTimeout(onDone, 550);
  }, [onDone]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback if browser autoplay policy restricts playback
        });
      }
    }

    // Safety timeout in case video stalls or fails to load
    const safetyTimer = window.setTimeout(() => {
      finish();
    }, 7800);

    return () => {
      window.clearTimeout(safetyTimer);
    };
  }, [finish]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    const cur = video.currentTime;
    const dur = video.duration || 6.8;

    setProgress(Math.min(100, Math.round((cur / dur) * 100)));

    // Transition background color to seamlessly blend with the video borders
    if (cur < 1.75) {
      setBgColor("#0c076a"); // TAM Indigo phase
    } else if (cur < 3.85) {
      setBgColor("#e0ed00"); // TAM Lime phase
    } else {
      setBgColor("#0f1103"); // TAM Ink dark phase
    }
  };

  const handleEnded = () => {
    // Hold final brand frame briefly before elegant reveal
    window.setTimeout(() => {
      finish();
    }, 400);
  };

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden transition-colors duration-300 select-none"
          style={{ backgroundColor: bgColor }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          dir={dir}
        >
          {/* Main Video Animation */}
          <div className="relative flex items-center justify-center w-full h-full max-h-screen max-w-full">
            <video
              ref={videoRef}
              src="/brand/TAM_logo_animation_feed.mp4"
              muted
              playsInline
              autoPlay
              preload="auto"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              onError={finish}
              className="w-full h-full max-h-screen object-contain pointer-events-none"
            />
          </div>

          {/* Minimal Bottom Progress Line */}
          <div className="absolute bottom-0 inset-x-0 h-[2px] bg-white/10 overflow-hidden z-20 pointer-events-none">
            <div
              className="h-full bg-lime transition-[width] duration-150 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
