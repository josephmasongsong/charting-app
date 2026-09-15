import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ReferralForm from "../components/ReferralForm";

export default async function NewReferralPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <ReferralForm />;
}

export async function generateMetadata() {
  return {
    title: "Log Referral",
    description:
      "Record a referral made when a tenant asked for something outside the tenant engagement program",
  };
}
