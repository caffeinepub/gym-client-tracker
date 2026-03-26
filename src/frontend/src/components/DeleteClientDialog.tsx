import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDeleteClient } from "../hooks/useQueries";

interface Props {
  clientId: bigint | null;
  clientName: string;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteClientDialog({
  clientId,
  clientName,
  onClose,
  onDeleted,
}: Props) {
  const deleteClient = useDeleteClient();

  const handleConfirm = () => {
    if (clientId === null) return;
    deleteClient.mutate(clientId, {
      onSuccess: () => {
        toast.success(`Client "${clientName}" deleted`);
        onClose();
        onDeleted();
      },
      onError: (err) => {
        toast.error(err.message || "Failed to delete client");
      },
    });
  };

  return (
    <AlertDialog
      open={clientId !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent data-ocid="delete_client.dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Client</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{clientName}</strong>? This
            will permanently remove all their log entries.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            data-ocid="delete_client.cancel_button"
            onClick={onClose}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            data-ocid="delete_client.confirm_button"
            onClick={handleConfirm}
            disabled={deleteClient.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteClient.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
