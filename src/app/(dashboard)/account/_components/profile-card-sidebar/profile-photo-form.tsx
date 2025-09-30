"use client";

import { UpdateProfilePhotoAction } from "@/actions/account/profile-info-update";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEdgeStore } from "@/lib/edgestore";
import { User } from "@prisma/client";
import { Edit, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface Props {
  user: User;
}

const ProfilePhotoForm = ({ user }: Props) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { edgestore } = useEdgeStore();
  const router = useRouter();

  const [imageUrl, setImageUrl] = useState<string>(
    user?.image || "/placeholder.avif"
  );
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const MAX_FILE_SIZE_MB = 1; // adjust to your backend limit

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      toast.error(`File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    const previousImage = imageUrl; // keep old image for rollback

    try {
      setUploading(true);
      setProgress(0);

      const res = await edgestore.profilePhotos.upload({
        file,
        onProgressChange: (p) => setProgress(p),
        options: {
          replaceTargetUrl: user.image || undefined,
          manualFileName: `profile-photo/${user.nickName}-${Date.now()}`, // unique filename
        },
      });

      if (res?.url) {
        setImageUrl(res.url);

        const updateRes = await UpdateProfilePhotoAction(res.url);

        if (!updateRes.success) {
          toast.error(updateRes.message);

          // delete the failed upload
          await edgestore.profilePhotos.delete({ url: res.url });

          // restore old image
          setImageUrl(previousImage);
          return;
        }

        toast.success(updateRes.message);
        router.refresh();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Something went wrong while uploading the file.");
      setImageUrl(previousImage); // rollback
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
        disabled={uploading}
        className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 shadow-lg p-0"
      >
        {uploading ? (
          <Loader2 className="w-4 h-4 text-white animate-spin" />
        ) : (
          <Edit className="w-4 h-4 text-white" />
        )}
      </Button>
    </div>
  );
};

export default ProfilePhotoForm;
