import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import MotionCard from "./motion-card";

interface ClientReviewCardProps {
  rating: number;
}

export default function ClientReviewCard({ rating }: ClientReviewCardProps) {
  return (
    <MotionCard delay={0.15}>
      <Card className="shadow-none">
        <CardContent className="pt-3 px-3 space-y-2">
          <Label>Client Review</Label>

          <div className="flex items-center gap-x-2">
            <Rating
              value={rating}
              orientation="horizontal"
              readOnly
              style={{ maxWidth: 120 }}
            />
            <p>{rating.toFixed(1)}</p>
          </div>
        </CardContent>
      </Card>
    </MotionCard>
  );
}
