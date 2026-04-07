import React, { useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Polygon, Defs, LinearGradient, Stop } from 'react-native-svg';

interface ComparisonSide {
  backgroundColor: string;
  color: string;
  header: string;
  description: string;
}

interface ComparisonCardProps {
  left: ComparisonSide;
  right: ComparisonSide;
}

/**
 * The diagonal cut: a line that goes from (TOP_CUT_X, 0) to (BOTTOM_CUT_X, H).
 * TOP_CUT_X  > BOTTOM_CUT_X  → right panel is wider at top, left panel wider at bottom.
 * Matches the CSS clip-path polygon approach 1:1.
 */
const TOP_CUT = 0.55;    // diagonal hits top edge at 55% from left
const BOTTOM_CUT = 0.45; // diagonal hits bottom edge at 45% from left
const GAP_PX = 8;        // pixel gap between the two panels along the diagonal

export function ComparisonCard({ left, right }: ComparisonCardProps) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setLayout({ width, height });
  };

  const { width: W, height: H } = layout;
  // Center of the diagonal edge — each polygon is pulled outward by GAP_PX/2
  const topX = W * TOP_CUT;
  const botX = W * BOTTOM_CUT;
  const half = GAP_PX / 2;
  // Left panel stops GAP/2 before the center diagonal line
  const leftTopX = topX - half;
  const leftBotX = botX - half;
  // Right panel starts GAP/2 after the center diagonal line
  const rightTopX = topX + half;
  const rightBotX = botX + half;

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {/* ── SVG background: two polygons sharing the same diagonal edge ─────── */}
      {W > 0 && H > 0 && (
        <Svg
          width={W}
          height={H}
          style={StyleSheet.absoluteFillObject}
        >
          {/* Left polygon — right edge pulled left by GAP/2 */}
          <Polygon
            points={`0,0 ${leftTopX},0 ${leftBotX},${H} 0,${H}`}
            fill={left.backgroundColor}
          />
          {/* Right polygon — left edge pushed right by GAP/2 */}
          <Polygon
            points={`${rightTopX},0 ${W},0 ${W},${H} ${rightBotX},${H}`}
            fill={right.backgroundColor}
          />
        </Svg>
      )}

      {/* ── Left text ───────────────────────────────────────────────────────── */}
      <View style={[styles.textPanel, styles.leftText]}>
        <Text style={[styles.label, { color: left.color }]}>{left.header}</Text>
        <Text style={[styles.value, { color: left.color }]}>{left.description}</Text>
      </View>

      {/* ── Right text ──────────────────────────────────────────────────────── */}
      <View style={[styles.textPanel, styles.rightText]}>
        <Text style={[styles.label, { color: right.color, textAlign: 'right' }]}>{right.header}</Text>
        <Text style={[styles.value, { color: right.color, textAlign: 'right' }]}>{right.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 20,
    overflow: 'hidden',
    height: 80,
    marginBottom: 16,
  },
  textPanel: {
    flex: 1,
    justifyContent: 'center',
    zIndex: 1,
  },
  leftText: {
    paddingLeft: 18,
    paddingRight: 8,
  },
  rightText: {
    paddingLeft: 22,
    paddingRight: 18,
  },
  label: {
    fontSize: 11,
    fontFamily: 'Kanit-Regular',
    opacity: 0.8,
    marginBottom: 3,
  },
  value: {
    fontSize: 22,
    fontFamily: 'Kanit-Bold',
    fontWeight: '700',
  },
});
