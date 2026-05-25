import { type FormEvent, useState, useEffect } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, UserCircle } from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";
import FormInput from "@/components/ui/FormInput";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { userApi, type UserProfileInfo } from "@/lib/api";

interface EditProfileModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfileInfo | null;
  onSuccess: (updatedProfile: UserProfileInfo) => void;
  isRTL: boolean;
}

export default function EditProfileModal({
  isOpen,
  onOpenChange,
  profile,
  onSuccess,
  isRTL,
}: EditProfileModalProps) {
  const { token, updateUser } = useAuth();

  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizeModalError = (message: string) => {
    const lower = message.toLowerCase();
    if (lower.includes("email") && lower.includes("valid")) {
      return "Invalid email address";
    }
    if (lower.includes("phonenumber")) {
      return message.replace(/"?phoneNumber"?/g, "Phone Number");
    }
    return message;
  };

  useEffect(() => {
    if (isOpen && profile) {
      setEmail(profile.email || "");
      setPhoneNumber(profile.phoneNumber || "");
      setProfilePicture(null);
    }
  }, [isOpen, profile]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;

    try {
      setIsSubmitting(true);
      const formData = new FormData();

      if (email && email !== profile?.email) formData.append("email", email);
      if (phoneNumber && phoneNumber !== profile?.phoneNumber)
        formData.append("phoneNumber", phoneNumber);
      if (profilePicture) formData.append("profilePicture", profilePicture);

      if (
        ![...formData.keys()].some(
          (k) => k === "email" || k === "phoneNumber" || k === "profilePicture",
        )
      ) {
        toast.info(
          isRTL ? "لا توجد تغييرات للحفظ" : "No changes to save",
        );
        return;
      }

      const res = await userApi.updateProfile(formData, token);
      onSuccess(res.user);
      updateUser({
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role,
        isVerified: res.user.isVerified,
        profilePicture: res.user.profilePicture || null,
      });
      toast.success(
        isRTL ? "تم تحديث الملف الشخصي بنجاح" : "Profile updated successfully",
      );
      onOpenChange(false);
    } catch (error) {
      const err = error as Error;
      toast.error(normalizeModalError(err.message || "Failed to update profile"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-70 bg-slate-950/40 modal-overlay" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-71 w-[calc(100%-2rem)] max-h-[85vh] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col overflow-hidden focus:outline-none modal-pop"
          dir={isRTL ? "rtl" : "ltr"}
        >
          <div className="relative border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <div className={`absolute top-4 ${isRTL ? "left-4" : "right-4"}`}>
              <DialogPrimitive.Close className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200/50 text-slate-500 transition-colors hover:bg-slate-200">
                <X className="h-4 w-4" />
              </DialogPrimitive.Close>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-secondary">
                <UserCircle className="h-5 w-5" />
              </div>
              <DialogPrimitive.Title className="text-xl font-bold text-slate-900">
                {isRTL ? "تعديل الملف الشخصي" : "Edit Profile"}
              </DialogPrimitive.Title>
            </div>
          </div>

          <div className="flex-1 px-6 py-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                id="edit-email"
                type="email"
                label={isRTL ? "البريد الإلكتروني" : "Email Address"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  isRTL ? "أدخل بريدك الإلكتروني" : "Enter your email"
                }
                dir="ltr"
                className={isRTL ? "text-right" : ""}
                required
              />

              <FormInput
                id="edit-phone"
                type="tel"
                label={isRTL ? "رقم الهاتف" : "Phone Number"}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="01xxxxxxxxx"
                dir="ltr"
                className={isRTL ? "text-right" : ""}
              />

              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">
                  {isRTL ? "صورة الملف الشخصي" : "Profile Picture"}
                </p>
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <ImageUpload
                  onImageChange={setProfilePicture}
                  compact
                  title={
                    isRTL
                      ? "صورة الملف الشخصي (اختياري)"
                      : "Profile Picture (Optional)"
                  }
                  dragDropText=""
                  subtitle={
                    isRTL
                      ? "قم بتحديث صورة ملفك الشخصي إذا أردت"
                      : "Update your profile picture if you want"
                  }
                  buttonText={isRTL ? "اختر صورة" : "Choose image"}
                  changeText={isRTL ? "تغيير الصورة" : "Change image"}
                  removeText={isRTL ? "حذف الصورة" : "Remove image"}
                />
              </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-xl text-sm text-white bg-secondary hover:bg-secondary/90 transition-colors font-medium outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? isRTL
                      ? "جاري الحفظ..."
                      : "Saving..."
                    : isRTL
                      ? "حفظ التغييرات"
                      : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-xl text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors font-medium outline-none cursor-pointer"
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </form>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
