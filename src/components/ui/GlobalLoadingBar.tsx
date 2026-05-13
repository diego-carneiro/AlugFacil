import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLoading } from "../../context/LoadingContext";

export default function GlobalLoadingBar() {
  const { pending } = useLoading();
  const [show, setShow] = useState(false);
  const [complete, setComplete] = useState(false);
  const showRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (pending > 0) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      showRef.current = true;
      setShow(true);
      setComplete(false);
    } else if (showRef.current) {
      setComplete(true);
      timerRef.current = setTimeout(() => {
        showRef.current = false;
        setShow(false);
        setComplete(false);
      }, 500);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pending]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="loading-bar"
          className="fixed top-0 left-0 right-0 h-[2px] z-[9999] pointer-events-none"
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
        >
          <motion.div
            className="absolute inset-0 bg-linear-to-r from-primary-400 via-primary-500 to-primary-600 shadow-[0_0_8px_rgba(0,102,204,0.55)]"
            initial={{ scaleX: 0, transformOrigin: "left" }}
            animate={
              complete
                ? { scaleX: 1, transition: { duration: 0.2, ease: "easeOut" } }
                : {
                    scaleX: 0.85,
                    transition: { duration: 8, ease: [0.1, 0.35, 0.6, 0.9] },
                  }
            }
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
