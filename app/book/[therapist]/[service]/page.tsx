import { BookingForm } from './booking-form'

type PageProps = {
  params: { therapist: string; service: string }
}

export default function Page({
  params,
}: {
  params: { therapist: string; service: string }
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <BookingForm therapistId={params.therapist} serviceId={params.service} />
    </div>
  )
}
