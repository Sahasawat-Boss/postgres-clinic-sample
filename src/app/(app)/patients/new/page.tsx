import PatientForm from "@/components/PatientForm";
import { PageHeader } from "@/components/ui";

export default function NewPatientPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="เพิ่มผู้ป่วยใหม่" subtitle="กรอกข้อมูลผู้ป่วย ช่องที่มี * จำเป็นต้องกรอก" />
      <PatientForm />
    </div>
  );
}
