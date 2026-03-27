import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Dumbbell, Shield, User } from "lucide-react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";

export type LoginSession =
  | { type: "master" }
  | { type: "client"; clientId: bigint };

interface LoginPageProps {
  onSuccess: (session: LoginSession) => void;
}

function PinInput({
  onVerify,
  loading: parentLoading,
  isLoading,
}: {
  onVerify: (pin: string) => Promise<boolean>;
  loading: boolean;
  isLoading: boolean;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePin = async (value: string) => {
    setPin(value);
    setError(false);
    if (value.length === 4 && !loading && !parentLoading) {
      setLoading(true);
      try {
        const ok = await onVerify(value);
        if (ok) return;
      } catch (_) {
        // fall through
      } finally {
        setLoading(false);
      }
      setShake(true);
      setError(true);
      setTimeout(() => {
        setShake(false);
        setPin("");
      }, 600);
    }
  };

  return (
    <div
      className={`flex flex-col items-center gap-3 ${shake ? "animate-shake" : ""}`}
    >
      {isLoading ? (
        <div className="h-10 flex items-center">
          <span className="text-sm text-muted-foreground">Connecting...</span>
        </div>
      ) : (
        <InputOTP
          data-ocid="login.input"
          maxLength={4}
          value={pin}
          onChange={handlePin}
          pattern={REGEXP_ONLY_DIGITS}
          disabled={loading}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
      )}
      {error && (
        <p
          data-ocid="login.error_state"
          className="text-destructive text-sm font-medium"
        >
          Incorrect PIN
        </p>
      )}
      {loading && (
        <p
          data-ocid="login.loading_state"
          className="text-muted-foreground text-xs"
        >
          Verifying...
        </p>
      )}
    </div>
  );
}

export default function LoginPage({ onSuccess }: LoginPageProps) {
  const { actor, isFetching } = useActor();
  const isLoading = isFetching || !actor;
  const [tab, setTab] = useState("master");

  const verifyMaster = async (pin: string): Promise<boolean> => {
    if (!actor) return false;
    try {
      const ok = await (actor as any).verifyTrainerPin(pin);
      if (ok === true) {
        onSuccess({ type: "master" });
        return true;
      }
    } catch (_) {}
    return false;
  };

  const verifyClient = async (pin: string): Promise<boolean> => {
    if (!actor) return false;
    try {
      const clientId = await (actor as any).verifyClientPin(pin);
      if (clientId !== null && clientId !== undefined) {
        onSuccess({ type: "client", clientId: clientId as bigint });
        return true;
      }
    } catch (_) {}
    return false;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
            <Dumbbell className="w-7 h-7 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-1">GymTrack</h1>
        <p className="text-muted-foreground text-sm">
          Enter your 4-digit PIN to continue
        </p>
      </div>

      <div
        data-ocid="login.card"
        className="border-2 border-primary/30 rounded-2xl p-6 bg-card w-full max-w-sm"
      >
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full mb-6">
            <TabsTrigger
              value="master"
              className="flex-1 gap-1.5"
              data-ocid="login.tab"
            >
              <Shield className="w-3.5 h-3.5" />
              Master
            </TabsTrigger>
            <TabsTrigger
              value="client"
              className="flex-1 gap-1.5"
              data-ocid="login.tab"
            >
              <User className="w-3.5 h-3.5" />
              Client
            </TabsTrigger>
          </TabsList>

          <TabsContent value="master">
            <div className="flex flex-col items-center gap-4">
              <Badge variant="secondary" className="mb-1">
                <Shield className="w-3 h-3 mr-1" />
                Master Access
              </Badge>
              <p className="text-sm text-muted-foreground text-center">
                Trainer login — full access to all clients
              </p>
              <PinInput
                onVerify={verifyMaster}
                loading={false}
                isLoading={isLoading}
              />
            </div>
          </TabsContent>

          <TabsContent value="client">
            <div className="flex flex-col items-center gap-4">
              <Badge variant="outline" className="mb-1">
                <User className="w-3 h-3 mr-1" />
                Client Access
              </Badge>
              <p className="text-sm text-muted-foreground text-center">
                Client login — view and update your own data
              </p>
              <PinInput
                onVerify={verifyClient}
                loading={false}
                isLoading={isLoading}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
