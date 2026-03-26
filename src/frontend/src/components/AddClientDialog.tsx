import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateClient } from "../hooks/useQueries";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (id: bigint) => void;
}

export default function AddClientDialog({
  open,
  onOpenChange,
  onCreated,
}: Props) {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const createClient = useCreateClient();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createClient.mutate(
      { name: name.trim(), notes: notes.trim() || undefined },
      {
        onSuccess: (id) => {
          toast.success(`Client "${name.trim()}" added`);
          setName("");
          setNotes("");
          onOpenChange(false);
          onCreated(id);
        },
        onError: (err) => {
          toast.error(err.message || "Failed to add client");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-ocid="add_client.dialog" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="client-name"
              data-ocid="add_client.input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Connor"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-notes">
              Notes{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Textarea
              id="client-notes"
              data-ocid="add_client.textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Fitness goals, medical notes..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="add_client.cancel_button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="add_client.submit_button"
              disabled={createClient.isPending || !name.trim()}
            >
              {createClient.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                </>
              ) : (
                "Add Client"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
