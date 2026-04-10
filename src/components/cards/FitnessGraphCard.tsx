import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, ChevronRight, } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { getFitnessHistory, FitnessAssessmentEntry } from '@/features/health/services/fitnessScoreService';
import Svg, { Polyline, Circle, Text as SvgText, Line, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

export function FitnessGraphCard() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  
  const [data, setData] = useState<FitnessAssessmentEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      try {
        const history = await getFitnessHistory(user.uid, { limit: 7, offset: 0 });
        // Reverse to chronological order left-to-right
        setData(history.reverse());
      } catch (err) {
        console.log('[FitnessGraphCard] error:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadStats();
  }, [user?.uid]);

  // SVG Chart Dimensions
  const CHART_WIDTH = 260;
  const CHART_HEIGHT = 100;
  const PADDING_LEFT = 24;
  const PADDING_BOTTOM = 20;

  const renderGraph = () => {
    if (loading) {
      return (
        <View style={{ height: CHART_HEIGHT + PADDING_BOTTOM, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color="white" />
        </View>
      );
    }

    if (data.length === 0) {
      return (
        <View style={{ height: CHART_HEIGHT + PADDING_BOTTOM, justifyContent: 'center', alignItems: 'center' }}>
          <Text className="text-white/60 font-kanit">No assessment history yet.</Text>
        </View>
      );
    }

    // Mapping algorithm
    const maxScore = 100;
    const paddingX = CHART_WIDTH / Math.max(data.length - 1, 1);

    const points = data.map((entry, index) => {
      const x = PADDING_LEFT + (index * paddingX);
      const y = CHART_HEIGHT - (entry.score / maxScore) * CHART_HEIGHT;
      return { x, y, score: entry.score, date: entry.date };
    });

    const polylineStr = points.map(p => `${p.x},${p.y}`).join(' ');

    return (
      <View style={{ height: CHART_HEIGHT + PADDING_BOTTOM, width: CHART_WIDTH + PADDING_LEFT, marginTop: 10 }}>
        <Svg width="100%" height="100%">
          <Defs>
            <SvgGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#ffffff" stopOpacity="0.4" />
              <Stop offset="1" stopColor="#ffffff" stopOpacity="0.0" />
            </SvgGradient>
          </Defs>

          {/* Left Axis Guidelines */}
          {[0, 50, 100].map(val => (
            <React.Fragment key={`axis-${val}`}>
              <Line 
                x1={PADDING_LEFT} 
                y1={CHART_HEIGHT - (val / 100) * CHART_HEIGHT} 
                x2={CHART_WIDTH + PADDING_LEFT} 
                y2={CHART_HEIGHT - (val / 100) * CHART_HEIGHT} 
                stroke="rgba(255,255,255,0.15)" 
                strokeWidth="1" 
                strokeDasharray="4 4"
              />
              <SvgText x={0} y={CHART_HEIGHT - (val / 100) * CHART_HEIGHT + 4} fill="rgba(255,255,255,0.6)" fontSize="9" fontFamily="System" fontWeight="600">
                {val}
              </SvgText>
            </React.Fragment>
          ))}

          {/* Area Fill under the line by creating a closed polygon string */}
          {points.length > 1 && (
            <Polyline
              points={`${PADDING_LEFT},${CHART_HEIGHT} ${polylineStr} ${points[points.length - 1].x},${CHART_HEIGHT}`}
              fill="url(#grad)"
            />
          )}

          {/* The Data Line */}
          {points.length > 1 && (
            <Polyline
              points={polylineStr}
              fill="none"
              stroke="#ffffff"
              strokeWidth="3"
            />
          )}

          {/* Points & Bottom Dates */}
          {points.map((p, i) => {
            // Determine if we should show date text (avoid crowding if 10 lines)
            const showDate = data.length <= 5 || i % 2 === 0 || i === data.length - 1;
            
            // Shorten the date, e.g. "2024-05-10" to "05/10"
            const shortDate = p.date.split('-').slice(1).join('/');

            return (
              <React.Fragment key={`point-${i}`}>
                {/* Score Dot */}
                <Circle cx={p.x} cy={p.y} r="4" fill="#5e3ed8" stroke="#ffffff" strokeWidth="2" />
                
                {/* Score value hovering above point */}
                <SvgText x={p.x} y={p.y - 10} fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                  {p.score}
                </SvgText>

                {/* Bottom Date label */}
                {showDate && (
                  <SvgText x={p.x} y={CHART_HEIGHT + PADDING_BOTTOM - 2} fill="rgba(255,255,255,0.6)" fontSize="9" fontWeight="bold" textAnchor="middle">
                    {shortDate}
                  </SvgText>
                )}
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#8E2DE2', '#4A00E0']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 40, padding: 24, marginBottom: 24, overflow: 'hidden' }}
    >
      {/* Top Banner Row */}
      <TouchableOpacity 
        onPress={() => router.push('/(tabs)/(health)/fitness-score' as any)}
        activeOpacity={0.8}
        className="flex-row items-center justify-between mb-4"
      >
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full border border-white/20 bg-white/10 items-center justify-center mr-4">
            <LineChart {...({ size: 24, stroke: '#ffffff' } as any)} />
          </View>
          <View>
            <Text className="text-white text-xl font-bold font-kanit">Score Progress</Text>
            <Text className="text-white/60 text-xs font-kanit">Fitness tracking timeline</Text>
          </View>
        </View>
        <ChevronRight {...({ size: 20, stroke: '#ffffff', opacity: 0.5 } as any)} />
      </TouchableOpacity>

      <View className="h-[1px] bg-white/10 w-full mb-4" />

      {/* SVG Chart Element */}
      {renderGraph()}

    </LinearGradient>
  );
}
