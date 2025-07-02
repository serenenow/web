import { BookingForm } from "./booking-form"

interface PageProps {
  params: Promise<{ therapist: string; service: string }>
}

export default async function Page({ params }: PageProps) {
  const { therapist, service } = await params

  return (
    <div className="container mx-auto px-4 py-8">
      <BookingForm therapistId={therapist} serviceId={service} />
    </div>
  )
}
