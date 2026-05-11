import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";

interface ScoreDialProps {
  score: number;
  label: string;
  size?: number;
}

export default function ScoreDial({ score, label, size = 120 }: ScoreDialProps) {
  const data = [
    { name: "score", value: score },
    { name: "remaining", value: 100 - score },
  ];

  const getColor = (value: number) => {
    if (value >= 80) return "#10b981"; // Emerald
    if (value >= 50) return "#f59e0b"; // Amber
    return "#ef4444"; // Red
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2 score-dial-container">
      <div style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={size / 2.8}
              outerRadius={size / 2}
              startAngle={90}
              endAngle={450}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={getColor(score)} />
              <Cell fill="var(--chart-bg, rgba(255, 255, 255, 0.05))" />
              <Label
                value={`${score}%`}
                position="center"
                fill="var(--chart-text, white)"
                style={{ fontSize: size / 6, fontWeight: 700 }}
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold print:text-black/60">{label}</span>
    </div>
  );
}
