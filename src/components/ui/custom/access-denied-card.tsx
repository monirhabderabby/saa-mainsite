"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HelpCircle, Mail, ShieldX } from "lucide-react";

interface AccessDeniedCardProps {
  title?: string;
  message?: string;
  showRequestButton?: boolean;
  showContactButton?: boolean;
  onRequestAccess?: () => void;
  onContactAdmin?: () => void;
  className?: string;
}

export function AccessDeniedCard({
  title = "Access Denied",
  message = "You do not have the necessary permissions to edit this content. Please contact your administrator or request access to continue.",
  showRequestButton = false,
  showContactButton = false,
  onRequestAccess,
  onContactAdmin,
  className = "",
}: AccessDeniedCardProps) {
  return (
    <Card className={`max-w-md mx-auto border-border bg-card ${className}`}>
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-3">
          <div className="p-3 rounded-full bg-yellow-500/10">
            <ShieldX className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <CardTitle className="text-xl font-bold text-card-foreground font-sans">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <CardDescription className="text-center text-muted-foreground leading-relaxed">
          {message}
        </CardDescription>

        <div className="flex flex-col gap-3">
          {showRequestButton && (
            <Button
              onClick={onRequestAccess}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Request Access
            </Button>
          )}

          {showContactButton && (
            <Button
              variant="outline"
              onClick={onContactAdmin}
              className="w-full border-border text-card-foreground hover:bg-accent hover:text-accent-foreground bg-transparent"
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Administrator
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2">
          {"If you believe this is an error, please contact support."}
        </div>
      </CardContent>
    </Card>
  );
}
