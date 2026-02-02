import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface Props {
  remark: string;
  containerClassname: string;
  title: string;
  icon: ReactNode;
}

const RemarkCard = ({ containerClassname, remark, title, icon }: Props) => {
  return (
    <Card className="shadow-none p-0">
      <CardHeader>
        <div className="flex items-center gap-x-3">
          {icon}
          <CardTitle className="text-md font-medium">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className={cn(containerClassname)}>{remark}</p>
      </CardContent>
    </Card>
  );
};

export default RemarkCard;
