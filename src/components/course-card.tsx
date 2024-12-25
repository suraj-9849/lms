import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SafeImage } from './ui/SafeImage';

interface CourseCardProps {
  title: string;
  description: string;
  image: string;
  progress?: number;
  students?: number;
}

export function CourseCard({ title, description, image, progress }: CourseCardProps) {
  return (
    <Card className="overflow-hidden">
      <SafeImage
        src={image}
        alt={title}
        width={100}
        height={50}
        className="h-40 w-full object-cover"
      />
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {progress !== undefined && (
          <div className="w-full">
            <Progress value={progress} className="w-full" />
            <p className="mt-2 text-sm text-muted-foreground">{progress}% Complete</p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
