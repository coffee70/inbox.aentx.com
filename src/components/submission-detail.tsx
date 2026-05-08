"use client";

import { ContactSubmission, SubmissionStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmissionStatusBadge } from "@/components/submission-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const statuses: SubmissionStatus[] = ["NEW", "REVIEWED", "CONTACTED", "ARCHIVED", "SPAM"];

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="text-sm">{value || "-"}</div>
    </div>
  );
}

export function SubmissionDetail({ submission }: { submission: ContactSubmission }) {
  const [status, setStatus] = useState<SubmissionStatus>(submission.status);
  const [adminNotes, setAdminNotes] = useState(submission.adminNotes ?? "");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const save = async () => {
    setSaving(true);
    const response = await fetch(`/api/admin/submissions/${submission.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNotes }),
    });
    setSaving(false);
    if (response.ok) router.refresh();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>{submission.name ?? submission.email}</CardTitle>
          <CardDescription>Submission metadata and context</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailField label="Email" value={submission.email} />
            <DetailField label="Company" value={submission.company} />
            <DetailField label="Role" value={submission.role} />
            <DetailField label="Website" value={submission.website} />
            <DetailField label="Interest type" value={submission.interestType} />
            <DetailField label="Current status" value={<SubmissionStatusBadge status={submission.status} />} />
            <DetailField label="Referrer" value={submission.referrer} />
            <DetailField label="Origin" value={submission.origin} />
            <DetailField label="User agent" value={submission.userAgent} />
            <DetailField label="Spam score" value={submission.spamScore} />
            <DetailField label="Spam reasons" value={submission.spamReasons.join(", ") || "-"} />
            <DetailField label="Created at" value={new Date(submission.createdAt).toLocaleString()} />
          </div>
          <Separator />
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Message</p>
            <div className="rounded-lg border bg-muted/20 p-3 text-sm whitespace-pre-wrap">
              {submission.message || "-"}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Actions</CardTitle>
          <CardDescription>Update status and save internal notes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
            <Select value={status} onValueChange={(value) => setStatus(value as SubmissionStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Admin Notes</p>
            <Textarea
              value={adminNotes}
              onChange={(event) => setAdminNotes(event.target.value)}
              rows={10}
              placeholder="Add private notes..."
            />
          </div>
          <Button onClick={save} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
