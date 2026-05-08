import { SubmissionStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

const statusVariant: Record<SubmissionStatus, "default" | "secondary" | "outline" | "destructive"> = {
  NEW: "default",
  REVIEWED: "secondary",
  CONTACTED: "outline",
  ARCHIVED: "secondary",
  SPAM: "destructive",
};

export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  return <Badge variant={statusVariant[status]}>{status}</Badge>;
}
