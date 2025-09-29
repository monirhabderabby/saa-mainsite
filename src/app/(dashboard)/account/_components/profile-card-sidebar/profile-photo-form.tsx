"use client";

import { UpdateProfilePhotoAction } from "@/actions/account/profile-info-update";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEdgeStore } from "@/lib/edgestore";
import { User } from "@prisma/client";
import { Edit, Loader2 } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

interface Props {
  user: User;
}

const ProfilePhotoForm = ({ user }: Props) => {
  const [isUpdaringLiveUrl, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { edgestore } = useEdgeStore();

  const [imageUrl, setImageUrl] = useState<string>(
    user?.image || "/placeholder.avif"
  );
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setProgress(0);

      const res = await edgestore.profilePhotos.upload({
        file,
        onProgressChange: (p) => setProgress(p),
        options: {
          replaceTargetUrl: user.image!,
          manualFileName: `profile-photo/${user.nickName}`,
        },
      });

      if (res?.url) {
        setImageUrl(res.url);
        startTransition(() => {
          UpdateProfilePhotoAction(res.url).then(async (res) => {
            if (!res.success) {
              toast.error(res.message);
              await edgestore.profilePhotos.delete({
                url: imageUrl,
              });
              return;
            } else {
              toast.success(res.message);
            }
          });
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      <Avatar className="w-32 h-32 border-4 border-white shadow-lg overflow-hidden">
        <AvatarImage
          src={imageUrl}
          alt={user.fullName || "User profile"}
          className="object-cover"
        />
        <AvatarFallback className="text-2xl font-semibold bg-gray-200">
          {user?.fullName?.[0]}
        </AvatarFallback>

        {/* Progress overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-sm font-medium">
            {progress < 100 ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin mb-1" />
                {progress}%
              </>
            ) : (
              "Processing..."
            )}
          </div>
        )}
      </Avatar>

      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Edit button */}
      <Button
        size="sm"
        type="button"
        onClick={handleUploadClick}
        disabled={uploading || isUpdaringLiveUrl}
        className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 shadow-lg p-0"
      >
        {uploading || isUpdaringLiveUrl ? (
          <Loader2 className="w-4 h-4 text-white animate-spin" />
        ) : (
          <Edit className="w-4 h-4 text-white" />
        )}
      </Button>
    </div>
  );
};

export default ProfilePhotoForm;
