import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Key, Shield, Trash2, UserCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Client } from "../backend";
import { useActor } from "../hooks/useActor";
import {
  useGetAllClientPins,
  useRemoveClientPin,
  useSetClientPin,
} from "../hooks/useQueries";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  clients: Client[];
}

function MasterPinTab() {
  const { actor } = useActor();
  const [newPin, setNewPin] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (newPin.length !== 4 || !actor) return;
    setSaving(true);
    try {
      await (actor as any).updateTrainerPin(newPin);
      setSaved(true);
      setNewPin("");
      setTimeout(() => setSaved(false), 2000);
    } catch (_) {
      toast.error("Failed to update PIN");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {saved ? (
        <p data-ocid="pin.success_state" className="text-green-600 font-medium">
          PIN updated successfully!
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground text-center">
            Enter a new 4-digit master PIN
          </p>
          <InputOTP
            data-ocid="pin.input"
            maxLength={4}
            value={newPin}
            onChange={setNewPin}
            pattern={REGEXP_ONLY_DIGITS}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
          <Button
            data-ocid="pin.save_button"
            className="w-full"
            disabled={newPin.length !== 4 || saving || !actor}
            onClick={handleSave}
          >
            {saving ? "Saving..." : "Save PIN"}
          </Button>
        </>
      )}
    </div>
  );
}

function ClientPinsTab({ clients }: { clients: Client[] }) {
  const { data: clientPins = [] } = useGetAllClientPins();
  const setPin = useSetClientPin();
  const removePin = useRemoveClientPin();
  const [pinInputs, setPinInputs] = useState<Record<string, string>>({});

  const getPinForClient = (clientId: bigint): string | null => {
    const entry = clientPins.find(([id]) => id === clientId);
    return entry ? entry[1] : null;
  };

  const handleSet = (clientId: bigint) => {
    const pin = pinInputs[clientId.toString()] ?? "";
    if (pin.length !== 4) return;
    setPin.mutate(
      { clientId, pin },
      {
        onSuccess: () => {
          toast.success("Client PIN set");
          setPinInputs((prev) => ({ ...prev, [clientId.toString()]: "" }));
        },
        onError: () => toast.error("Failed to set PIN"),
      },
    );
  };

  const handleRemove = (clientId: bigint) => {
    removePin.mutate(clientId, {
      onSuccess: () => toast.success("PIN removed"),
      onError: () => toast.error("Failed to remove PIN"),
    });
  };

  return (
    <div className="space-y-3 py-2 max-h-80 overflow-y-auto pr-1">
      {clients.length === 0 ? (
        <p
          data-ocid="client_pins.empty_state"
          className="text-sm text-muted-foreground text-center py-6"
        >
          No clients yet. Add a client first.
        </p>
      ) : (
        clients.map((client, idx) => {
          const existingPin = getPinForClient(client.id);
          const inputVal = pinInputs[client.id.toString()] ?? "";
          return (
            <div
              key={client.id.toString()}
              data-ocid={`client_pins.item.${idx + 1}`}
              className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{client.name}</p>
                {existingPin ? (
                  <Badge variant="secondary" className="text-xs mt-0.5">
                    <Key className="w-2.5 h-2.5 mr-1" />
                    PIN set
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">No PIN</span>
                )}
              </div>
              <Input
                data-ocid={`client_pins.input.${idx + 1}`}
                className="w-20 text-center"
                maxLength={4}
                placeholder="0000"
                value={inputVal}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setPinInputs((prev) => ({
                    ...prev,
                    [client.id.toString()]: val,
                  }));
                }}
              />
              <Button
                data-ocid={`client_pins.save_button.${idx + 1}`}
                size="sm"
                disabled={inputVal.length !== 4 || setPin.isPending}
                onClick={() => handleSet(client.id)}
              >
                Set
              </Button>
              {existingPin && (
                <Button
                  data-ocid={`client_pins.delete_button.${idx + 1}`}
                  size="sm"
                  variant="destructive"
                  disabled={removePin.isPending}
                  onClick={() => handleRemove(client.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default function MasterSettings({ open, onOpenChange, clients }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-ocid="settings.dialog" className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Master Access Settings
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="master-pin">
          <TabsList className="w-full">
            <TabsTrigger
              value="master-pin"
              className="flex-1 gap-1.5"
              data-ocid="settings.tab"
            >
              <Shield className="w-3.5 h-3.5" />
              Master PIN
            </TabsTrigger>
            <TabsTrigger
              value="client-pins"
              className="flex-1 gap-1.5"
              data-ocid="settings.tab"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Client PINs
            </TabsTrigger>
          </TabsList>
          <TabsContent value="master-pin">
            <MasterPinTab />
          </TabsContent>
          <TabsContent value="client-pins">
            <ClientPinsTab clients={clients} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
