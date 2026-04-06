import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Alert, RefreshControl, Linking,
} from 'react-native';
import api, { BASE_URL } from '../../api/client';
import * as SecureStore from 'expo-secure-store';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function PayslipsScreen() {
  const [payslips, setPayslips]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/get_payslips.php');
      setPayslips(res.data?.payslips ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const viewPayslip = async (payrollId) => {
    try {
      const sessionId = await SecureStore.getItemAsync('phpsessid');
      const url = `${BASE_URL}/download_payslip.php?payroll_id=${payrollId}&PHPSESSID=${sessionId}`;
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert('Error', 'Could not open payslip.');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.screen}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>My Payslips</Text>
      </View>

      <FlatList
        data={payslips}
        keyExtractor={(item, i) => String(item.payroll_id ?? i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.period}>{item.pay_period_label ?? item.pay_period}</Text>
                <Text style={styles.runDate}>Processed: {item.run_date}</Text>
              </View>
              <TouchableOpacity style={styles.viewBtn} onPress={() => viewPayslip(item.payroll_id)}>
                <Text style={styles.viewBtnText}>View</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.amountRow}>
              <AmountItem label="Gross Pay"    value={item.gross_pay}    color="#4f46e5" />
              <AmountItem label="Deductions"   value={item.total_deductions} color="#ef4444" />
              <AmountItem label="Net Pay"      value={item.net_pay}      color="#10b981" />
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No payslips found.</Text>}
      />
    </View>
  );
}

function AmountItem({ label, value, color }) {
  return (
    <View style={styles.amountItem}>
      <Text style={[styles.amountValue, { color }]}>
        ₱{parseFloat(value ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
      </Text>
      <Text style={styles.amountLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: '#f5f3ff' },
  headerBar:    { backgroundColor: '#4f46e5', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20 },
  headerTitle:  { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  card:         { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  period:       { fontWeight: '700', fontSize: 15, color: '#1e1b4b', marginBottom: 2 },
  runDate:      { fontSize: 12, color: '#9ca3af' },
  viewBtn:      { backgroundColor: '#ede9fe', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  viewBtnText:  { color: '#4f46e5', fontWeight: '700', fontSize: 13 },
  amountRow:    { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12 },
  amountItem:   { flex: 1, alignItems: 'center' },
  amountValue:  { fontSize: 14, fontWeight: '700' },
  amountLabel:  { fontSize: 11, color: '#6b7280', marginTop: 2 },
  empty:        { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
});
