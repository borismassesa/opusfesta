import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '@opusfesta/lib';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { PhotoUploader } from '@/components/onboarding/PhotoUploader';
import { useCurrentVendor } from '@/hooks/useCurrentVendor';
import { useUpdateVendorProfile, useUpdateVendorPackages } from '@/hooks/useVendorProfile';
import { uploadToBucket } from '@/lib/storage';
import { shadowSoftSm } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';
import type { VendorPackage } from '@/types/vendor';
import { getErrorMessage } from '@/lib/errors';

function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  const { editorial } = useTheme();
  return (
    <View className="mb-4">
      <Text className="font-work-sans-bold text-[11px] tracking-[1px] uppercase text-ed-on-surface-variant mb-1.5">
        {label}
      </Text>
      <TextInput
        placeholderTextColor={editorial.onSurfaceVariant}
        className="bg-ed-surface-container-lowest rounded-[14px] border border-ed-outline-variant p-3.5 font-work-sans text-sm text-ed-on-surface"
        {...props}
      />
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="font-space-grotesk-bold text-base text-ed-on-surface mb-3 mt-2">
      {children}
    </Text>
  );
}

const isRemoteUrl = (uri: string) => uri.startsWith('http://') || uri.startsWith('https://');

function StorefrontReadOnly({ vendorId, businessName }: { vendorId: string; businessName: string }) {
  const router = useRouter();
  const { editorial } = useTheme();
  return (
    <ScreenWrapper>
      <Text className="font-dancing-script-bold text-[28px] text-ed-primary-container mb-5">
        Storefront
      </Text>
      <View
        className="bg-ed-surface-container-lowest rounded-[20px] border border-ed-outline-variant p-5 items-center"
        style={shadowSoftSm}
      >
        <Ionicons name="lock-closed-outline" size={28} color={editorial.onSurfaceVariant} style={{ marginBottom: 10 }} />
        <Text className="font-space-grotesk-bold text-[15px] text-ed-on-surface text-center">
          View-only access
        </Text>
        <Text className="font-work-sans text-[13px] text-ed-on-surface-variant text-center mt-1.5">
          Only the account owner or a manager can edit the {businessName} storefront.
        </Text>
        <Pressable
          onPress={() => router.push(`/vendor/${vendorId}`)}
          className="mt-4 flex-row items-center gap-1.5"
        >
          <Ionicons name="storefront-outline" size={16} color={editorial.primaryContainer} />
          <Text className="font-work-sans-bold text-[13px] text-ed-primary-container">
            View public profile
          </Text>
        </Pressable>
      </View>
    </ScreenWrapper>
  );
}

