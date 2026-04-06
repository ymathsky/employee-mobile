import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
} from 'react-native';
import api from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ManagerDashboardScreen() {
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/manager_analytics.php');
      setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner fullScreen />;

  const stats = [
    { label: 'Team Size',           value: data?.team_size              ?? '—', color: '#4f46e5' },
    { label: 'Present Today',       value: data?.present_today          ?? '—', color: '#10b981' },
    { label: 'On Leave Today',      value: data?.on_leave_today         ?? '—', color: '#f59e0b' },
    { label: 'Pending Leave',       value: data?.pending_leave_requests ?? '—', color: '#ef4444' },
    { label: 'Pending Adjustments', value: data?.pending_adjustments    ?? '—', color: '#8b5cf6' },
  ];

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
    >
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Manager Dashboard</Text>
        <Text style={styles.bannerSub}>Team overview for today</Text>
      </View>

      <View style={styles.grid}>
        {stats.map((s) => (
          <View key={s.label} style={[styles.statCard, { borderTopColor: s.color }]}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Recent Team Attendance */}
      {!!data?.recent_logs?.length && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Attendance</Text>
          {data.recent_logs.map((log, i) => (
            <View key={i} style={styles.logRow}>
              <Text style={styles.logName}>{log.employee_name}</Text>
              <Text style={styles.logTime}>{log.time_in ?? '—'} → {log.time_out ?? 'Active'}</Text>
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
  logRow:       { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between' },
  logName:      { fontWeight: '600', color: '#111827' },
  logTime:      { fontSize: 13, color: '#6b7280' },
});
