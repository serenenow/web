import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getTimezoneDisplayWithOffset, getTimezonesGroupedByRegion } from "@/lib/utils/time-utils"

interface TimezoneSelectorProps {
  timezone: string
  onTimezoneChange: (timezone: string) => void
}

export const TimezoneSelector = ({ timezone, onTimezoneChange }: TimezoneSelectorProps) => {
  return (
    <Card className="border-mint/20 mb-6">
      <CardHeader>
        <CardTitle className="text-charcoal">Timezone</CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={timezone} onValueChange={onTimezoneChange}>
          <SelectTrigger className="w-full border-mint/20 focus:border-mint-dark focus:ring-mint-dark">
            <SelectValue placeholder="Select your timezone">
              {getTimezoneDisplayWithOffset(timezone)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(getTimezonesGroupedByRegion()).map(([region, tzList]) => (
              <div key={region}>
                <div className="px-2 py-1.5 text-sm font-semibold bg-gray-100">{region}</div>
                {tzList.map((tz) => (
                  <SelectItem key={tz.id} value={tz.id}>
                    {tz.displayName} {tz.offset ? `(UTC${tz.offset})` : ''}
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}