export default function StorefrontScreen() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { vendor, myRole, isLoading: vendorLoading } = useCurrentVendor();
  const { editorial } = useTheme();
  const updateProfile = useUpdateVendorProfile();
  const updatePackages = useUpdateVendorPackages();

  const [bio, setBio] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState<string[]>([]);
  const [cover, setCover] = useState<string[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [saving, setSaving] = useState(false);

  const [newPackage, setNewPackage] = useState({ name: '', price: '', description: '' });

  useEffect(() => {
    if (!vendor) return;
    setBio(vendor.bio ?? '');
    setDescription(vendor.description ?? '');
    setLogo(vendor.logo ? [vendor.logo] : []);
    setCover(vendor.cover_image ? [vendor.cover_image] : []);
    setGallery(vendor.gallery_urls ?? []);
    setWhatsapp(vendor.contact_info?.whatsapp ?? '');
    setPhone(vendor.contact_info?.phone ?? '');
    setEmail(vendor.contact_info?.email ?? '');
    setInstagram(vendor.contact_info?.instagram ?? '');
    // Seed the editable form once per vendor identity. Depending on the whole
    // `vendor` object would clobber in-progress edits whenever any field
    // refetches, so we intentionally key on the id only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendor?.id]);

  if (vendorLoading || !vendor) {
    return (
      <ScreenWrapper>
        <ActivityIndicator size="small" color={editorial.primaryContainer} className="mt-[60px]" />
      </ScreenWrapper>
    );
  }

  // vendors UPDATE RLS only permits owner/manager — show staff an honest
  // read-only surface instead of an editor whose saves would fail.
  if (myRole === 'staff') {
    return <StorefrontReadOnly vendorId={vendor.id} businessName={vendor.business_name} />;
  }

  const uploadNewPhotos = async (uris: string[], bucket: string): Promise<string[]> => {
    const token = await getToken({ template: 'supabase' });
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    if (!token || !supabaseUrl) return uris.filter(isRemoteUrl);

    const result: string[] = [];
    for (const uri of uris) {
      if (isRemoteUrl(uri)) {
        result.push(uri);
        continue;
      }
      const filename = `${user?.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      const url = await uploadToBucket(bucket, filename, uri, token, supabaseUrl);
      if (url) result.push(url);
    }
    return result;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const [uploadedLogo, uploadedCover, uploadedGallery] = await Promise.all([
        uploadNewPhotos(logo, 'vendor-portfolios'),
        uploadNewPhotos(cover, 'vendor-portfolios'),
        uploadNewPhotos(gallery, 'vendor-portfolios'),
      ]);

      await updateProfile.mutateAsync({
        vendorId: vendor.id,
        patch: {
          bio,
          description,
          logo: uploadedLogo[0] ?? null,
          cover_image: uploadedCover[0] ?? null,
          gallery_urls: uploadedGallery,
          contact_info: { whatsapp, phone, email, instagram },
        },
      });

      setLogo(uploadedLogo);
      setCover(uploadedCover);
      setGallery(uploadedGallery);
      Alert.alert('Saved', 'Your storefront has been updated.');
    } catch (err) {
      Alert.alert('Something went wrong', getErrorMessage(err, 'Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const handleAddPackage = () => {
    if (!newPackage.name.trim() || !newPackage.price.trim()) return;
    const pkg: VendorPackage = {
      id: `${Date.now()}`,
      name: newPackage.name.trim(),
      price: Number(newPackage.price) || 0,
      description: newPackage.description.trim(),
      includes: [],
    };
    const next = [...(vendor.packages ?? []), pkg];
    updatePackages.mutate({ vendorId: vendor.id, packages: next });
    setNewPackage({ name: '', price: '', description: '' });
  };

  const handleRemovePackage = (id: string) => {
    const next = (vendor.packages ?? []).filter((p) => p.id !== id);
    updatePackages.mutate({ vendorId: vendor.id, packages: next });
  };

  return (
    <ScreenWrapper>
      <Text className="font-dancing-script-bold text-[28px] text-ed-primary-container mb-5">
        Storefront
      </Text>

      <SectionTitle>Photos</SectionTitle>
      <View className="flex-row gap-6 mb-5">
        <View>
          <Text className="font-work-sans-bold text-[11px] text-ed-on-surface-variant mb-2 text-center">Logo</Text>
          <PhotoUploader photos={logo} onPhotosChange={setLogo} maxPhotos={1} circular label="Add logo" />
        </View>
        <View className="flex-1">
          <Text className="font-work-sans-bold text-[11px] text-ed-on-surface-variant mb-2">Cover photo</Text>
          <PhotoUploader photos={cover} onPhotosChange={setCover} maxPhotos={1} />
        </View>
      </View>
      <Text className="font-work-sans-bold text-[11px] text-ed-on-surface-variant mb-2">Gallery</Text>
      <View className="mb-5">
        <PhotoUploader photos={gallery} onPhotosChange={setGallery} maxPhotos={10} />
      </View>

      <SectionTitle>Basics</SectionTitle>
      <Field label="Bio" value={bio} onChangeText={setBio} placeholder="A short one-line summary" multiline />
      <Field
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Tell couples about your business"
        multiline
        style={{ minHeight: 90, textAlignVertical: 'top' }}
      />

      <SectionTitle>Contact info</SectionTitle>
      <Field label="WhatsApp" value={whatsapp} onChangeText={setWhatsapp} placeholder="+255…" keyboardType="phone-pad" />
      <Field label="Phone" value={phone} onChangeText={setPhone} placeholder="+255…" keyboardType="phone-pad" />
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@business.com" keyboardType="email-address" autoCapitalize="none" />
      <Field label="Instagram" value={instagram} onChangeText={setInstagram} placeholder="@yourbusiness" autoCapitalize="none" />

      <SectionTitle>Packages</SectionTitle>
      {(vendor.packages ?? []).map((pkg) => (
        <View
          key={pkg.id}
          className="flex-row items-center justify-between bg-ed-surface-container-lowest rounded-2xl border border-ed-outline-variant p-3.5 mb-2.5"
          style={shadowSoftSm}
        >
          <View className="flex-1 mr-3">
            <Text className="font-space-grotesk-bold text-sm text-ed-on-surface">{pkg.name}</Text>
            <Text className="font-work-sans-bold text-xs text-ed-primary-container mt-0.5">
              {formatCurrency(pkg.price)}
            </Text>
          </View>
          <Pressable onPress={() => handleRemovePackage(pkg.id)} className="p-1.5">
            <Ionicons name="trash-outline" size={18} color={editorial.onSurfaceVariant} />
          </Pressable>
        </View>
      ))}

      <View
        className="bg-ed-surface-container-lowest rounded-2xl border border-ed-outline-variant p-3.5 mb-6 gap-2.5"
        style={shadowSoftSm}
      >
        <TextInput
          value={newPackage.name}
          onChangeText={(v) => setNewPackage((p) => ({ ...p, name: v }))}
          placeholder="Package name"
          placeholderTextColor={editorial.onSurfaceVariant}
          className="font-work-sans text-sm text-ed-on-surface"
        />
        <TextInput
          value={newPackage.price}
          onChangeText={(v) => setNewPackage((p) => ({ ...p, price: v.replace(/[^0-9]/g, '') }))}
          placeholder="Price (TZS)"
          placeholderTextColor={editorial.onSurfaceVariant}
          keyboardType="number-pad"
          className="font-work-sans text-sm text-ed-on-surface"
        />
        <TextInput
          value={newPackage.description}
          onChangeText={(v) => setNewPackage((p) => ({ ...p, description: v }))}
          placeholder="What's included"
          placeholderTextColor={editorial.onSurfaceVariant}
          className="font-work-sans text-sm text-ed-on-surface"
        />
        <Pressable
          onPress={handleAddPackage}
          disabled={!newPackage.name.trim() || !newPackage.price.trim() || updatePackages.isPending}
          className={`self-start flex-row items-center gap-1.5 ${
            !newPackage.name.trim() || !newPackage.price.trim() || updatePackages.isPending ? 'opacity-50' : 'opacity-100'
          }`}
        >
          <Ionicons name="add-circle-outline" size={18} color={editorial.primaryContainer} />
          <Text className="font-work-sans-bold text-[13px] text-ed-primary-container">Add package</Text>
        </Pressable>
      </View>

      <Pressable
        disabled={saving}
        onPress={handleSave}
        className={`bg-ed-primary-container rounded-[14px] py-3.5 items-center ${saving ? 'opacity-50' : 'opacity-100'}`}
      >
        <Text className="font-work-sans-bold text-sm text-white">
          {saving ? 'Saving…' : 'Save changes'}
        </Text>
      </Pressable>
    </ScreenWrapper>
  );
}
