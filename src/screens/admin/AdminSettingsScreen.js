import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, TextInput, RefreshControl, Switch,
} from 'react-native';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminSettingsScreen() {
  const { logout }                  = useAuth();
  const [settings, setSettings]     = useState({});
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving]         = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/get_settings.php');
      setSettings(res.data?.settings ?? {});
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await api.post('/update_settings.php', { settings });
      if (res.data.success) Alert.alert('Saved', 'Settings updated.');
      else Alert.alert('Error', res.data.message);
    } catch (e) { Alert.alert('Error', 'Failed to save.'); }
    setSaving(false);
  };

  const update = (key, value) => setSettings(s => ({ ...s, [key]: value }));

  if (loading) return <LoadingSpinner fullScreen />;

  const textFields = [
    { key: 'company_name',          label: 'Company Name' },
    { key: 'company_address',       label: 'Company Address' },
    { key: 'work_hours_per_day',    label: 'Work Hours Per Day' },
    { key: 'overtime_rate',         label: 'Overtime Rate (multiplier)' },
    { key: 'sss_rate',              label: 'SSS Rate (%)' },
    { key: 'philhealth_rate',       label: 'PhilHealth Rate (%)' },
    { key: 'pagibig_rate',          label: 'Pag-IBIG Rate (%)' },
  ];

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
    >
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>System Settings</Text>
      </View>

      <View style={styles.card}>
        {textFields.map(({ key, label }) => (
          <View key={key} style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <TextInput
              style={styles.input}
              value={String(settings[key] ?? '')}
              onChangeText={v => update(key, v)}
              keyboardType={key.includes('rate') || key.includes('hours') ? 'numeric' : 'default'}
            />
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={saveSettings} disabled={saving}>
        <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutBtnText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:        { flex: 1, backgroundColor: '#f5f3ff' },
  headerBar:     { backgroundColor: '#4f46e5', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20 },
  headerTitle:   { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  card:          { margin: 16, backgroundColor: '#fff', borderRadius: 14, padding: 16 },
  fieldRow:      { marginBottom: 16 },
  fieldLabel:    { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input:         { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 11, fontSize: 14, backgroundColor: '#f9fafb' },
  saveBtn:       { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#4f46e5', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnText:   { color: '#fff', fontWeight: '700', fontSize: 15 },
  logoutBtn:     { marginHorizontal: 16, marginBottom: 40, backgroundColor: '#fff', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#fee2e2' },
  logoutBtnText: { color: '#ef4444', fontWeight: '600', fontSize: 15 },
});
