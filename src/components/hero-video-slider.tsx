"use client";

import { useEffect, useRef, useState } from "react";

const slides = [
  { src: "/1.mp4", eyebrow: "One connected network", title: "Move every shipment forward.", description: "FleetFlow gives modern logistics teams the visibility and control to deliver with confidence." },
  { src: "/2.mp4", eyebrow: "Built for busy operations", title: "Every handoff, clearly accounted for.", description: "Coordinate dispatch, drivers, proof of delivery, and exceptions from one calm workspace." },
  { src: "/3.mp4", eyebrow: "Ready for your next route", title: "Regional delivery without the guesswork.", description: "Keep customers informed and your team aligned from pickup to final delivery." },
];

export function HeroVideoSlider() {
  const [active, setActive] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 7000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    videoRef.current?.load();
    void videoRef.current?.play().catch(() => undefined);
  }, [active]);

  const slide = slides[active];

  return (
    <section className="landing-hero" aria-label="FleetFlow introduction">
      <video ref={videoRef} className="landing-hero-video" autoPlay muted loop playsInline poster="/world-network-map.png">
        <source src={slide.src} type="video/mp4" />
      </video>
      <div className="landing-hero-shade" />
      <div className="landing-hero-content">
        <span className="hero-eyebrow">{slide.eyebrow}</span>
        <h1>{slide.title}</h1>
        <p>{slide.description}</p>
        <div className="hero-actions"><a className="button hero-primary" href="/login">Open your workspace</a><a className="hero-link" href="#network">Explore the network <span>↓</span></a></div>
      </div>
      <div className="hero-slider-controls" aria-label="Hero slides">
        {slides.map((item, index) => <button key={item.src} className={index === active ? "is-active" : ""} onClick={() => setActive(index)} aria-label={`Show slide ${index + 1}`} aria-pressed={index === active}><span /></button>)}
      </div>
      <div className="hero-slide-count">0{active + 1} <span>/ 0{slides.length}</span></div>
    </section>
  );
}
