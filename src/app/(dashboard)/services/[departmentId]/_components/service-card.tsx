import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Prisma } from "@prisma/client";
import { Briefcase } from "lucide-react";
import DesignationBadge from "./designation-badge";
import ServiceCardDropdownAction from "./service-card-dropdown-action";

type ServiceType = Prisma.ServicesGetPayload<{
  include: {
    designations: {
      select: {
        id: true;
        name: true;
      };
    };
    department: true;
  };
}>;

interface Props {
  data: ServiceType;
}
const ServiceCard = ({ data }: Props) => {
  return (
    <>
      <Card className="shadow-none dark:bg-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-green/10 rounded-lg">
                <Briefcase className="h-5 w-5 text-primary-green" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-card-foreground">
                  {data.name}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Service Overview
                </CardDescription>
              </div>
            </div>
            <ServiceCardDropdownAction data={data} />
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-customYellow-primary">
                {data.designations.length}
              </span>
              <span className="text-sm text-muted-foreground">
                designations
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Total number of designations available in this service
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {data.designations.map((item) => (
              <DesignationBadge
                data={item}
                key={item.id}
                serviceId={data.id}
                serviceName={data.name}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ServiceCard;
