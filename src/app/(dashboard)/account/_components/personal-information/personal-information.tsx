"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { User } from "@prisma/client";
import { Edit, Mail, MapPin, Phone } from "lucide-react";
import moment from "moment";
import dynamic from "next/dynamic";
import { useState } from "react";
const PersonalInfoForm = dynamic(() => import("./personal-information-form"), {
  ssr: false,
});

interface Props {
  user: User;
}

const PersonalInformation = ({ user }: Props) => {
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);

  return (
    <Card className="dark:bg-white/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription className="mt-2">
              Your personal details and contact information
            </CardDescription>
          </div>
          {!isEditingPersonal ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingPersonal(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <></>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isEditingPersonal ? (
          // View Mode
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Full Name
                </Label>
                <p className="text-sm">{user.fullName}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Email Address
                </Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{user.email}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Employee ID
                </Label>
                <p className="text-sm">{user.employeeId}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Date Of Birth
                </Label>
                <p className="text-sm">
                  {user.dateOfBirth
                    ? moment(user.dateOfBirth).format("DD MMM, YYYY")
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Phone Number
              </Label>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{user.phone ?? "N/A"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Parmanent Address
                </Label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">
                    {user.parmanentAddress?.trim()
                      ? user.parmanentAddress
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Present Address
                </Label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">
                    {user.presentAddress?.trim() ? user.presentAddress : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <PersonalInfoForm
            user={user}
            onSave={() => setIsEditingPersonal(false)}
            onCancel={() => setIsEditingPersonal(false)}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default PersonalInformation;
