import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, Alert, TextInput, Modal, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api, { UPLOADS_URL } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwForm, setPwForm]     = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/get_employee_details.php');
      setProfile(res.data?.employee ?? null);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pickAndUploadPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera roll access is needed to upload a photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const formData = new FormData();
    formData.append('profile_picture', {
      uri: asset.uri,
      name: 'profile.jpg',
      type: 'image/jpeg',
    });
    // Keep other fields unchanged
    formData.append('first_name', profile?.first_name ?? '');
    formData.append('last_name',  profile?.last_name  ?? '');
    formData.append('email',      profile?.email      ?? '');

    setSaving(true);
    try {
      const res = await api.post('/update_my_profile.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        Alert.alert('Success', 'Profile picture updated.');
        load();
      } else {
        Alert.alert('Error', res.data.message);
      }
    } catch (e) {
      Alert.alert('Error', 'Upload failed.');
    }
    setSaving(false);
  };

  const changePassword = async () => {
    if (pwForm.new_password !== pwForm.confirm_password) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post('/reset_password.php', pwForm);
      if (res.data.success) {
        Alert.alert('Success', 'Password changed.');
        setShowPwModal(false);
        setPwForm({ current_password: '', new_password: '', confirm_password: '' });
      } else {
        Alert.alert('Error', res.data.message);
      }
    } catch (e) { Alert.alert('Error', 'Failed to change password.'); }
    setSaving(false);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const picUrl = profile?.profile_picture_url
    ? `${UPLOADS_URL}/${profile.profile_picture_url}`
    : null;

  const rows = [
    ['Employee ID', profile?.employee_id],
    ['Email',       profile?.email],
    ['Department',  profile?.department],
    ['Job Title',   profile?.job_title],
    ['Status',      profile?.status],
    ['Date Hired',  profile?.hired_date],
    ['Role',        user?.role],
  ];

  return (
    <ScrollView style={styles.screen}>
      {/* Header */}
      <View style={styles.banner}>
        <TouchableOpacity onPress={pickAndUploadPhoto} disabled={saving}>
          {picUrl
            ? <Image source={{ uri: picUrl }} style={styles.avatar} />
            : <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarText}>{user?.first_name?.[0]}{user?.last_name?.[0]}</Text>
              </View>
          }
          <View style={styles.editBadge}><Text style={styles.editBadgeText}>{saving ? '…' : '✎'}</Text></View>
        </TouchableOpacity>
        <Text style={styles.name}>{profile?.first_name} {profile?.last_name}</Text>
        <Text style={styles.jobTitle}>{profile?.job_title}</Text>
      </View>

      {/* Info */}
      <View style={styles.card}>
        {rows.map(([label, val]) => (
          <View key={label} style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue}>{val ?? '—'}</Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowPwModal(true)}>
          <Text style={styles.actionBtnText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.logoutBtn]} onPress={logout}>
          <Text style={[styles.actionBtnText, { color: '#ef4444' }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Change Password Modal */}
      <Modal visible={showPwModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Change Password</Text>
            {['current_password', 'new_password', 'confirm_password'].map((field) => (
              <TextInput
                key={field}
                style={styles.input}
                placeholder={field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                secureTextEntry
                value={pwForm[field]}
                onChangeText={v => setPwForm(f => ({ ...f, [field]: v }))}
              />
            ))}
            <TouchableOpacity style={styles.btn} onPress={changePassword} disabled={saving}>
              <Text style={styles.btnText}>{saving ? 'Saving…' : 'Update Password'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowPwModal(false)}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: '#f5f3ff' },
  banner:       { backgroundColor: '#4f46e5', paddingTop: 52, paddingBottom: 32, alignItems: 'center' },
  avatar:       { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#fff' },
  avatarFallback:{ backgroundColor: '#818cf8', justifyContent: 'center', alignItems: 'center' },
  avatarText:   { color: '#fff', fontWeight: 'bold', fontSize: 28 },
  editBadge:    { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  editBadgeText:{ fontSize: 14, color: '#4f46e5' },
  name:         { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 12 },
  jobTitle:     { color: '#c7d2fe', fontSize: 14, marginTop: 2 },
  card:         { margin: 16, backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden' },
  row:          { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  rowLabel:     { fontSize: 13, color: '#6b7280', flex: 1 },
  rowValue:     { fontSize: 13, color: '#111827', fontWeight: '500', flex: 2, textAlign: 'right' },
  actions:      { marginHorizontal: 16, marginBottom: 40, gap: 10 },
  actionBtn:    { backgroundColor: '#fff', paddingVertical: 14, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  actionBtnText:{ fontWeight: '600', color: '#4f46e5', fontSize: 15 },
  logoutBtn:    { borderWidth: 1, borderColor: '#fee2e2' },
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal:        { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle:   { fontSize: 18, fontWeight: 'bold', color: '#1e1b4b', marginBottom: 16 },
  input:        { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12, marginBottom: 12 },
  btn:          { backgroundColor: '#4f46e5', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  btnText:      { color: '#fff', fontWeight: '600', fontSize: 15 },
  cancel:       { textAlign: 'center', color: '#6b7280', paddingVertical: 8 },
});
