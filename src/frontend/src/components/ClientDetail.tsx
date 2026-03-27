import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import type { Client } from "../backend";
import { useGetLogEntries } from "../hooks/useQueries";
import LogEntryForm from "./LogEntryForm";
import ProgressCharts from "./ProgressCharts";

interface Props {
  client: Client;
  onBack: () => void;
}

export default function ClientDetail({ client, onBack }: Props) {
  const { data: entries = [], isLoading } = useGetLogEntries(client.id);

  return (
    <motion.div
      key={client.id.toString()}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen flex flex-col"
    >
      {/* Top bar */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            data-ocid="client_detail.secondary_button"
            onClick={onBack}
            className="h-9 w-9 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-foreground truncate">
              {client.name}
            </h2>
            {client.notes && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {client.notes}
              </p>
            )}
          </div>
          <LogEntryForm clientId={client.id} entries={entries} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 lg:p-8">
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-base font-semibold text-foreground">
            Progress Charts
          </h3>
          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </span>
        </div>
        <ProgressCharts entries={entries} isLoading={isLoading} />
      </div>

      {/* Footer */}
      <footer className="border-t px-8 py-4">
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
    </motion.div>
  );
}
