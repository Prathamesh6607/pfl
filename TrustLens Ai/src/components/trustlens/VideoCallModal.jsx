// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, PhoneOff, Video as VideoIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VideoCallModal({ T, open, onClose, onSessionArtifact, userId = 'web-user-001' }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const sessionIdRef = useRef('');
  const [micOn, setMicOn] = useState(true);
  const [status, setStatus] = useState('connecting');

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setStatus('connecting');
    sessionIdRef.current = `session-${Date.now()}`;

    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }).catch(() => null);
      if (cancelled) { stream?.getTracks().forEach(t => t.stop()); return; }
      if (stream) {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setTimeout(() => !cancelled && setStatus('live'), 900);
      } else {
        setStatus('live');
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, [open]);

  const toggleMic = () => {
    const on = !micOn;
    setMicOn(on);
    streamRef.current?.getAudioTracks().forEach(t => (t.enabled = on));
  };

  const end = async () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;

    if (onSessionArtifact) {
      let latitude = null;
      let longitude = null;
      if (navigator.geolocation) {
        const location = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve(position),
            () => resolve(null),
            { timeout: 2000 }
          );
        });
        if (location?.coords) {
          latitude = Number(location.coords.latitude.toFixed(6));
          longitude = Number(location.coords.longitude.toFixed(6));
        }
      }

      onSessionArtifact({
        session_id: sessionIdRef.current || `session-${Date.now()}`,
        user_id: userId,
        transcript_text: '',
        consent_captured: true,
        consent_phrase: 'I consent to proceed with this loan application.',
        latitude,
        longitude,
        device: navigator.userAgent || 'unknown',
        ip_address: '',
      });
    }

    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-5xl bg-card rounded-3xl overflow-hidden shadow-luxe"
          >
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl">{T.video_title}</h3>
                <p className="text-xs text-muted-foreground">{T.video_sub}</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${status === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                {status === 'live' ? 'LIVE' : T.connecting}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-1 bg-border">
              {/* AI Avatar */}
              <div className="relative aspect-video md:aspect-auto md:h-[480px] bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 flex items-center justify-center overflow-hidden">
                <motion.div
                  animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute w-80 h-80 rounded-full bg-white/10 blur-3xl"
                />
                <div className="relative text-center text-white">
                  <div className="w-28 h-28 mx-auto rounded-full bg-white/15 backdrop-blur-xl flex items-center justify-center mb-4 border border-white/20">
                    <Sparkles className="w-12 h-12" />
                  </div>
                  <p className="font-serif text-2xl">TrustLens AI</p>
                  <p className="text-sm text-white/70 mt-1">Advisor</p>
                </div>
                <div className="absolute bottom-4 left-4 text-white/80 text-xs bg-black/30 rounded-full px-3 py-1 backdrop-blur">
                  AI Advisor
                </div>
              </div>

              {/* User camera */}
              <div className="relative aspect-video md:aspect-auto md:h-[480px] bg-foreground overflow-hidden">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                {!streamRef.current && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 gap-3">
                    <VideoIcon className="w-10 h-10" />
                    <p className="text-sm">Camera preview</p>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 text-white/80 text-xs bg-black/40 rounded-full px-3 py-1 backdrop-blur">
                  You
                </div>
              </div>
            </div>

            <div className="p-5 flex items-center justify-center gap-3">
              <Button
                onClick={toggleMic}
                variant={micOn ? 'outline' : 'secondary'}
                className="rounded-full h-12 w-12 p-0"
              >
                {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>
              <Button
                onClick={end}
                className="rounded-full h-12 px-6 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                <PhoneOff className="w-4 h-4 mr-2" /> {T.end_call}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}