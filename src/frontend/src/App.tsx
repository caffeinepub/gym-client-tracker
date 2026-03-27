import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Dumbbell, LogOut, Plus, Settings, Trash2, Users } from "lucide-react";
import { useState } from "react";
import type { Client } from "./backend";
import AddClientDialog from "./components/AddClientDialog";
import ClientDetail from "./components/ClientDetail";
import DeleteClientDialog from "./components/DeleteClientDialog";
import LogEntryForm from "./components/LogEntryForm";
import LoginPage, { type LoginSession } from "./components/LoginPage";
import MasterSettings from "./components/MasterSettings";
import ProgressCharts from "./components/ProgressCharts";
import { useGetAllClients, useGetLogEntries } from "./hooks/useQueries";

function loadSession(): LoginSession | null {
  try {
    const raw = sessionStorage.getItem("gymtrack_session");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.type === "master") return { type: "master" };
    if (parsed?.type === "client" && parsed.clientId !== undefined) {
      return { type: "client", clientId: BigInt(parsed.clientId) };
    }
    return null;
  } catch {
    return null;
  }
}

function saveSession(session: LoginSession) {
  if (session.type === "master") {
    sessionStorage.setItem(
      "gymtrack_session",
      JSON.stringify({ type: "master" }),
    );
  } else {
    sessionStorage.setItem(
      "gymtrack_session",
      JSON.stringify({ type: "client", clientId: session.clientId.toString() }),
    );
  }
}

// Client view — shows only their own data
function ClientView({
  clientId,
  onSignOut,
}: {
  clientId: bigint;
  onSignOut: () => void;
}) {
  const { data: clients = [] } = useGetAllClients();
  const { data: entries = [], isLoading: entriesLoading } =
    useGetLogEntries(clientId);
  const client = clients.find((c) => c.id === clientId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster />
      <header className="border-b bg-card px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Dumbbell className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <span className="font-bold text-foreground text-base">
              GymTrack
            </span>
            {client && (
              <span className="ml-2 text-sm text-muted-foreground">
                — {client.name}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          data-ocid="client_view.button"
          className="gap-2 text-muted-foreground"
          onClick={onSignOut}
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </header>
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-6">
        <LogEntryForm clientId={clientId} entries={entries} />
        <ProgressCharts entries={entries} isLoading={entriesLoading} />
      </main>
    </div>
  );
}

export default function App() {
  const queryClient = useQueryClient();

  const [session, setSession] = useState<LoginSession | null>(loadSession);
  const { data: clients = [], isLoading: clientsLoading } = useGetAllClients();

  const [selectedClientId, setSelectedClientId] = useState<bigint | null>(null);
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [hoveredClientId, setHoveredClientId] = useState<bigint | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const selectedClient = clients.find((c) => c.id === selectedClientId) ?? null;

  const handleLogout = () => {
    sessionStorage.removeItem("gymtrack_session");
    setSession(null);
    queryClient.clear();
    setSelectedClientId(null);
  };

  if (!session) {
    return (
      <LoginPage
        onSuccess={(s) => {
          saveSession(s);
          setSession(s);
        }}
      />
    );
  }

  // Client session: minimal view, only their data
  if (session.type === "client") {
    return <ClientView clientId={session.clientId} onSignOut={handleLogout} />;
  }

  // Master session: full sidebar view
  if (selectedClient) {
    return (
      <div className="min-h-screen bg-background">
        <Toaster />
        <ClientDetail
          client={selectedClient}
          onBack={() => setSelectedClientId(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Toaster />

      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r bg-card">
        <div className="px-4 py-4 border-b">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-lg">GymTrack</span>
          </div>
          <Button
            data-ocid="sidebar.primary_button"
            className="w-full gap-2"
            size="sm"
            onClick={() => setAddClientOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Client
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2" data-ocid="clients.list">
            {clientsLoading ? (
              <div className="space-y-2 p-2" data-ocid="clients.loading_state">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-md" />
                ))}
              </div>
            ) : clients.length === 0 ? (
              <div
                data-ocid="clients.empty_state"
                className="text-center py-8 px-4"
              >
                <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  No clients yet. Add one to get started.
                </p>
              </div>
            ) : (
              clients.map((client, idx) => (
                <button
                  key={client.id.toString()}
                  type="button"
                  data-ocid={`clients.item.${idx + 1}`}
                  className="group relative w-full flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-left hover:bg-accent text-foreground"
                  onClick={() => setSelectedClientId(client.id)}
                  onMouseEnter={() => setHoveredClientId(client.id)}
                  onMouseLeave={() => setHoveredClientId(null)}
                >
                  <span className="text-sm font-medium truncate">
                    {client.name}
                  </span>
                  {hoveredClientId === client.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      data-ocid={`clients.delete_button.${idx + 1}`}
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(client);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </button>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="px-4 py-3 border-t space-y-1">
          <Button
            variant="ghost"
            size="sm"
            data-ocid="sidebar.toggle"
            className="w-full justify-start gap-2 text-xs h-7 text-muted-foreground"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            data-ocid="sidebar.button"
            className="w-full justify-start text-xs h-7"
            onClick={handleLogout}
          >
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div
            data-ocid="main.empty_state"
            className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Select a Client
            </h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              Choose a client from the sidebar to view their progress charts and
              log new entries.
            </p>
          </div>
        </div>
        <footer className="border-t px-8 py-4 mt-8">
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </main>

      {/* Dialogs */}
      <AddClientDialog
        open={addClientOpen}
        onOpenChange={setAddClientOpen}
        onCreated={(id) => setSelectedClientId(id)}
      />

      {deleteTarget && (
        <DeleteClientDialog
          clientId={deleteTarget.id}
          clientName={deleteTarget.name}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => {
            if (selectedClientId === deleteTarget?.id)
              setSelectedClientId(null);
            setDeleteTarget(null);
          }}
        />
      )}

      <MasterSettings
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        clients={clients}
      />
    </div>
  );
}
