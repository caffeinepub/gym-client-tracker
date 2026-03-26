import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Dumbbell } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface LoginPageProps {
  onSuccess: () => void;
}

export default function LoginPage({ onSuccess }: LoginPageProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleChange = (value: string) => {
    setPin(value);
    setError(false);
    if (value.length === 4) {
      const stored = localStorage.getItem("gymtrack_pin") ?? "1234";
      if (value === stored) {
        onSuccess();
      } else {
        setShake(true);
        setError(true);
        setTimeout(() => {
          setShake(false);
          setPin("");
        }, 600);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-sm px-6">
        <div className="flex items-center justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-card">
            <Dumbbell className="w-7 h-7 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">GymTrack</h1>
        <p className="text-muted-foreground mb-8 text-base">
          Enter your 4-digit PIN to continue
        </p>

        <div
          data-ocid="login.dialog"
          className={`flex flex-col items-center gap-4 ${
            shake ? "animate-shake" : ""
          }`}
        >
          <InputOTP
            data-ocid="login.input"
            maxLength={4}
            value={pin}
            onChange={handleChange}
            pattern={REGEXP_ONLY_DIGITS}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>

          {error && (
            <p
              data-ocid="login.error_state"
              className="text-destructive text-sm font-medium"
            >
              Incorrect PIN
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
