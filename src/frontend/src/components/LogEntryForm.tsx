import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { LogEntry } from "../backend";
import { useAddLogEntry } from "../hooks/useQueries";

interface Props {
  clientId: bigint;
  entries?: LogEntry[];
}

function entryToDate(entry: LogEntry): string {
  const ms = Number(entry.date / 1000000n);
  return new Date(ms).toISOString().split("T")[0];
}

function getRefValues(entries: LogEntry[], date: string) {
  const exact = entries.find((e) => entryToDate(e) === date);
  if (exact) return { entry: exact, isExact: true };
  if (entries.length > 0) {
    const sorted = [...entries].sort((a, b) => Number(b.date - a.date));
    return { entry: sorted[0], isExact: false };
  }
  return { entry: null, isExact: false };
}

function numStr(val: number): string {
  return val === 0 ? "" : String(val);
}

export default function LogEntryForm({ clientId, entries = [] }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(today);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [steps, setSteps] = useState("");
  const [water, setWater] = useState("");
  const [sleep, setSleep] = useState("");
  const [diet, setDiet] = useState("");
  const [attendance, setAttendance] = useState<"present" | "absent" | "">("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [cardio, setCardio] = useState("");
  const [workouts, setWorkouts] = useState("");

  const addEntry = useAddLogEntry(clientId);

  function applyEntry(entry: LogEntry) {
    setHeight(numStr(entry.height));
    setWeight(numStr(entry.weight));
    setSteps(numStr(Number(entry.stepsDaily)));
    setWater(numStr(entry.waterIntake));
    setSleep(numStr(entry.sleepHours));
    setDiet(numStr(entry.dietPercent));
    setWaist(numStr(entry.waistCm));
    setHip(numStr(entry.hipCm));
    setCalories(numStr(entry.calorieIntake));
    setProtein(numStr(entry.proteinIntake));
    setCardio(numStr(entry.cardioDuration));
    setWorkouts(entry.workoutsToday);
    // Attendance intentionally not pre-filled — user must choose
  }

  const handleOpen = () => {
    if (entries.length > 0) {
      const { entry } = getRefValues(entries, today);
      if (entry) applyEntry(entry);
    }
    setDate(today);
    setAttendance("");
    setOpen(true);
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    if (entries.length > 0) {
      const { entry } = getRefValues(entries, newDate);
      if (entry) applyEntry(entry);
    }
  };

  const isExistingDate = entries.some((e) => entryToDate(e) === date);

  const resetForm = () => {
    setDate(today);
    setHeight("");
    setWeight("");
    setSteps("");
    setWater("");
    setSleep("");
    setDiet("");
    setAttendance("");
    setWaist("");
    setHip("");
    setCalories("");
    setProtein("");
    setCardio("");
    setWorkouts("");
  };

  const resolveNum = (
    val: string,
    ref: number | null,
    isInt = false,
  ): number => {
    const parsed = isInt ? Number.parseInt(val, 10) : Number.parseFloat(val);
    if (!Number.isNaN(parsed)) return parsed;
    if (ref !== null) return ref;
    return 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { entry: ref } = getRefValues(entries, date);

    addEntry.mutate(
      {
        date,
        height: resolveNum(height, ref ? ref.height : null),
        weight: resolveNum(weight, ref ? ref.weight : null),
        steps: resolveNum(steps, ref ? Number(ref.stepsDaily) : null, true),
        waterIntake: resolveNum(water, ref ? ref.waterIntake : null),
        sleepHours: resolveNum(sleep, ref ? ref.sleepHours : null),
        dietPercent: resolveNum(diet, ref ? ref.dietPercent : null),
        attendance: attendance === "present",
        waistCm: resolveNum(waist, ref ? ref.waistCm : null),
        hipCm: resolveNum(hip, ref ? ref.hipCm : null),
        calorieIntake: resolveNum(calories, ref ? ref.calorieIntake : null),
        proteinIntake: resolveNum(protein, ref ? ref.proteinIntake : null),
        cardioDuration: resolveNum(cardio, ref ? ref.cardioDuration : null),
        workoutsToday:
          workouts.trim() !== "" ? workouts : ref ? ref.workoutsToday : "",
      },
      {
        onSuccess: () => {
          toast.success("Log entry saved");
          resetForm();
          setOpen(false);
        },
        onError: (err) => {
          toast.error((err as Error).message || "Failed to save entry");
        },
      },
    );
  };

  if (!open) {
    return (
      <Button
        data-ocid="log_entry.open_modal_button"
        onClick={handleOpen}
        className="gap-2"
      >
        <Plus className="w-4 h-4" />
        Log Entry
      </Button>
    );
  }

  return (
    <Card data-ocid="log_entry.card" className="border shadow-card w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            New Log Entry
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            data-ocid="log_entry.close_button"
            onClick={() => setOpen(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isExistingDate && (
            <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              An entry for this date already exists and will be updated.
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="log-date">Date</Label>
              <Input
                id="log-date"
                data-ocid="log_entry.input"
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="log-height">Height (cm)</Label>
              <Input
                id="log-height"
                type="number"
                step="0.1"
                min="50"
                max="300"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="175.0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="log-weight">Weight (kg)</Label>
              <Input
                id="log-weight"
                type="number"
                step="0.1"
                min="20"
                max="500"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="70.0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="log-steps">Steps Daily</Label>
              <Input
                id="log-steps"
                type="number"
                min="0"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                placeholder="8000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="log-water">Water Intake (L)</Label>
              <Input
                id="log-water"
                type="number"
                step="0.1"
                min="0"
                max="20"
                value={water}
                onChange={(e) => setWater(e.target.value)}
                placeholder="2.5"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="log-sleep">Sleep (hours)</Label>
              <Input
                id="log-sleep"
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={sleep}
                onChange={(e) => setSleep(e.target.value)}
                placeholder="7.5"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="log-diet">Diet (%)</Label>
              <Input
                id="log-diet"
                type="number"
                min="0"
                max="100"
                step="1"
                value={diet}
                onChange={(e) => setDiet(e.target.value)}
                placeholder="85"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="log-attendance">Attendance</Label>
              <Select
                value={attendance}
                onValueChange={(v) => setAttendance(v as "present" | "absent")}
              >
                <SelectTrigger id="log-attendance" data-ocid="log_entry.select">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="log-waist">Waist (cm)</Label>
              <Input
                id="log-waist"
                type="number"
                step="0.1"
                min="30"
                max="300"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                placeholder="80.0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="log-hip">Hip (cm)</Label>
              <Input
                id="log-hip"
                type="number"
                step="0.1"
                min="30"
                max="300"
                value={hip}
                onChange={(e) => setHip(e.target.value)}
                placeholder="95.0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="log-calories">Calories (kcal)</Label>
              <Input
                id="log-calories"
                type="number"
                min="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="2000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="log-protein">Protein (g)</Label>
              <Input
                id="log-protein"
                type="number"
                step="0.1"
                min="0"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="150"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="log-cardio">Cardio (min)</Label>
              <Input
                id="log-cardio"
                type="number"
                min="0"
                value={cardio}
                onChange={(e) => setCardio(e.target.value)}
                placeholder="30"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="log-workouts">Workouts Today</Label>
              <Input
                id="log-workouts"
                type="text"
                value={workouts}
                onChange={(e) => setWorkouts(e.target.value)}
                placeholder="Chest, Triceps"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="log_entry.submit_button"
              disabled={addEntry.isPending}
            >
              {addEntry.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Entry"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
