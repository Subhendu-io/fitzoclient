import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Ellipse, Path, Defs, RadialGradient, Stop } from 'react-native-svg';

export type ScreenVariant = 'home' | 'fitness' | 'scanner' | 'gym' | 'community' | 'default';

interface Props {
  variant: ScreenVariant;
}

// ─── Home / Dashboard — full-screen purple gradient + solid blob orbs ─────────
function HomeBg() {
  const isDark = useColorScheme() === 'dark';

  // Light: vivid lavender → soft lavender (matches reference)
  // Dark:  deep purple → near-black purple (matches dark reference)
  const gradientColors: [string, string, string] = isDark
    ? ['#1e1a3a', '#160f2e', '#0d0d14']
    : ['#9580ff', '#8b72ff', '#f0eeff'];
  const locations: [number, number, number] = [0, 0.45, 1];

  // Blob orbs — solid, slightly darker than gradient top
  const blobColor = isDark ? '#2d2660' : '#7c5cfc';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Full-screen gradient — replaces bg-background */}
      <LinearGradient
        colors={gradientColors}
        locations={locations}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Blob orbs — top-right cluster */}
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        {/* Large orb behind avatar area */}
        <Circle cx="92%" cy="22%" r="130" fill={blobColor} opacity={isDark ? 0.55 : 0.35} />
        {/* Medium orb below */}
        <Circle cx="98%" cy="36%" r="95" fill={blobColor} opacity={isDark ? 0.4 : 0.25} />
        {/* Small tonal accent top */}
        <Ellipse cx="80%" cy="6%" rx="70" ry="58" fill={blobColor} opacity={isDark ? 0.3 : 0.2} />
      </Svg>
    </View>
  );
}

// ─── Fitness Tab — orange/energy bursts ──────────────────────────────────────
function FitnessBg() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="fg1" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#ffb347" stopOpacity="0.22" />
            <Stop offset="100%" stopColor="#ffb347" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="fg2" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#e8621a" stopOpacity="0.16" />
            <Stop offset="100%" stopColor="#e8621a" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="fg3" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#ffd700" stopOpacity="0.12" />
            <Stop offset="100%" stopColor="#ffd700" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Top-left burst */}
        <Ellipse cx="-5%" cy="5%" rx="200" ry="170" fill="url(#fg1)" />
        {/* Top-right warm accent */}
        <Circle cx="95%" cy="10%" r="120" fill="url(#fg3)" />
        {/* Bottom ember */}
        <Ellipse cx="75%" cy="92%" rx="150" ry="120" fill="url(#fg2)" />

        {/* Dynamic slash lines */}
        <Path
          d="M 30 120 L 100 20"
          stroke="#ffb347"
          strokeWidth="1.5"
          strokeOpacity="0.14"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M 60 140 L 130 40"
          stroke="#ffb347"
          strokeWidth="1"
          strokeOpacity="0.09"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M 280 700 L 380 580"
          stroke="#e8621a"
          strokeWidth="1"
          strokeOpacity="0.1"
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

// ─── Scanner Tab — cyan/tech grid ────────────────────────────────────────────
function ScannerBg() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="sg1" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#4facfe" stopOpacity="0.2" />
            <Stop offset="100%" stopColor="#4facfe" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="sg2" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#0057d9" stopOpacity="0.14" />
            <Stop offset="100%" stopColor="#0057d9" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Top arc glow */}
        <Ellipse cx="50%" cy="-6%" rx="220" ry="160" fill="url(#sg1)" />
        {/* Bottom-left cool glow */}
        <Circle cx="-5%" cy="88%" r="150" fill="url(#sg2)" />

        {/* Tech grid dots */}
        {[0, 1, 2, 3, 4].map(col =>
          [0, 1, 2, 3].map(row => (
            <Circle
              key={`${col}-${row}`}
              cx={50 + col * 55}
              cy={260 + row * 55}
              r="2"
              fill="#4facfe"
              opacity="0.12"
            />
          ))
        )}

        {/* Corner bracket arcs */}
        <Path
          d="M 30 30 L 30 70 Q 30 90 50 90 L 90 90"
          stroke="#4facfe"
          strokeWidth="1.5"
          strokeOpacity="0.18"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M 330 30 L 330 70 Q 330 90 310 90 L 270 90"
          stroke="#4facfe"
          strokeWidth="1.5"
          strokeOpacity="0.18"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

