import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VraistaCurrentDocument {
  vehicle: string | null;
  plate_number: string | null;
  document_type: string | null;
  expiry_date: string | null;
  days_remaining: number | null;
  current_status: string | null;
}

export function useVraistaCurrentDocuments() {
  return useQuery({
    queryKey: ["vraista", "current-documents"],
    queryFn: async (): Promise<VraistaCurrentDocument[]> => {
      const { data, error } = await supabase
        .from("vraista_current_documents")
        .select(
          "vehicle, plate_number, document_type, expiry_date, days_remaining, current_status"
        )
        .order("days_remaining", { ascending: true });

      if (error) {
        console.error("Vraista current documents query failed:", error);
        throw error;
      }

      return data ?? [];
    },
  });
}