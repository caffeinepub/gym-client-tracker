import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Client, LogEntry } from "../backend";
import { useActor } from "./useActor";

export function useGetAllClients() {
  const { actor, isFetching } = useActor();
  return useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllClients();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLogEntries(clientId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<LogEntry[]>({
    queryKey: ["logEntries", clientId?.toString()],
    queryFn: async () => {
      if (!actor || clientId === null) return [];
      return actor.getLogEntriesForClient(clientId);
    },
    enabled: !!actor && !isFetching && clientId !== null,
  });
}

export function useCreateClient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, notes }: { name: string; notes?: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createClient({ name, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useDeleteClient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (clientId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteClient(clientId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

interface AddLogEntryInput {
  date: string;
  height: number;
  weight: number;
  steps: number;
  waterIntake: number;
  sleepHours: number;
  dietPercent: number;
  attendance: boolean;
  waistCm: number;
  hipCm: number;
  calorieIntake: number;
  proteinIntake: number;
  cardioDuration: number;
  workoutsToday: string;
}

export function useAddLogEntry(clientId: bigint | null) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AddLogEntryInput) => {
      if (!actor || clientId === null) throw new Error("Not connected");
      const dateMs = Date.parse(data.date);
      return actor.addLogEntry({
        clientId,
        date: BigInt(dateMs) * 1000000n,
        height: data.height,
        weight: data.weight,
        stepsDaily: BigInt(data.steps),
        waterIntake: data.waterIntake,
        sleepHours: data.sleepHours,
        dietPercent: data.dietPercent,
        attendance: data.attendance,
        waistCm: data.waistCm,
        hipCm: data.hipCm,
        calorieIntake: data.calorieIntake,
        proteinIntake: data.proteinIntake,
        cardioDuration: data.cardioDuration,
        workoutsToday: data.workoutsToday,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["logEntries", clientId?.toString()],
      });
    },
  });
}