// ─── Gym/Health Tab — purple orbs ────────────────────────────────────────────
function GymBg() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="gyg1" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#a886d8" stopOpacity="0.22" />
            <Stop offset="100%" stopColor="#a886d8" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="gyg2" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#5e3ed8" stopOpacity="0.15" />
            <Stop offset="100%" stopColor="#5e3ed8" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="gyg3" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#c8b4ff" stopOpacity="0.1" />
            <Stop offset="100%" stopColor="#c8b4ff" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Circle cx="92%" cy="6%" r="180" fill="url(#gyg1)" />
        <Ellipse cx="-6%" cy="78%" rx="160" ry="140" fill="url(#gyg2)" />
        <Circle cx="55%" cy="42%" r="100" fill="url(#gyg3)" />

        {/* Heartbeat-inspired path */}
        <Path
          d="M 20 200 L 60 200 L 80 160 L 100 240 L 120 200 L 160 200"
          stroke="#a886d8"
          strokeWidth="1.5"
          strokeOpacity="0.16"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

// ─── Community Tab — pink/coral social nodes ──────────────────────────────────
function CommunityBg() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="cg1" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#f953c6" stopOpacity="0.18" />
            <Stop offset="100%" stopColor="#f953c6" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="cg2" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#ff6b6b" stopOpacity="0.14" />
            <Stop offset="100%" stopColor="#ff6b6b" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="cg3" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#ffa8e0" stopOpacity="0.1" />
            <Stop offset="100%" stopColor="#ffa8e0" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Circle cx="88%" cy="4%" r="170" fill="url(#cg1)" />
        <Ellipse cx="-4%" cy="82%" rx="150" ry="130" fill="url(#cg2)" />
        <Circle cx="30%" cy="30%" r="90" fill="url(#cg3)" />

        {/* Social connection lines */}
        <Circle cx="80" cy="180" r="6" fill="#f953c6" opacity="0.15" />
        <Circle cx="140" cy="220" r="4" fill="#f953c6" opacity="0.12" />
        <Circle cx="60" cy="250" r="5" fill="#ff6b6b" opacity="0.13" />
        <Path d="M 80 180 L 140 220" stroke="#f953c6" strokeWidth="1" strokeOpacity="0.1" fill="none" />
        <Path d="M 80 180 L 60 250" stroke="#f953c6" strokeWidth="1" strokeOpacity="0.1" fill="none" />
        <Path d="M 140 220 L 60 250" stroke="#f953c6" strokeWidth="1" strokeOpacity="0.08" fill="none" />
      </Svg>
    </View>
  );
}

// ─── Default ─────────────────────────────────────────────────────────────────
function DefaultBg() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="dg1" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#81e300" stopOpacity="0.1" />
            <Stop offset="100%" stopColor="#81e300" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="dg2" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#7c5cfc" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#7c5cfc" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx="85%" cy="5%" r="160" fill="url(#dg1)" />
        <Circle cx="10%" cy="85%" r="130" fill="url(#dg2)" />
      </Svg>
    </View>
  );
}

// ─── Exported component ───────────────────────────────────────────────────────
const BG_MAP: Record<ScreenVariant, React.FC> = {
  home: HomeBg,
  fitness: FitnessBg,
  scanner: ScannerBg,
  gym: GymBg,
  community: CommunityBg,
  default: DefaultBg,
};

export function ScreenBackground({ variant }: Props) {
  const Bg = BG_MAP[variant] ?? DefaultBg;
  return <Bg />;
}
