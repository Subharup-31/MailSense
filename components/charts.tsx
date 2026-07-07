'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { useTheme } from './theme-provider';

// Color Palette Variables
const COLORS = {
  purple: '#a855f7',
  indigo: '#6366f1',
  teal: '#14b8a6',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  gray: '#4b5563'
};

interface MetricBreakdownProps {
  data: Record<string, number>;
}

export function MetricRadarChart({ data }: MetricBreakdownProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const gridColor = isDark ? '#1f2937' : '#e2e8f0';
  const tickColor = isDark ? '#9ca3af' : '#64748b';
  const labelColor = isDark ? '#4b5563' : '#94a3b8';
  const tooltipBg = isDark ? '#111827' : '#ffffff';
  const tooltipBorder = isDark ? '#1f2937' : '#e2e8f0';
  const tooltipText = isDark ? '#ffffff' : '#0f172a';

  // Map raw API keys to clean names
  const labelsMap: Record<string, string> = {
    semanticSimilarity: 'Semantic Sim',
    bleu: 'BLEU-4',
    rouge: 'ROUGE-L',
    meteor: 'METEOR',
    bertScore: 'BERTScore',
    intentAlignment: 'Intent Align',
    completeness: 'Completeness',
    grounding: 'Grounding',
    hallucination: 'Hallucination',
    professionalism: 'Professionalism',
    safety: 'Safety'
  };

  const chartData = Object.entries(data).map(([key, val]) => ({
    subject: labelsMap[key] || key,
    value: Math.round(val * 100),
    fullMark: 100
  }));

  return (
    <div className="w-full h-80 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke={gridColor} />
          <PolarAngleAxis dataKey="subject" tick={{ fill: tickColor, fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: labelColor }} />
          <Radar
            name="Platform Average"
            dataKey="value"
            stroke={COLORS.purple}
            fill={COLORS.purple}
            fillOpacity={0.25}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px' }}
            itemStyle={{ color: tooltipText }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface CategoryPerformanceProps {
  data: Array<{ category: string; averageScore: number; count: number }>;
}

export function CategoryBarChart({ data }: CategoryPerformanceProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const gridColor = isDark ? '#1f2937' : '#e2e8f0';
  const tickColor = isDark ? '#9ca3af' : '#64748b';
  const tooltipBg = isDark ? '#111827' : '#ffffff';
  const tooltipBorder = isDark ? '#1f2937' : '#e2e8f0';
  const tooltipText = isDark ? '#ffffff' : '#0f172a';

  const chartData = data.map(item => ({
    name: item.category,
    Score: Math.round(item.averageScore * 100),
    Volume: item.count
  })).slice(0, 8); // Top 8 categories for legibility

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="name" stroke={tickColor} fontSize={11} tickLine={false} />
          <YAxis stroke={tickColor} fontSize={11} domain={[0, 100]} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px' }}
            labelStyle={{ color: tickColor }}
            itemStyle={{ color: tooltipText }}
          />
          <Bar dataKey="Score" fill="url(#barGradient)" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? COLORS.indigo : COLORS.purple} />
            ))}
          </Bar>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.indigo} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0.8}/>
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface ConfidenceDistributionProps {
  data: { High: number; Medium: number; Low: number };
}

export function ConfidenceDonutChart({ data }: ConfidenceDistributionProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const tooltipBg = isDark ? '#111827' : '#ffffff';
  const tooltipBorder = isDark ? '#1f2937' : '#e2e8f0';
  const tooltipText = isDark ? '#ffffff' : '#0f172a';

  const chartData = [
    { name: 'High Confidence', value: data.High || 0, color: COLORS.emerald },
    { name: 'Medium Confidence', value: data.Medium || 0, color: COLORS.amber },
    { name: 'Low Confidence', value: data.Low || 0, color: COLORS.rose }
  ].filter(item => item.value > 0);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="w-full h-80 flex flex-col items-center justify-center">
      {total === 0 ? (
        <p className="text-slate-500 dark:text-gray-500 text-sm">No data available</p>
      ) : (
        <>
          <div className="w-full h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px' }}
                  itemStyle={{ color: tooltipText }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Absolute Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-slate-800 dark:text-white">{total}</span>
              <span className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider">Runs Audited</span>
            </div>
          </div>

          {/* Custom Legends */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-slate-700 dark:text-gray-300 font-medium">
                  {item.name} ({Math.round((item.value / total) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
