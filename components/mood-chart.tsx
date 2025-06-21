"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useIsMobile } from "@/hooks/use-mobile"

export function MoodChart({ data }: { data: any[] }) {
  const isMobile = useIsMobile();
  // Extract all mood entries
  const allMoods: string[] = []

  data.forEach((day) => {
    if (day.data?.moodHistory?.length) {
      day.data.moodHistory.forEach((mood: any) => {
        allMoods.push(mood.mood)
      })
    }
  })

  // Count occurrences of each mood
  const moodCounts: Record<string, number> = {}
  allMoods.forEach((mood) => {
    moodCounts[mood] = (moodCounts[mood] || 0) + 1
  })

  // Convert to chart data format
  const chartData = Object.entries(moodCounts)
    .map(([mood, count]) => ({
      mood,
      count,
    }))
    .sort((a, b) => b.count - a.count)

  // Define colors for different moods
  const MOOD_COLORS: Record<string, string> = {
    Cheerful: "#22c55e",
    Calm: "#3b82f6",
    Tense: "#f59e0b",
    Fearful: "#ef4444",
    Angry: "#dc2626",
    Excited: "#8b5cf6",
    // Add more mood colors as needed
  }

  // Default color for moods not in the map
  const DEFAULT_COLOR = "#6b7280"

  // Get color for a mood
  const getMoodColor = (mood: string) => {
    return MOOD_COLORS[mood] || DEFAULT_COLOR
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>☺️<span className="px-0.5"></span>Mood Distribution</CardTitle>
          <CardDescription>No mood data available for the selected period</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-gray-500">No mood data recorded</p>
        </CardContent>
      </Card>
    )
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, index, mood, count }: any) => {
    const radius = outerRadius + (isMobile ? 10 : 20); // Adjust distance from pie edge
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text
        x={x}
        y={y}
        fill="#000" // Label text color
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontSize: isMobile ? '11px' : '12px' }} // Responsive font size
      >
        {`${mood}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>☺️<span className="px-1"> </span>Mood Distribution</CardTitle>
        <CardDescription>Frequency of different moods during the period</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={isMobile ? 70 : 80}
              fill="#8884d8"
              dataKey="count"
              nameKey="mood"
              label={renderCustomizedLabel} // Use the custom rendering function
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getMoodColor(entry.mood)} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name, props) => [`${value} occurrences`, props.payload.mood]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
