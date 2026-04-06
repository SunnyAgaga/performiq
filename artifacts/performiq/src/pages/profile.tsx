import { useState, useRef } from "react";
import { PageHeader, Card, Button, Input, Label } from "@/components/shared";
import { useAuth } from "@/hooks/use-auth";
import { Lock, CheckCircle, Camera, X, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/utils";

export default function Profile() {
  const { user, refreshUser } = useAuth();

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setErrorMsg("New passwords do not match.");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters.");
      return;
    }

    setStatus("loading");
    try {
      const res = await apiFetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to update password.");
        setStatus("error");
      } else {
        setStatus("success");
        setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image must be under 5 MB.");
      return;
    }
    setPhotoError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPhotoPreview(dataUrl);
      uploadPhoto(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const uploadPhoto = async (dataUrl: string) => {
    if (!user) return;
    setPhotoUploading(true);
    setPhotoError("");
    try {
      const res = await apiFetch(`/api/users/${user.id}/profile-photo`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profilePhoto: dataUrl }),
      });
      if (!res.ok) {
        const data = await res.json();
        setPhotoError(data.error || "Failed to update photo.");
        setPhotoPreview(null);
      } else {
        await refreshUser();
        setPhotoPreview(null);
      }
    } catch {
      setPhotoError("Network error. Please try again.");
      setPhotoPreview(null);
    } finally {
      setPhotoUploading(false);
    }
  };

  const removePhoto = async () => {
    if (!user) return;
    setPhotoUploading(true);
    setPhotoError("");
    try {
      const res = await apiFetch(`/api/users/${user.id}/profile-photo`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profilePhoto: null }),
      });
      if (res.ok) {
        await refreshUser();
      }
    } catch {
      setPhotoError("Failed to remove photo.");
    } finally {
      setPhotoUploading(false);
    }
  };

  if (!user) return null;

  const displayPhoto = photoPreview || user.profilePhoto;
  const initial = (user.name ?? user.email ?? 'U').charAt(0).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="My Profile" description="View your account details and manage your password." />

      {/* Profile Info */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-5 mb-6">
          {/* Clickable avatar */}
          <div className="relative group shrink-0">
            <div
              className="w-20 h-20 rounded-full overflow-hidden bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold shadow-md cursor-pointer border-2 border-transparent group-hover:border-primary transition-all"
              onClick={() => !photoUploading && fileInputRef.current?.click()}
            >
              {displayPhoto ? (
                <img src={displayPhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            {/* Camera overlay */}
            <button
              type="button"
              onClick={() => !photoUploading && fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              disabled={photoUploading}
            >
              {photoUploading ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
            </button>
            {/* Remove photo button */}
            {user.profilePhoto && !photoUploading && (
              <button
                type="button"
                onClick={removePhoto}
                title="Remove photo"
                className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/80"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          <div className="min-w-0">
            <h2 className="text-xl font-bold">{user.name ?? user.email}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground mt-1">Click photo to change · Max 5 MB</p>
          </div>
        </div>

        {photoError && (
          <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2 mb-4">{photoError}</p>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-muted/40 rounded-xl p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Role</p>
            <p className="font-semibold capitalize">{user.role}</p>
          </div>
          <div className="bg-muted/40 rounded-xl p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Department</p>
            <p className="font-semibold">{user.department || '—'}</p>
          </div>
          <div className="bg-muted/40 rounded-xl p-4 col-span-2">
            <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Job Title</p>
            <p className="font-semibold">{user.jobTitle || '—'}</p>
          </div>
        </div>
      </Card>

      {/* Change Password */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" /> Change Password
        </h3>
        <p className="text-sm text-muted-foreground mb-6">Update your login password. You'll need your current password to confirm.</p>

        {status === "success" && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 text-sm font-medium">
            <CheckCircle className="w-4 h-4" /> Password updated successfully.
          </div>
        )}
        {(status === "error" || errorMsg) && (
          <div className="text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 mb-4 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <Label>Current Password</Label>
            <Input
              type="password"
              value={pwForm.currentPassword}
              onChange={e => { setPwForm({ ...pwForm, currentPassword: e.target.value }); setStatus("idle"); setErrorMsg(""); }}
              required
            />
          </div>
          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              placeholder="Minimum 6 characters"
              value={pwForm.newPassword}
              onChange={e => { setPwForm({ ...pwForm, newPassword: e.target.value }); setStatus("idle"); setErrorMsg(""); }}
              required
            />
          </div>
          <div>
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              value={pwForm.confirmPassword}
              onChange={e => { setPwForm({ ...pwForm, confirmPassword: e.target.value }); setStatus("idle"); setErrorMsg(""); }}
              required
            />
          </div>
          <Button type="submit" isLoading={status === "loading"} className="w-full mt-2">
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
}
