import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CreateLogEntryDto {
    weight: number;
    height: number;
    clientId: ClientId;
    stepsDaily: bigint;
    hipCm: number;
    proteinIntake: number;
    calorieIntake: number;
    waterIntake: number;
    date: Time;
    attendance: boolean;
    cardioDuration: number;
    dietPercent: number;
    workoutsToday: string;
    waistCm: number;
    sleepHours: number;
}
export type Time = bigint;
export interface LogEntry {
    id: LogEntryId;
    weight: number;
    height: number;
    clientId: ClientId;
    stepsDaily: bigint;
    hipCm: number;
    proteinIntake: number;
    calorieIntake: number;
    waterIntake: number;
    date: Time;
    attendance: boolean;
    cardioDuration: number;
    dietPercent: number;
    workoutsToday: string;
    waistCm: number;
    sleepHours: number;
}
export interface CreateClientDto {
    name: string;
    notes?: string;
}
export interface Client {
    id: ClientId;
    name: string;
    notes?: string;
}
export type LogEntryId = bigint;
export interface UserProfile {
    name: string;
}
export type ClientId = bigint;
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addLogEntry(dto: CreateLogEntryDto): Promise<LogEntryId>;
    assignCallerUserRole(user: Principal, role: string): Promise<void>;
    createClient(dto: CreateClientDto): Promise<ClientId>;
    deleteClient(clientId: ClientId): Promise<void>;
    getAllClients(): Promise<Array<Client>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<string>;
    getClient(id: ClientId): Promise<Client>;
    getLogEntriesForClient(clientId: ClientId): Promise<Array<LogEntry>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
