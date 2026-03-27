/* eslint-disable */

// @ts-nocheck

import { IDL } from '@icp-sdk/core/candid';

export const ClientId = IDL.Nat;
export const Time = IDL.Int;
export const CreateLogEntryDto = IDL.Record({
  'weight' : IDL.Float64,
  'height' : IDL.Float64,
  'clientId' : ClientId,
  'stepsDaily' : IDL.Nat,
  'hipCm' : IDL.Float64,
  'proteinIntake' : IDL.Float64,
  'calorieIntake' : IDL.Float64,
  'waterIntake' : IDL.Float64,
  'date' : Time,
  'attendance' : IDL.Bool,
  'cardioDuration' : IDL.Float64,
  'dietPercent' : IDL.Float64,
  'workoutsToday' : IDL.Text,
  'waistCm' : IDL.Float64,
  'sleepHours' : IDL.Float64,
});
export const LogEntryId = IDL.Nat;
export const UserRole = IDL.Variant({
  'admin' : IDL.Null,
  'user' : IDL.Null,
  'guest' : IDL.Null,
});
export const CreateClientDto = IDL.Record({
  'name' : IDL.Text,
  'notes' : IDL.Opt(IDL.Text),
});
export const Client = IDL.Record({
  'id' : ClientId,
  'name' : IDL.Text,
  'notes' : IDL.Opt(IDL.Text),
});
export const UserProfile = IDL.Record({ 'name' : IDL.Text });
export const LogEntry = IDL.Record({
  'id' : LogEntryId,
  'weight' : IDL.Float64,
  'height' : IDL.Float64,
  'clientId' : ClientId,
  'stepsDaily' : IDL.Nat,
  'hipCm' : IDL.Float64,
  'proteinIntake' : IDL.Float64,
  'calorieIntake' : IDL.Float64,
  'waterIntake' : IDL.Float64,
  'date' : Time,
  'attendance' : IDL.Bool,
  'cardioDuration' : IDL.Float64,
  'dietPercent' : IDL.Float64,
  'workoutsToday' : IDL.Text,
  'waistCm' : IDL.Float64,
  'sleepHours' : IDL.Float64,
});

const serviceDefinition = {
  '_initializeAccessControlWithSecret' : IDL.Func([IDL.Text], [], []),
  'addLogEntry' : IDL.Func([CreateLogEntryDto], [LogEntryId], []),
  'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
  'createClient' : IDL.Func([CreateClientDto], [ClientId], []),
  'deleteClient' : IDL.Func([ClientId], [], []),
  'getAllClients' : IDL.Func([], [IDL.Vec(Client)], ['query']),
  'getCallerUserProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
  'getCallerUserRole' : IDL.Func([], [UserRole], ['query']),
  'getClient' : IDL.Func([ClientId], [Client], ['query']),
  'getLogEntriesForClient' : IDL.Func([ClientId], [IDL.Vec(LogEntry)], ['query']),
  'getUserProfile' : IDL.Func([IDL.Principal], [IDL.Opt(UserProfile)], ['query']),
  'isCallerAdmin' : IDL.Func([], [IDL.Bool], ['query']),
  'saveCallerUserProfile' : IDL.Func([UserProfile], [], []),
  'verifyTrainerPin' : IDL.Func([IDL.Text], [IDL.Bool], ['query']),
  'updateTrainerPin' : IDL.Func([IDL.Text], [], []),
  'setClientPin' : IDL.Func([ClientId, IDL.Text], [], []),
  'removeClientPin' : IDL.Func([ClientId], [], []),
  'getAllClientPins' : IDL.Func([], [IDL.Vec(IDL.Tuple(ClientId, IDL.Text))], ['query']),
  'verifyClientPin' : IDL.Func([IDL.Text], [IDL.Opt(ClientId)], ['query']),
};

export const idlService = IDL.Service(serviceDefinition);

export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const ClientId = IDL.Nat;
  const Time = IDL.Int;
  const CreateLogEntryDto = IDL.Record({
    'weight' : IDL.Float64,
    'height' : IDL.Float64,
    'clientId' : ClientId,
    'stepsDaily' : IDL.Nat,
    'hipCm' : IDL.Float64,
    'proteinIntake' : IDL.Float64,
    'calorieIntake' : IDL.Float64,
    'waterIntake' : IDL.Float64,
    'date' : Time,
    'attendance' : IDL.Bool,
    'cardioDuration' : IDL.Float64,
    'dietPercent' : IDL.Float64,
    'workoutsToday' : IDL.Text,
    'waistCm' : IDL.Float64,
    'sleepHours' : IDL.Float64,
  });
  const LogEntryId = IDL.Nat;
  const UserRole = IDL.Variant({
    'admin' : IDL.Null,
    'user' : IDL.Null,
    'guest' : IDL.Null,
  });
  const CreateClientDto = IDL.Record({
    'name' : IDL.Text,
    'notes' : IDL.Opt(IDL.Text),
  });
  const Client = IDL.Record({
    'id' : ClientId,
    'name' : IDL.Text,
    'notes' : IDL.Opt(IDL.Text),
  });
  const UserProfile = IDL.Record({ 'name' : IDL.Text });
  const LogEntry = IDL.Record({
    'id' : LogEntryId,
    'weight' : IDL.Float64,
    'height' : IDL.Float64,
    'clientId' : ClientId,
    'stepsDaily' : IDL.Nat,
    'hipCm' : IDL.Float64,
    'proteinIntake' : IDL.Float64,
    'calorieIntake' : IDL.Float64,
    'waterIntake' : IDL.Float64,
    'date' : Time,
    'attendance' : IDL.Bool,
    'cardioDuration' : IDL.Float64,
    'dietPercent' : IDL.Float64,
    'workoutsToday' : IDL.Text,
    'waistCm' : IDL.Float64,
    'sleepHours' : IDL.Float64,
  });
  return IDL.Service({
    '_initializeAccessControlWithSecret' : IDL.Func([IDL.Text], [], []),
    'addLogEntry' : IDL.Func([CreateLogEntryDto], [LogEntryId], []),
    'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
    'createClient' : IDL.Func([CreateClientDto], [ClientId], []),
    'deleteClient' : IDL.Func([ClientId], [], []),
    'getAllClients' : IDL.Func([], [IDL.Vec(Client)], ['query']),
    'getCallerUserProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    'getCallerUserRole' : IDL.Func([], [UserRole], ['query']),
    'getClient' : IDL.Func([ClientId], [Client], ['query']),
    'getLogEntriesForClient' : IDL.Func([ClientId], [IDL.Vec(LogEntry)], ['query']),
    'getUserProfile' : IDL.Func([IDL.Principal], [IDL.Opt(UserProfile)], ['query']),
    'isCallerAdmin' : IDL.Func([], [IDL.Bool], ['query']),
    'saveCallerUserProfile' : IDL.Func([UserProfile], [], []),
    'verifyTrainerPin' : IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    'updateTrainerPin' : IDL.Func([IDL.Text], [], []),
    'setClientPin' : IDL.Func([ClientId, IDL.Text], [], []),
    'removeClientPin' : IDL.Func([ClientId], [], []),
    'getAllClientPins' : IDL.Func([], [IDL.Vec(IDL.Tuple(ClientId, IDL.Text))], ['query']),
    'verifyClientPin' : IDL.Func([IDL.Text], [IDL.Opt(ClientId)], ['query']),
  });
};

export const init = ({ IDL }) => { return []; };
