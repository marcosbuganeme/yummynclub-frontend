import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

interface ChartContainerProps {
  title: string | React.ReactNode
  children: React.ReactNode
  isLoading?: boolean
  className?: string
}

export function ChartContainer({
  title,
  children,
  isLoading = false,
  className,
}: ChartContainerProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          {typeof title === 'string' ? (
            <CardTitle>{title}</CardTitle>
          ) : (
            <div>{title}</div>
          )}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        {typeof title === 'string' ? (
          <CardTitle>{title}</CardTitle>
        ) : (
          <div>{title}</div>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
