/**
 * Profile screen (spec §7.11)
 *
 * Full account and preferences management:
 * - Profile photo picker with square crop & device compression (< 8 MB)
 * - Email verification badge
 * - Role badges (STUDENT, VOLUNTEER, ADMIN, etc.)
 * - Editable profile fields (name, gender, phone, college)
 * - Promotional emails toggle
 * - 4-category notification preferences toggles
 * - Save profile changes action
 * - Log out & Log out everywhere
 * - Delete account confirmation modal (re-enter password) + AccountBlocked handling
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Screen, Button, TextField, Divider } from '../../src/components';
import { colors, typography, spacing, radii } from '../../src/theme';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  AlertCircle,
  Bell,
  Mail,
  LogOut,
  Trash2,
  ShieldAlert,
  User as UserIcon,
} from 'lucide-react-native';
import { api } from '../../src/api/client';
import { useAuthStore, selectUser } from '../../src/store/authStore';
import { ONBOARDING_FIELDS } from '../../src/features/auth/onboardingFields';
import { AppApiError } from '../../src/lib/errors';
import type { Gender } from '../../src/lib/schemas';

export default function ProfileScreen(): React.JSX.Element {
  const user = useAuthStore(selectUser);
  const { setUser, logout } = useAuthStore();

  // Personal fields
  const [name, setName]               = useState(user?.name ?? '');
  const [gender, setGender]           = useState<Gender | null>((user?.gender as Gender) ?? null);
  const [phone, setPhone]             = useState(user?.phoneNumber ?? '');
  const [college, setCollege]         = useState(user?.college ?? user?.branch ?? '');
  const [photoUrl, setPhotoUrl]       = useState<string | null>(user?.profilePhotoUrl ?? null);

  // Preference toggles
  const [promoEmails, setPromoEmails] = useState(user?.promotionalEmailsOptIn ?? false);
  const [eventReminders, setEventReminders] = useState(user?.notificationPreferences?.eventReminders ?? true);
  const [announcements, setAnnouncements]   = useState(user?.notificationPreferences?.announcements ?? true);
  const [liveUpdates, setLiveUpdates]       = useState(user?.notificationPreferences?.liveUpdates ?? true);
  const [ticketUpdates, setTicketUpdates]   = useState(user?.notificationPreferences?.ticketUpdates ?? true);

  // Async states
  const [saving, setSaving]                 = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loggingOut, setLoggingOut]         = useState(false);
  const [statusMessage, setStatusMessage]   = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Delete account modal state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword]         = useState('');
  const [deletingAccount, setDeletingAccount]       = useState(false);
  const [deleteError, setDeleteError]               = useState<string | null>(null);

  // Photo pick & compress (< 8 MB limit per spec §7.11)
  const handlePickPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Please allow camera roll access to upload a profile photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]?.uri) return;

      setUploadingPhoto(true);
      setStatusMessage(null);

      // Compress and resize image using ImageManipulator to ensure it stays well under 8 MB
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 600, height: 600 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      const formData = new FormData();
      formData.append('photo', {
        uri: manipulated.uri,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      } as never);

      const uploadRes = await api.uploadProfilePhoto(formData);
      setPhotoUrl(uploadRes.profilePhotoUrl);
      if (user) {
        setUser({ ...user, profilePhotoUrl: uploadRes.profilePhotoUrl });
      }
      setStatusMessage({ type: 'success', text: 'Profile photo updated successfully.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Photo upload failed.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveChanges = async () => {
    setStatusMessage(null);
    try {
      setSaving(true);
      const updatedUser = await api.updateProfile({
        name:                   name.trim(),
        gender:                 gender ?? undefined,
        phoneNumber:            phone.trim(),
        college:                college.trim(),
        promotionalEmailsOptIn: promoEmails,
        notificationPreferences: {
          eventReminders,
          announcements,
          liveUpdates,
          ticketUpdates,
        },
      });
      setUser(updatedUser);
      setStatusMessage({ type: 'success', text: 'Profile changes saved successfully.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async (everywhere = false) => {
    Alert.alert(
      everywhere ? 'Log out everywhere?' : 'Log out?',
      everywhere
        ? 'This will sign you out of all sessions on all devices.'
        : 'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoggingOut(true);
              if (everywhere) {
                await api.logoutAll();
              } else {
                await api.logout();
              }
            } catch {
              // Ignore network failures on logout
            } finally {
              await logout();
              setLoggingOut(false);
              router.replace('/(tabs)');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    if (!deletePassword) {
      setDeleteError('Please enter your password to confirm deletion.');
      return;
    }

    try {
      setDeletingAccount(true);
      await api.deleteAccount({ password: deletePassword });
      setDeleteModalVisible(false);
      await logout();
      Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
      router.replace('/(tabs)');
    } catch (err: unknown) {
      if (err instanceof AppApiError && err.isAccountBlocked) {
        setDeleteError(
          'Account cannot be deleted because you hold an administrative or editor role. Please contact the administrator.'
        );
      } else if (err instanceof Error) {
        setDeleteError(err.message);
      } else {
        setDeleteError('Failed to delete account. Please check your password and try again.');
      }
    } finally {
      setDeletingAccount(false);
    }
  };

  const genderOptions = ONBOARDING_FIELDS.find((f) => f.key === 'gender')?.options ?? [];

  return (
    <Screen scroll keyboardAware contentStyle={styles.container}>
      {/* Top Bar with Back Button */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={20} color={colors.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Profile & Settings</Text>
        <View style={styles.topBarSpacer} />
      </View>

      {/* Avatar & Photo Picker */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrap}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <UserIcon size={44} color={colors.textTertiary} strokeWidth={1.5} />
            </View>
          )}
          <TouchableOpacity
            onPress={handlePickPhoto}
            style={styles.cameraBadge}
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
            disabled={uploadingPhoto}
          >
            <Camera size={16} color={colors.textInverse} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <Text style={styles.userName}>{user?.name ?? 'Delegate'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>

        {/* Badges row */}
        <View style={styles.badgesRow}>
          {user?.emailVerified ? (
            <View style={styles.verifiedBadge}>
              <CheckCircle2 size={12} color={colors.success} strokeWidth={2} />
              <Text style={styles.verifiedBadgeText}>VERIFIED EMAIL</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => router.push('/(auth)/verify-pending')}
              style={styles.unverifiedBadge}
              accessibilityRole="button"
            >
              <AlertCircle size={12} color={colors.warning} strokeWidth={2} />
              <Text style={styles.unverifiedBadgeText}>UNVERIFIED — TAP TO VERIFY</Text>
            </TouchableOpacity>
          )}

          {user?.role && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{user.role}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Status notification banner */}
      {statusMessage && (
        <View
          style={[
            styles.statusBanner,
            statusMessage.type === 'success' ? styles.statusSuccess : styles.statusError,
          ]}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 size={16} color={colors.success} strokeWidth={2} />
          ) : (
            <AlertCircle size={16} color={colors.error} strokeWidth={2} />
          )}
          <Text
            style={[
              styles.statusText,
              statusMessage.type === 'success' ? styles.statusTextSuccess : styles.statusTextError,
            ]}
          >
            {statusMessage.text}
          </Text>
        </View>
      )}

      {/* Section: Personal Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Details</Text>
        <TextField
          label="Full name"
          value={name}
          onChangeText={setName}
          placeholder="Your full name"
        />

        {/* Gender selector */}
        <View style={styles.genderContainer}>
          <Text style={styles.fieldLabel}>Gender</Text>
          <View style={styles.genderOptions}>
            {genderOptions.map((opt) => {
              const isSelected = gender === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setGender(opt.value as Gender)}
                  style={[styles.genderChip, isSelected && styles.genderChipSelected]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={[styles.genderChipText, isSelected && styles.genderChipTextSelected]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TextField
          label="Phone number"
          value={phone}
          onChangeText={setPhone}
          placeholder="+91 98765 43210"
          keyboardType="phone-pad"
        />

        <TextField
          label="College or institution"
          value={college}
          onChangeText={setCollege}
          placeholder="e.g. MNIT Jaipur"
        />
      </View>

      <Divider style={styles.divider} />

      {/* Section: Email Preferences */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Mail size={18} color={colors.primary} strokeWidth={2} />
          <Text style={styles.sectionTitle}>Email Preferences</Text>
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchTextContainer}>
            <Text style={styles.switchLabel}>Promotional emails</Text>
            <Text style={styles.switchSub}>Special partner offers, newsletters, and summit updates</Text>
          </View>
          <Switch
            value={promoEmails}
            onValueChange={setPromoEmails}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.textPrimary}
          />
        </View>
      </View>

      <Divider style={styles.divider} />

      {/* Section: Notifications */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Bell size={18} color={colors.primary} strokeWidth={2} />
          <Text style={styles.sectionTitle}>Push Notifications</Text>
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchTextContainer}>
            <Text style={styles.switchLabel}>Event reminders</Text>
            <Text style={styles.switchSub}>Reminders 15 minutes before your bookmarked sessions</Text>
          </View>
          <Switch
            value={eventReminders}
            onValueChange={setEventReminders}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.textPrimary}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchTextContainer}>
            <Text style={styles.switchLabel}>Announcements</Text>
            <Text style={styles.switchSub}>Important summit notices from E-Cell organisers</Text>
          </View>
          <Switch
            value={announcements}
            onValueChange={setAnnouncements}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.textPrimary}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchTextContainer}>
            <Text style={styles.switchLabel}>Live updates</Text>
            <Text style={styles.switchSub}>Venue changes, speaker arrivals, and real-time alerts</Text>
          </View>
          <Switch
            value={liveUpdates}
            onValueChange={setLiveUpdates}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.textPrimary}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchTextContainer}>
            <Text style={styles.switchLabel}>Ticket updates</Text>
            <Text style={styles.switchSub}>Pass verification, check-in confirmations, kit status</Text>
          </View>
          <Switch
            value={ticketUpdates}
            onValueChange={setTicketUpdates}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.textPrimary}
          />
        </View>
      </View>

      {/* Save Button */}
      <Button
        label="Save changes"
        onPress={handleSaveChanges}
        loading={saving}
        fullWidth
        size="lg"
        style={styles.saveButton}
      />

      <Divider style={styles.divider} />

      {/* Section: Account Actions */}
      <View style={styles.dangerSection}>
        <Button
          label="Log out"
          onPress={() => handleLogout(false)}
          variant="secondary"
          fullWidth
          loading={loggingOut}
          leftIcon={<LogOut size={16} color={colors.textPrimary} strokeWidth={2} />}
        />

        <Button
          label="Log out everywhere"
          onPress={() => handleLogout(true)}
          variant="secondary"
          fullWidth
          loading={loggingOut}
        />

        <Button
          label="Delete account"
          onPress={() => {
            setDeleteError(null);
            setDeletePassword('');
            setDeleteModalVisible(true);
          }}
          variant="danger"
          fullWidth
          leftIcon={<Trash2 size={16} color={colors.textInverse} strokeWidth={2} />}
          style={styles.deleteButton}
        />
      </View>

      {/* Re-enter password modal for Account Deletion */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <ShieldAlert size={28} color={colors.error} strokeWidth={2} />
              <Text style={styles.modalTitle}>Delete Account</Text>
            </View>

            <Text style={styles.modalBody}>
              This action is permanent and cannot be undone. All your registrations, tickets, and data will be erased.
            </Text>

            {deleteError && (
              <View style={styles.modalErrorBox}>
                <AlertCircle size={16} color={colors.error} strokeWidth={2} />
                <Text style={styles.modalErrorText}>{deleteError}</Text>
              </View>
            )}

            <TextField
              label="Confirm your password"
              placeholder="••••••••"
              value={deletePassword}
              onChangeText={setDeletePassword}
              isPassword
              containerStyle={styles.modalInput}
            />

            <View style={styles.modalActions}>
              <Button
                label="Cancel"
                onPress={() => setDeleteModalVisible(false)}
                variant="secondary"
                style={styles.modalCancel}
              />
              <Button
                label="Delete"
                onPress={handleDeleteAccount}
                variant="danger"
                loading={deletingAccount}
                style={styles.modalConfirm}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing['12'],
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing['6'],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizeLg,
    color: colors.textPrimary,
  },
  topBarSpacer: {
    width: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing['6'],
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: spacing['3'],
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: radii.full,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  userName: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizeXl,
    color: colors.textPrimary,
  },
  userEmail: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: typography.sizeSm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing['2'],
    marginTop: spacing['3'],
    justifyContent: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successBg,
    borderColor: colors.success,
    borderWidth: 1,
    paddingHorizontal: spacing['2'],
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  verifiedBadgeText: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: typography.size3xs,
    color: colors.success,
    letterSpacing: typography.trackingWide,
  },
  unverifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warningBg,
    borderColor: colors.warning,
    borderWidth: 1,
    paddingHorizontal: spacing['2'],
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  unverifiedBadgeText: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: typography.size3xs,
    color: colors.warning,
    letterSpacing: typography.trackingWide,
  },
  roleBadge: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    paddingHorizontal: spacing['2'],
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  roleBadgeText: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: typography.size3xs,
    color: colors.primaryLight,
    letterSpacing: typography.trackingWide,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    padding: spacing['3'],
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing['4'],
  },
  statusSuccess: {
    backgroundColor: colors.successBg,
    borderColor: colors.success,
  },
  statusError: {
    backgroundColor: colors.errorBg,
    borderColor: colors.error,
  },
  statusText: {
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.sizeSm,
    flex: 1,
  },
  statusTextSuccess: {
    color: colors.success,
  },
  statusTextError: {
    color: colors.error,
  },
  section: {
    gap: spacing['4'],
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  sectionTitle: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: typography.sizeLg,
    color: colors.textPrimary,
  },
  fieldLabel: {
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.sizeSm,
    color: colors.textSecondary,
    marginBottom: spacing['2'],
  },
  genderContainer: {
    gap: spacing['1'],
  },
  genderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2'],
  },
  genderChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
  },
  genderChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderChipText: {
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.sizeSm,
    color: colors.textSecondary,
  },
  genderChipTextSelected: {
    color: colors.textInverse,
    fontFamily: typography.fontFamilySemiBold,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing['3'],
    gap: spacing['3'],
  },
  switchTextContainer: {
    flex: 1,
  },
  switchLabel: {
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.sizeBase,
    color: colors.textPrimary,
  },
  switchSub: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: typography.sizeXs,
    color: colors.textTertiary,
    marginTop: 2,
    lineHeight: typography.sizeXs * typography.lineHeightNormal,
  },
  divider: {
    marginVertical: spacing['6'],
  },
  saveButton: {
    marginTop: spacing['6'],
  },
  dangerSection: {
    gap: spacing['3'],
  },
  deleteButton: {
    marginTop: spacing['2'],
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['6'],
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.xl,
    padding: spacing['6'],
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    marginBottom: spacing['3'],
  },
  modalTitle: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizeXl,
    color: colors.textPrimary,
  },
  modalBody: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: typography.sizeSm,
    color: colors.textSecondary,
    lineHeight: typography.sizeSm * typography.lineHeightNormal,
    marginBottom: spacing['4'],
  },
  modalErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    backgroundColor: colors.errorBg,
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing['3'],
    marginBottom: spacing['4'],
  },
  modalErrorText: {
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.sizeXs,
    color: colors.error,
    flex: 1,
  },
  modalInput: {
    marginBottom: spacing['4'],
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing['3'],
  },
  modalCancel: {
    flex: 1,
  },
  modalConfirm: {
    flex: 1,
  },
});
