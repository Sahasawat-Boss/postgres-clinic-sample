"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PatientForm from "@/components/PatientForm";
import { ErrorBox, PageHeader, Spinner } from "@/components/ui";
import { api, type Patient } from "@/lib/types";

export default function EditPatientPage() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Patient>(`/api/patients/${id}`).then(setPatient).catch((e: Error) => setError(e.message));
  }, [id]);

  if (error) return <ErrorBox message={error} />;
  if (!patient) return <Spinner />;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="แก้ไขข้อมูลผู้ป่วย" subtitle={`${patient.first_name} ${patient.last_name} · ${patient.hn}`} />
      <PatientForm patient={patient} />
    </div>
  );
}
