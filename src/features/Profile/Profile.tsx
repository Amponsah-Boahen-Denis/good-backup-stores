"use client";

import { useEffect, useState } from "react";
import StoreForm from "@/components/StoreForm";
import StoreList from "@/components/StoreList";
import LogoUpload from "@/components/LogoUpload";
import ProfileForm from "@/components/ProfileForm";
import BusinessAnalytics from "@/components/BusinessAnalytics";
import StoreSearchWidget from "@/components/StoreSearchWidget";
import { deleteStore, listStores, saveStore, StoreSubmission } from "@/services/userStores";
import { canAddStore, recordStoreAdded } from "@/services/userPlans";
import PlanStatus from "@/components/PlanStatus";
import PlanLimitAlert from "@/components/PlanLimitAlert";
import { usePreferences } from "@/hooks/usePreferences";
import { updateUserPreferences } from "@/services/preferences";
import Button from "@/components/Button";

export default function Profile() {
  const { prefs } = usePreferences();
  const user = { name: prefs.name || "User", email: prefs.email || "user@example.com" };

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [stores, setStores] = useState<StoreSubmission[]>([]);
  const [editing, setEditing] = useState<StoreSubmission | null>(null);
  const [storeLimitError, setStoreLimitError] = useState<string | null>(null);
  const [profileLogo, setProfileLogo] = useState<string | null>(prefs.logo || null);

  useEffect(() => {
    listStores().then(setStores);
  }, []);

  const handleSubmit = async (data: Omit<StoreSubmission, "id" | "createdAt" | "updatedAt">) => {
    setStoreLimitError(null);
    
    // If adding a new store (not editing), check limits
    if (!editing) {
      const storeCheck = canAddStore();
      if (!storeCheck.allowed) {
        setStoreLimitError(storeCheck.reason || "Store limit reached");
        return;
      }
    }
    
    await saveStore({ ...data, id: editing?.id });
    const next = await listStores();
    setStores(next);
    setEditing(null);
    
    // Record store addition if it's a new store
    if (!editing) {
      recordStoreAdded();
    }
  };

  const handleLogoUpload = async (url: string) => {
    setProfileLogo(url);
    await updateUserPreferences({ logo: url });
  };

  const handleProfileSave = async (data: Record<string, string>) => {
    setIsSavingProfile(true);
    try {
      await updateUserPreferences(data);
      setIsEditingProfile(false);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleEdit = (item: StoreSubmission) => {
    setEditing(item);
  };

  const handleDelete = async (id: string) => {
    await deleteStore(id);
    const updated = await listStores();
    setStores(updated);
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
            <p className="text-sm text-black/70 dark:text-white/70">{user.name} · {user.email}</p>
          </div>
          {!isEditingProfile && (
            <Button onClick={() => setIsEditingProfile(true)} variant="secondary">
              Edit Profile
            </Button>
          )}
        </div>
        <LogoUpload onUpload={handleLogoUpload} currentLogo={profileLogo} label="Profile Logo" userId="user_profile" />
      </header>

      {/* Profile Edit Form */}
      {isEditingProfile && (
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Edit Profile</h2>
          <ProfileForm
            initial={prefs}
            onSubmit={handleProfileSave}
            onCancel={() => setIsEditingProfile(false)}
            isLoading={isSavingProfile}
          />
        </section>
      )}

      {/* Plan Status */}
      <section>
        <PlanStatus />
      </section>

      {/* Business Analytics */}
      <section>
        <BusinessAnalytics />
      </section>

      {/* Store Search Widget */}
      <section>
        <StoreSearchWidget />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Your stores</h2>
        <StoreList items={stores} onEdit={handleEdit} onDelete={handleDelete} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">{editing ? "Edit store" : "Submit a new store"}</h2>
        {storeLimitError && (
          <PlanLimitAlert
            type="store"
            message={storeLimitError}
            currentPlan="Starter"
            suggestedPlan="Pro"
            onDismiss={() => setStoreLimitError(null)}
          />
        )}
        <StoreForm initial={editing || undefined} onSubmit={handleSubmit} onCancel={() => setEditing(null)} />
      </section>
    </main>
  );
}



