// "use client";

// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Switch } from "@/components/ui/switch";
// import { User } from "@prisma/client";
// import { Hash, Mail, User, Users } from "lucide-react";
// import { ReactNode } from "react";

// interface ProfileViewProps {
//   open: boolean;
//   onClose: () => void;
//   profileData: User
//   trigger: ReactNode;
//   onPermissionChange?: () => void;
// }

// export function ProfileView({
//   open,
//   onClose,
//   profileData,
//   onPermissionChange,
//   trigger,
// }: ProfileViewProps) {
//   const getInitials = (name: string) => {
//     return name
//       .split(" ")
//       .map((n) => n[0])
//       .join("")
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   const handlePermissionToggle = () => {
//     if (onPermissionChange) {

//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogTrigger asChild>{trigger}</DialogTrigger>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle className="text-center">Profile Details</DialogTitle>
//         </DialogHeader>

//         <div className="space-y-6">
//           {/* Profile Header */}
//           <div className="flex flex-col items-center space-y-4">
//             <Avatar className="h-20 w-20">
//               <AvatarImage
//                 src={
//                   profileData.image ||
//                   `/placeholder.svg?height=80&width=80&query=professional+profile+photo`
//                 }
//                 alt={profileData.fullName as string}
//               />
//               <AvatarFallback className="text-lg font-semibold">
//                 {getInitials(profileData.fullName as string)}
//               </AvatarFallback>
//             </Avatar>
//             <div className="text-center">
//               <h3 className="text-xl font-semibold text-balance">
//                 {profileData.fullName as string}
//               </h3>
//               <Badge variant="secondary" className="mt-1">
//                 team name
//               </Badge>
//             </div>
//           </div>

//           {/* Profile Information */}
//           <Card>
//             <CardContent className="pt-6 space-y-4">
//               <div className="flex items-center space-x-3">
//                 <Hash className="h-4 w-4 text-muted-foreground" />
//                 <div>
//                   <p className="text-sm font-medium">ID</p>
//                   <p className="text-sm text-muted-foreground">
//                     {profileData.id}
//                   </p>
//                 </div>
//               </div>

//               <div className="flex items-center space-x-3">
//                 <User className="h-4 w-4 text-muted-foreground" />
//                 <div>
//                   <p className="text-sm font-medium">Name</p>
//                   <p className="text-sm text-muted-foreground">
//                     {profileData.name}
//                   </p>
//                 </div>
//               </div>

//               <div className="flex items-center space-x-3">
//                 <Mail className="h-4 w-4 text-muted-foreground" />
//                 <div>
//                   <p className="text-sm font-medium">Email</p>
//                   <p className="text-sm text-muted-foreground">
//                     {profileData.email}
//                   </p>
//                 </div>
//               </div>

//               <div className="flex items-center space-x-3">
//                 <Users className="h-4 w-4 text-muted-foreground" />
//                 <div>
//                   <p className="text-sm font-medium">Team</p>
//                   <p className="text-sm text-muted-foreground">
//                     {profileData.teamName}
//                   </p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Access Permissions */}
//           <Card>
//             <CardContent className="pt-6">
//               <h4 className="text-lg font-semibold mb-4 text-center">
//                 Access Permissions
//               </h4>
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm font-medium">Add Entry</span>
//                   <Switch
//                     checked={profileData.permissions.addEntry}
//                     onCheckedChange={() => handlePermissionToggle("addEntry")}
//                   />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <span className="text-sm font-medium">TL Check</span>
//                   <Switch
//                     checked={profileData.permissions.tlCheck}
//                     onCheckedChange={() => handlePermissionToggle("tlCheck")}
//                   />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <span className="text-sm font-medium">Done By</span>
//                   <Switch
//                     checked={profileData.permissions.doneBy}
//                     onCheckedChange={() => handlePermissionToggle("doneBy")}
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
