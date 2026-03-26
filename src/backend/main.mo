import AccessControl "authorization/access-control";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";

actor {
  type ClientId = Nat;
  type LogEntryId = Nat;

  public type Client = {
    id : ClientId;
    name : Text;
    notes : ?Text;
  };

  public type CreateClientDto = {
    name : Text;
    notes : ?Text;
  };

  public type LogEntry = {
    id : LogEntryId;
    clientId : ClientId;
    date : Time.Time;
    height : Float;
    weight : Float;
    stepsDaily : Nat;
    waterIntake : Float;
    sleepHours : Float;
    dietPercent : Float;
    attendance : Bool;
    waistCm : Float;
    hipCm : Float;
    calorieIntake : Float;
    proteinIntake : Float;
    cardioDuration : Float;
    workoutsToday : Text;
  };

  public type CreateLogEntryDto = {
    clientId : ClientId;
    date : Time.Time;
    height : Float;
    weight : Float;
    stepsDaily : Nat;
    waterIntake : Float;
    sleepHours : Float;
    dietPercent : Float;
    attendance : Bool;
    waistCm : Float;
    hipCm : Float;
    calorieIntake : Float;
    proteinIntake : Float;
    cardioDuration : Float;
    workoutsToday : Text;
  };

  func compareLogEntries(a : LogEntry, b : LogEntry) : Order.Order {
    Int.compare(a.date, b.date);
  };

  public type UserProfile = {
    name : Text;
  };

  // Kept for upgrade compatibility with the previous version that used authorization.
  // Do not remove until a migration function is in place.
  let accessControlState = AccessControl.initState();

  let _unusedAcs = accessControlState; // suppress unused warning

  let userProfiles = Map.empty<Principal, UserProfile>();
  let clients = Map.empty<ClientId, Client>();
  let logEntries = Map.empty<LogEntryId, LogEntry>();

  var nextClientId = 0;
  var nextLogEntryId = 0;

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  public shared func assignCallerUserRole(_user : Principal, _role : Text) : async () {
    ();
  };

  public query func getCallerUserRole() : async Text {
    "admin";
  };

  public query func isCallerAdmin() : async Bool {
    true;
  };

  func getClientInternal(id : ClientId) : Client {
    switch (clients.get(id)) {
      case (null) { Runtime.trap("Client not found") };
      case (?client) { client };
    };
  };

  public shared func createClient(dto : CreateClientDto) : async ClientId {
    let id = nextClientId;
    nextClientId += 1;
    let client : Client = {
      id;
      name = dto.name;
      notes = dto.notes;
    };
    clients.add(id, client);
    id;
  };

  public query func getClient(id : ClientId) : async Client {
    getClientInternal(id);
  };

  public query func getAllClients() : async [Client] {
    clients.values().toArray();
  };

  public shared func deleteClient(clientId : ClientId) : async () {
    ignore getClientInternal(clientId);
    clients.remove(clientId);
    let filtered = logEntries.toArray().filter(
      func((_, entry)) { entry.clientId != clientId }
    );
    logEntries.clear();
    for ((id, entry) in filtered.values()) {
      logEntries.add(id, entry);
    };
  };

  public shared func addLogEntry(dto : CreateLogEntryDto) : async LogEntryId {
    ignore getClientInternal(dto.clientId);
    let id = nextLogEntryId;
    nextLogEntryId += 1;
    let logEntry : LogEntry = {
      id;
      clientId = dto.clientId;
      date = dto.date;
      height = dto.height;
      weight = dto.weight;
      stepsDaily = dto.stepsDaily;
      waterIntake = dto.waterIntake;
      sleepHours = dto.sleepHours;
      dietPercent = dto.dietPercent;
      attendance = dto.attendance;
      waistCm = dto.waistCm;
      hipCm = dto.hipCm;
      calorieIntake = dto.calorieIntake;
      proteinIntake = dto.proteinIntake;
      cardioDuration = dto.cardioDuration;
      workoutsToday = dto.workoutsToday;
    };
    logEntries.add(id, logEntry);
    id;
  };

  public query func getLogEntriesForClient(clientId : ClientId) : async [LogEntry] {
    ignore getClientInternal(clientId);
    let filtered = logEntries.values().toArray().filter(
      func(entry) { entry.clientId == clientId }
    );
    filtered.sort(compareLogEntries);
  };
};
