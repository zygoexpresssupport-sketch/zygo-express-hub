import { useVraistaCurrentDocuments } from "@/hooks/use-vraista";

export default function Admin() {
  const {
    data: documents = [],
    isLoading,
    isError,
  } = useVraistaCurrentDocuments();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Vraista Compliance</h1>
          <p className="text-sm text-muted-foreground">
            Current vehicle document compliance status
          </p>
        </div>

        {isLoading && (
          <div className="rounded-lg border p-6 text-sm">
            Loading compliance records…
          </div>
        )}

        {isError && (
          <div className="rounded-lg border p-6 text-sm">
            Unable to load Vraista compliance records.
          </div>
        )}

        {!isLoading && !isError && documents.length === 0 && (
          <div className="rounded-lg border p-6 text-sm">
            No current vehicle compliance records found.
          </div>
        )}

        {!isLoading && !isError && documents.length > 0 && (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left">Vehicle</th>
                  <th className="px-4 py-3 text-left">Plate Number</th>
                  <th className="px-4 py-3 text-left">Document</th>
                  <th className="px-4 py-3 text-left">Expiry Date</th>
                  <th className="px-4 py-3 text-left">Days Remaining</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>

              <tbody>
                {documents.map((document, index) => (
                  <tr
                    key={`${document.plate_number ?? "vehicle"}-${document.document_type_code ?? "document"}-${index}`}
                    className="border-b last:border-0"
                  >
                    <td className="px-4 py-3">
                      {document.vehicle_name ?? "—"}
                    </td>

                    <td className="px-4 py-3">
                      {document.plate_number ?? "—"}
                    </td>

                    <td className="px-4 py-3">
                      {document.document_type_name ??
                        document.document_type_code ??
                        "—"}
                    </td>

                    <td className="px-4 py-3">
                      {document.expiry_date ?? "—"}
                    </td>

                    <td className="px-4 py-3">
                      {document.days_remaining ?? "—"}
                    </td>

                    <td className="px-4 py-3 font-medium">
                      {document.current_status ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}