import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Dumbbell, KeyRound, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import type { Client } from "./backend";
import AddClientDialog from "./components/AddClientDialog";
import ClientDetail from "./components/ClientDetail";
import DeleteClientDialog from "./components/DeleteClientDialog";
import LoginPage from "./components/LoginPage";
import { useGetAllClients } from "./hooks/useQueries";

export default function App() {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem("gymtrack_session") === "authenticated",
  );

  const { data: clients = [], isLoading: clientsLoading } = useGetAllClients();

  const [selectedClientId, setSelectedClientId] = useState<bigint | null>(null);
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [hoveredClientId, setHoveredClientId] = useState<bigint | null>(null);
  const [changePinOpen, setChangePinOpen] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [pinSaved, setPinSaved] = useState(false);

  const selectedClient = clients.find((c) => c.id === selectedClientId) ?? null;

  const handleLogout = () => {
    sessionStorage.removeItem("gymtrack_session");
    setIsAuthenticated(false);
    queryClient.clear();
    setSelectedClientId(null);
  };

  const handlePinChange = (value: string) => {
    setNewPin(value);
    if (value.length === 4) {
      localStorage.setItem("gymtrack_pin", value);
      setPinSaved(true);
      setTimeout(() => {
        setChangePinOpen(false);
        setNewPin("");
        setPinSaved(false);
      }, 1200);
    }
  };

  if (!isAuthenticated) {
    return (
      <LoginPage
        onSuccess={() => {
          sessionStorage.setItem("gymtrack_session", "authenticated");
          setIsAuthenticated(true);
        }}
      />
    );
  }

  // Full-screen client detail when a client is selected
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
        {/* Sidebar header */}
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

        {/* Client list */}
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

        {/* Sidebar footer */}
        <div className="px-4 py-3 border-t space-y-1">
          <Button
            variant="ghost"
            size="sm"
            data-ocid="sidebar.toggle"
            className="w-full justify-start gap-2 text-xs h-7 text-muted-foreground"
            onClick={() => {
              setNewPin("");
              setPinSaved(false);
              setChangePinOpen(true);
            }}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Change PIN
          </Button>
          <Button
            variant="ghost"
            size="sm"
            data-ocid="sidebar.secondary_button"
            className="w-full justify-start text-xs h-7"
            onClick={handleLogout}
          >
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main content — no client selected */}
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

        {/* Footer */}
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
            if (selectedClientId === deleteTarget?.id) {
              setSelectedClientId(null);
            }
            setDeleteTarget(null);
          }}
        />
      )}

      {/* Change PIN dialog */}
      <Dialog
        open={changePinOpen}
        onOpenChange={(open) => {
          setChangePinOpen(open);
          if (!open) {
            setNewPin("");
            setPinSaved(false);
          }
        }}
      >
        <DialogContent data-ocid="pin.dialog" className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change PIN</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {pinSaved ? (
              <p
                data-ocid="pin.success_state"
                className="text-green-600 font-medium"
              >
                PIN updated successfully!
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground text-center">
                  Enter a new 4-digit PIN
                </p>
                <InputOTP
                  data-ocid="pin.input"
                  maxLength={4}
                  value={newPin}
                  onChange={handlePinChange}
                  pattern={REGEXP_ONLY_DIGITS}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              data-ocid="pin.cancel_button"
              variant="outline"
              onClick={() => setChangePinOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
