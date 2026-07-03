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
import { editorial, shadowSoftSm } from '@/constants/theme';
import type { VendorPackage } from '@/types/vendor';

function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: editorial.onSurfaceVariant, marginBottom: 6 }}>
        {label}
      </Text>
      <TextInput
        placeholderTextColor={editorial.onSurfaceVariant}
        style={{
          backgroundColor: editorial.surfaceContainerLowest,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: editorial.outlineVariant,
          padding: 14,
          fontFamily: 'WorkSans-Regular',
          fontSize: 14,
          color: editorial.onSurface,
        }}
        {...props}
      />
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 16, color: editorial.onSurface, marginBottom: 12, marginTop: 8 }}>
      {children}
    </Text>
  );
}

const isRemoteUrl = (uri: string) => uri.startsWith('http://') || uri.startsWith('https://');

function StorefrontReadOnly({ vendorId, businessName }: { vendorId: string; businessName: string }) {
  const router = useRouter();
  return (
    <ScreenWrapper>
      <Text style={{ fontFamily: 'DancingScript-Bold', fontSize: 28, color: editorial.primaryContainer, marginBottom: 20 }}>
        Storefront
      </Text>
      <View
        style={[
          {
            backgroundColor: editorial.surfaceContainerLowest,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: editorial.outlineVariant,
            padding: 20,
            alignItems: 'center',
          },
          shadowSoftSm,
        ]}
      >
        <Ionicons name="lock-closed-outline" size={28} color={editorial.onSurfaceVariant} style={{ marginBottom: 10 }} />
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: editorial.onSurface, textAlign: 'center' }}>
          View-only access
        </Text>
        <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 13, color: editorial.onSurfaceVariant, textAlign: 'center', marginTop: 6 }}>
          Only the account owner or a manager can edit the {businessName} storefront.
        </Text>
        <Pressable
          onPress={() => router.push(`/vendor/${vendorId}`)}
          style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 6 }}
        >
          <Ionicons name="storefront-outline" size={16} color={editorial.primaryContainer} />
          <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 13, color: editorial.primaryContainer }}>
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
  }, [vendor?.id]);

  if (vendorLoading || !vendor) {
    return (
      <ScreenWrapper>
        <ActivityIndicator size="small" color={editorial.primaryContainer} style={{ marginTop: 60 }} />
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
    } catch (err: any) {
      Alert.alert('Something went wrong', err?.message ?? 'Please try again.');
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
      <Text style={{ fontFamily: 'DancingScript-Bold', fontSize: 28, color: editorial.primaryContainer, marginBottom: 20 }}>
        Storefront
      </Text>

      <SectionTitle>Photos</SectionTitle>
      <View style={{ flexDirection: 'row', gap: 24, marginBottom: 20 }}>
        <View>
          <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 11, color: editorial.onSurfaceVariant, marginBottom: 8, textAlign: 'center' }}>Logo</Text>
          <PhotoUploader photos={logo} onPhotosChange={setLogo} maxPhotos={1} circular label="Add logo" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 11, color: editorial.onSurfaceVariant, marginBottom: 8 }}>Cover photo</Text>
          <PhotoUploader photos={cover} onPhotosChange={setCover} maxPhotos={1} />
        </View>
      </View>
      <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 11, color: editorial.onSurfaceVariant, marginBottom: 8 }}>Gallery</Text>
      <View style={{ marginBottom: 20 }}>
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
        style={{
          backgroundColor: editorial.surfaceContainerLowest,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: editorial.outlineVariant,
          padding: 14,
          fontFamily: 'WorkSans-Regular',
          fontSize: 14,
          color: editorial.onSurface,
          minHeight: 90,
          textAlignVertical: 'top',
        }}
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
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: editorial.surfaceContainerLowest,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: editorial.outlineVariant,
              padding: 14,
              marginBottom: 10,
            },
            shadowSoftSm,
          ]}
        >
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: editorial.onSurface }}>{pkg.name}</Text>
            <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 12, color: editorial.primaryContainer, marginTop: 2 }}>
              {formatCurrency(pkg.price)}
            </Text>
          </View>
          <Pressable onPress={() => handleRemovePackage(pkg.id)} style={{ padding: 6 }}>
            <Ionicons name="trash-outline" size={18} color={editorial.onSurfaceVariant} />
          </Pressable>
        </View>
      ))}

      <View
        style={[
          {
            backgroundColor: editorial.surfaceContainerLowest,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: editorial.outlineVariant,
            padding: 14,
            marginBottom: 24,
            gap: 10,
          },
          shadowSoftSm,
        ]}
      >
        <TextInput
          value={newPackage.name}
          onChangeText={(v) => setNewPackage((p) => ({ ...p, name: v }))}
          placeholder="Package name"
          placeholderTextColor={editorial.onSurfaceVariant}
          style={{ fontFamily: 'WorkSans-Regular', fontSize: 14, color: editorial.onSurface }}
        />
        <TextInput
          value={newPackage.price}
          onChangeText={(v) => setNewPackage((p) => ({ ...p, price: v.replace(/[^0-9]/g, '') }))}
          placeholder="Price (TZS)"
          placeholderTextColor={editorial.onSurfaceVariant}
          keyboardType="number-pad"
          style={{ fontFamily: 'WorkSans-Regular', fontSize: 14, color: editorial.onSurface }}
        />
        <TextInput
          value={newPackage.description}
          onChangeText={(v) => setNewPackage((p) => ({ ...p, description: v }))}
          placeholder="What's included"
          placeholderTextColor={editorial.onSurfaceVariant}
          style={{ fontFamily: 'WorkSans-Regular', fontSize: 14, color: editorial.onSurface }}
        />
        <Pressable
          onPress={handleAddPackage}
          disabled={!newPackage.name.trim() || !newPackage.price.trim() || updatePackages.isPending}
          style={{
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            opacity: !newPackage.name.trim() || !newPackage.price.trim() || updatePackages.isPending ? 0.5 : 1,
          }}
        >
          <Ionicons name="add-circle-outline" size={18} color={editorial.primaryContainer} />
          <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 13, color: editorial.primaryContainer }}>Add package</Text>
        </Pressable>
      </View>

      <Pressable
        disabled={saving}
        onPress={handleSave}
        style={{
          backgroundColor: editorial.primaryContainer,
          borderRadius: 14,
          paddingVertical: 14,
          alignItems: 'center',
          opacity: saving ? 0.5 : 1,
        }}
      >
        <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 14, color: '#fff' }}>
          {saving ? 'Saving…' : 'Save changes'}
        </Text>
      </Pressable>
    </ScreenWrapper>
  );
}
