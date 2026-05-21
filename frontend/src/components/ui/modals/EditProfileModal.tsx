import { type FormEvent, useState, useEffect } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, UserCircle, Mail } from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";
import SubmitButton from "@/components/ui/SubmitButton";
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
  const { token } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [idPicture, setIdPicture] = useState<File | null>(null);

  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && profile && !showOtpStep) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setPhoneNumber(profile.phoneNumber || "");
      if (profile.birthDate) {
        // format date for yyyy-MM-dd input
        try {
          const d = new Date(profile.birthDate);
          setBirthDate(d.toISOString().split("T")[0]);
        } catch {
          setBirthDate("");
        }
      } else {
        setBirthDate("");
      }
      setIdPicture(null);
    }

    if (!isOpen) {
      setShowOtpStep(false);
      setOtp("");
    }
  }, [isOpen, profile, showOtpStep]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;

    try {
      setIsSubmitting(true);
      const formData = new FormData();

      if (name && name !== profile?.name) formData.append("name", name);
      if (email && email !== profile?.email) formData.append("email", email);
      if (phoneNumber && phoneNumber !== profile?.phoneNumber)
        formData.append("phoneNumber", phoneNumber);
      if (birthDate) formData.append("birthDate", birthDate);
      if (idPicture) formData.append("idPicture", idPicture);

      const res = await userApi.updateProfile(formData, token);

      onSuccess(res.user);

      if (email && email !== profile?.email) {
        toast.success(
          isRTL
            ? "تم تحديث البيانات. يرجى التحقق من بريدك الإلكتروني الجديد."
            : "Profile updated. Please verify your new email.",
        );
        setShowOtpStep(true);
      } else {
        toast.success(
          isRTL
            ? "تم تحديث الملف الشخصي بنجاح"
            : "Profile updated successfully",
        );
        onOpenChange(false);
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;

    try {
      setIsSubmitting(true);
      const res = await userApi.verifyEmail(otp, token);
      toast.success(
        isRTL
          ? "تم توثيق البريد الإلكتروني بنجاح"
          : "Email verified successfully",
      );
      onSuccess(res.user);
      onOpenChange(false);
      setShowOtpStep(false);
      setOtp("");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || (isRTL ? "رمز غير صحيح" : "Invalid OTP"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-70 bg-slate-950/40 modal-overlay" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-71 w-[calc(100%-1.25rem)] max-h-[90vh] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col focus:outline-none modal-pop"
          dir={isRTL ? "rtl" : "ltr"}
        >
          <div className="relative border-b border-slate-100 bg-slate-50/50 px-6 py-5">
            <div className={`absolute top-5 ${isRTL ? "left-5" : "right-5"}`}>
              <DialogPrimitive.Close className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200/50 text-slate-500 transition-colors hover:bg-slate-200">
                <X className="h-4 w-4" />
              </DialogPrimitive.Close>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-secondary">
                {showOtpStep ? (
                  <Mail className="h-5 w-5" />
                ) : (
                  <UserCircle className="h-5 w-5" />
                )}
              </div>
              <DialogPrimitive.Title className="text-xl font-bold text-slate-900">
                {showOtpStep
                  ? isRTL
                    ? "تأكيد البريد الإلكتروني"
                    : "Verify Email"
                  : isRTL
                    ? "تعديل الملف الشخصي"
                    : "Edit Profile"}
              </DialogPrimitive.Title>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {showOtpStep ? (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <p className="text-sm text-slate-600 mb-4">
                  {isRTL
                    ? `لقد أرسلنا رمز تحقق إلى ${email}. يرجى إدخاله أدناه لإكمال تحديث بريدك الإلكتروني.`
                    : `We sent a verification code to ${email}. Please enter it below to complete your email update.`}
                </p>
                <FormInput
                  id="verify-otp"
                  type="text"
                  label={isRTL ? "رمز التحقق (OTP)" : "OTP Code"}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder={
                    isRTL
                      ? "أدخل الرمز المكون من 6 أرقام"
                      : "Enter 6-digit code"
                  }
                  required
                  className={isRTL ? "text-right" : ""}
                  dir="ltr"
                />
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <SubmitButton
                    type="submit"
                    isLoading={isSubmitting}
                    className="flex-1 bg-secondary text-white hover:bg-secondary/90"
                  >
                    {isRTL ? "تأكيد" : "Verify"}
                  </SubmitButton>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <FormInput
                  id="edit-name"
                  type="text"
                  label={isRTL ? "الاسم" : "Name"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isRTL ? "أدخل اسمك" : "Enter your name"}
                  required
                />

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
                  required
                />

                <FormInput
                  id="edit-birthdate"
                  type="date"
                  label={isRTL ? "تاريخ الميلاد" : "Birth Date"}
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />

                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm pt-2">
                  <ImageUpload
                    onImageChange={setIdPicture}
                    title={
                      isRTL ? "صورة الهوية (اختياري)" : "ID Picture (Optional)"
                    }
                    dragDropText=""
                    subtitle={
                      isRTL
                        ? "قم بتحديث صورة الهوية الخاصة بك إذا لزم الأمر"
                        : "Update your ID picture if needed"
                    }
                    buttonText={isRTL ? "اختر صورة" : "Choose image"}
                    changeText={isRTL ? "تغيير الصورة" : "Change image"}
                    removeText={isRTL ? "حذف الصورة" : "Remove image"}
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <SubmitButton
                    type="submit"
                    isLoading={isSubmitting}
                    className="flex-1 bg-secondary text-white hover:bg-secondary/90"
                  >
                    {isRTL ? "حفظ التغييرات" : "Save Changes"}
                  </SubmitButton>
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors font-medium outline-none cursor-pointer"
                  >
                    {isRTL ? "إلغاء" : "Cancel"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
