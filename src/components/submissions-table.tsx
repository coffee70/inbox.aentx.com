import Link from "next/link";
import { ContactSubmission } from "@prisma/client";
import { SubmissionStatusBadge } from "@/components/submission-status-badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function SubmissionsTable({ items }: { items: ContactSubmission[] }) {
  return (
    <Card className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Interest</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="pr-4">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="pl-4">{item.name ?? "-"}</TableCell>
              <TableCell>
                <Link className="hover:underline" href={`/submissions/${item.id}`}>
                  {item.email}
                </Link>
              </TableCell>
              <TableCell>{item.company ?? "-"}</TableCell>
              <TableCell>{item.interestType ?? "-"}</TableCell>
              <TableCell>
                <SubmissionStatusBadge status={item.status} />
              </TableCell>
              <TableCell className="pr-4">{new Date(item.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                No submissions found.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </Card>
  );
}
