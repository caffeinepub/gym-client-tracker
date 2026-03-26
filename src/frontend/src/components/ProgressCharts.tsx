import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LogEntry } from "../backend";

interface Props {
  entries: LogEntry[];
  isLoading: boolean;
}

function timeToDate(time: bigint): Date {
  return new Date(Number(time / 1000000n));
}

interface ChartDef {
  key: keyof ChartPoint;
  title: string;
  unit: string;
  color: string;
}

interface ChartPoint {
  date: string;
  height: number;
  weight: number;
  steps: number;
  water: number;
  sleep: number;
  diet: number;
  waist: number;
  hip: number;
  whr: number;
  calories: number;
  protein: number;
  cardio: number;
}

const CHARTS: ChartDef[] = [
  {
    key: "height",
    title: "Height",
    unit: "cm",
    color: "oklch(0.546 0.216 264)",
  },
  {
    key: "weight",
    title: "Weight",
    unit: "kg",
    color: "oklch(0.6 0.118 184.704)",
  },
  {
    key: "steps",
    title: "Steps Daily",
    unit: "steps",
    color: "oklch(0.7 0.19 82)",
  },
  {
    key: "water",
    title: "Water Intake",
    unit: "L",
    color: "oklch(0.55 0.22 300)",
  },
  { key: "sleep", title: "Sleep", unit: "hrs", color: "oklch(0.65 0.19 30)" },
  { key: "diet", title: "Diet", unit: "%", color: "oklch(0.72 0.18 145)" },
  { key: "waist", title: "Waist", unit: "cm", color: "oklch(0.6 0.2 20)" },
  { key: "hip", title: "Hip", unit: "cm", color: "oklch(0.58 0.2 340)" },
  {
    key: "whr",
    title: "Waist-to-Hip Ratio (WHR)",
    unit: "",
    color: "oklch(0.55 0.23 15)",
  },
  {
    key: "calories",
    title: "Calories",
    unit: "kcal",
    color: "oklch(0.68 0.19 55)",
  },
  {
    key: "protein",
    title: "Protein",
    unit: "g",
    color: "oklch(0.62 0.17 210)",
  },
  {
    key: "cardio",
    title: "Cardio",
    unit: "min",
    color: "oklch(0.56 0.21 250)",
  },
];

export default function ProgressCharts({ entries, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CHARTS.map((c) => (
          <div
            key={c.key}
            data-ocid="charts.loading_state"
            className="rounded-lg border bg-card p-5 shadow-card"
          >
            <Skeleton className="h-5 w-32 mb-4" />
            <Skeleton className="h-40 w-full" />
          </div>
        ))}
      </div>
    );
  }

  const data: ChartPoint[] = entries
    .slice()
    .sort((a, b) => Number(a.date - b.date))
    .map((e) => {
      const waist = e.waistCm;
      const hip = e.hipCm;
      const whr = hip > 0 ? Math.round((waist / hip) * 100) / 100 : 0;
      return {
        date: format(timeToDate(e.date), "MMM d, yyyy"),
        height: e.height,
        weight: e.weight,
        steps: Number(e.stepsDaily),
        water: e.waterIntake,
        sleep: e.sleepHours,
        diet: e.dietPercent,
        waist,
        hip,
        whr,
        calories: e.calorieIntake,
        protein: e.proteinIntake,
        cardio: e.cardioDuration,
      };
    });

  const sortedEntries = entries.slice().sort((a, b) => Number(a.date - b.date));

  if (data.length === 0) {
    return (
      <div
        data-ocid="charts.empty_state"
        className="col-span-2 text-center py-16 text-muted-foreground"
      >
        <p className="text-sm">
          No log entries yet. Add the first entry to see charts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CHARTS.map((chart) => (
          <Card key={chart.key} className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {chart.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={data}
                  margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.921 0.005 240)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "oklch(0.52 0.018 264)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "oklch(0.52 0.018 264)" }}
                    tickLine={false}
                    axisLine={false}
                    unit={chart.unit ? ` ${chart.unit}` : ""}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid oklch(0.921 0.005 240)",
                      borderRadius: "8px",
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [
                      chart.unit ? `${v} ${chart.unit}` : `${v}`,
                      chart.title,
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey={chart.key}
                    stroke={chart.color}
                    strokeWidth={2}
                    dot={{ r: 4, fill: chart.color }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Attendance & Workouts History Table */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Attendance &amp; Workouts History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table data-ocid="charts.table">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Workouts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEntries.map((e, idx) => (
                <TableRow
                  key={e.id.toString()}
                  data-ocid={`charts.row.${idx + 1}`}
                >
                  <TableCell className="text-sm">
                    {format(timeToDate(e.date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    {e.attendance ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Present
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-muted-foreground"
                      >
                        Absent
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{e.workoutsToday}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
