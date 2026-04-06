import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
  TouchableOpacity, Image,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api, { UPLOADS_URL } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DashboardScreen() {
  const { user }        = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/employee_analytics.php');
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner fullScreen />;

  const picUrl = user?.profile_picture_url
    ? `${UPLOADS_URL}/${user.profile_picture_url}`
    : null;

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
    >
      {/* Header Banner */}
      <View style={styles.banner}>
        {picUrl
          ? <Image source={{ uri: picUrl }} style={styles.avatar} />
          : <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarText}>{user?.first_name?.[0]}{user?.last_name?.[0]}</Text>
            </View>
        }
        <View>
          <Text style={styles.greeting}>Good day,</Text>
          <Text style={styles.name}>{user?.first_name} {user?.last_name}</Text>
          <Text style={styles.jobTitle}>{user?.job_title} · {user?.department}</Text>
        </View>
      </View>

      {/* Stat Cards */}
      <View style={styles.grid}>
        <StatCard label="Days Present"   value={data?.days_present   ?? '—'} color="#4f46e5" />
        <StatCard label="Days Absent"    value={data?.days_absent    ?? '—'} color="#ef4444" />
        <StatCard label="Leave Balance"  value={data?.leave_balance  ?? '—'} color="#10b981" />
        <StatCard label="Overtime Hrs"   value={data?.overtime_hours ?? '—'} color="#f59e0b" />
      </View>

      {/* Announcements */}
      {!!data?.announcements?.length && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Announcements</Text>
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

function StatCard({ label, value, color }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: '#f5f3ff' },
  banner:       { backgroundColor: '#4f46e5', padding: 24, paddingTop: 56, flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar:       { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#fff' },
  avatarFallback: { backgroundColor: '#818cf8', justifyContent: 'center', alignItems: 'center' },
  avatarText:   { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  greeting:     { color: '#c7d2fe', fontSize: 13 },
  name:         { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  jobTitle:     { color: '#c7d2fe', fontSize: 13 },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12 },
  statCard:     { flex: 1, minWidth: '44%', backgroundColor: '#fff', borderRadius: 12, padding: 16, borderTopWidth: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statValue:    { fontSize: 28, fontWeight: 'bold' },
  statLabel:    { fontSize: 12, color: '#6b7280', marginTop: 4 },
  section:      { paddingHorizontal: 16, paddingBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e1b4b', marginBottom: 12 },
  annoCard:     { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#4f46e5' },
  annoTitle:    { fontWeight: '600', color: '#111827', marginBottom: 4 },
  annoBody:     { color: '#6b7280', fontSize: 13 },
});
