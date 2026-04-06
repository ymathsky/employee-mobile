import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
} from 'react-native';
import api from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDashboardScreen() {
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/admin_analytics.php');
      setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner fullScreen />;

  const stats = [
    { label: 'Total Employees',   value: data?.total_employees        ?? '—', color: '#4f46e5' },
    { label: 'Present Today',     value: data?.present_today          ?? '—', color: '#10b981' },
    { label: 'On Leave',          value: data?.on_leave_today         ?? '—', color: '#f59e0b' },
    { label: 'Pending Leave',     value: data?.pending_leave          ?? '—', color: '#ef4444' },
    { label: 'Departments',       value: data?.total_departments      ?? '—', color: '#8b5cf6' },
    { label: 'Unpaid Payrolls',   value: data?.unpaid_payrolls        ?? '—', color: '#ec4899' },
  ];

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
    >
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Admin Dashboard</Text>
        <Text style={styles.bannerSub}>System overview</Text>
      </View>

      <View style={styles.grid}>
        {stats.map((s) => (
          <View key={s.label} style={[styles.statCard, { borderTopColor: s.color }]}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Announcements */}
      {!!data?.announcements?.length && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Announcements</Text>
          {data.announcements.map((a, i) => (
            <View key={i} style={styles.annoCard}>
              <Text style={styles.annoTitle}>{a.title}</Text>
              <Text style={styles.annoBody}>{a.message}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: '#f5f3ff' },
  banner:       { backgroundColor: '#4f46e5', paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20 },
  bannerTitle:  { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  bannerSub:    { color: '#c7d2fe', fontSize: 14, marginTop: 4 },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 10 },
  statCard:     { flex: 1, minWidth: '44%', backgroundColor: '#fff', borderRadius: 12, padding: 16, borderTopWidth: 4, elevation: 2 },
  statValue:    { fontSize: 28, fontWeight: 'bold' },
  statLabel:    { fontSize: 12, color: '#6b7280', marginTop: 4 },
  section:      { paddingHorizontal: 16, paddingBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e1b4b', marginBottom: 12 },
  annoCard:     { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#4f46e5' },
  annoTitle:    { fontWeight: '600', color: '#111827', marginBottom: 4 },
  annoBody:     { color: '#6b7280', fontSize: 13 },
});
