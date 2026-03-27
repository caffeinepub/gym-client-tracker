import AccessControl "authorization/access-control";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Prim "mo:prim";

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

  public type UserRole = {
    #admin;
    #user;
    #guest;
  };

  let accessControlState = AccessControl.initState();
  let _unusedAcs = accessControlState;

  let userProfiles = Map.empty<Principal, UserProfile>();
  let clients = Map.empty<ClientId, Client>();
  let logEntries = Map.empty<LogEntryId, LogEntry>();
  let clientPins = Map.empty<ClientId, Text>();

  var nextClientId = 0;
  var nextLogEntryId = 0;
  var trainerPin : Text = "1234";

  let dayNs : Int = 86_400_000_000_000;

  public shared ({ caller }) func _initializeAccessControlWithSecret(userSecret : Text) : async () {
    switch (Prim.envVar<system>("CAFFEINE_ADMIN_TOKEN")) {
      case (null) {};
      case (?adminToken) {
        AccessControl.initialize(accessControlState, caller, adminToken, userSecret);
      };
    };
  };

  public query ({ caller = _ }) func getCallerUserProfile() : async ?UserProfile {
    null;
  };

  public query ({ caller = _ }) func getUserProfile(_user : Principal) : async ?UserProfile {
    null;
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  public shared func assignCallerUserRole(_user : Principal, _role : UserRole) : async () {
    ();
  };

  public query func getCallerUserRole() : async UserRole {
    #admin;
  };

  public query func isCallerAdmin() : async Bool {
    true;
  };

  public query func verifyTrainerPin(pin : Text) : async Bool {
    pin == trainerPin;
  };

  public shared func updateTrainerPin(pin : Text) : async () {
    trainerPin := pin;
  };

  public shared func setClientPin(clientId : ClientId, pin : Text) : async () {
    ignore getClientInternal(clientId);
    clientPins.add(clientId, pin);
  };

  public shared func removeClientPin(clientId : ClientId) : async () {
    clientPins.remove(clientId);
  };

  public query func getAllClientPins() : async [(ClientId, Text)] {
    clientPins.entries().toArray();
  };

  public query func verifyClientPin(pin : Text) : async ?ClientId {
    var found : ?ClientId = null;
    for ((cid, p) in clientPins.entries()) {
      if (p == pin) {
        found := ?cid;
      };
    };
    found;
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
    clientPins.remove(clientId);
    let toDelete = logEntries.entries().toArray().filter(
      func((_, entry) : (LogEntryId, LogEntry)) : Bool {
        entry.clientId == clientId;
      },
    );
    for ((eid, _) in toDelete.vals()) {
      logEntries.remove(eid);
    };
  };

  public shared func addLogEntry(dto : CreateLogEntryDto) : async LogEntryId {
    ignore getClientInternal(dto.clientId);
    let dayKey = dto.date / dayNs;

    var existingId : ?LogEntryId = null;
    for ((eid, entry) in logEntries.entries()) {
      if (entry.clientId == dto.clientId and entry.date / dayNs == dayKey) {
        existingId := ?eid;
      };
    };

    let id = switch (existingId) {
      case (?eid) { eid };
      case (null) {
        let newId = nextLogEntryId;
        nextLogEntryId += 1;
        newId;
      };
    };

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
      func(entry : LogEntry) : Bool {
        entry.clientId == clientId;
      },
    );
    filtered.sort(compareLogEntries);
  };
};
