import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import database from '../services/database/Index';

export default function AttendanceViewerScreen({ route }) {
  const { userId, userName } = route?.params || {};
  
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const fetchAttendance = useCallback(async () => {
    if (!userId) return;
    
    try {
      const records = await database.getAttendanceByMonth(userId, selectedMonth, selectedYear);
      setAttendanceRecords(records);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
    }
  }, [userId, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAttendance();
    setRefreshing(false);
  };

  const handleMonthChange = (direction) => {
    if (direction === 'prev') {
      if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  const renderAttendanceItem = ({ item, index }) => {
    const date = new Date(item.timestamp?.seconds ? item.timestamp.seconds * 1000 : item.timestamp);
    
    return (
      <View style={styles.recordItem}>
        <View style={styles.recordLeft}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateDay}>{date.getDate()}</Text>
            <Text style={styles.dateMonth}>
              {months[date.getMonth()].substring(0, 3)}
            </Text>
          </View>
        </View>
        
        <View style={styles.recordMiddle}>
          <Text style={styles.recordTime}>
            {item.time || date.toLocaleTimeString('en-IN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
          <Text style={styles.recordDate}>
            {date.toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </Text>
        </View>
        
        <View style={styles.recordRight}>
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.statusText}>Present</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="event-busy" size={64} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>No Records Found</Text>
      <Text style={styles.emptySubtitle}>
        No attendance records for {months[selectedMonth - 1]} {selectedYear}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => {
          // Navigate back
        }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance Records</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Month Selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity 
          style={styles.monthBtn} 
          onPress={() => handleMonthChange('prev')}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        
        <View style={styles.monthDisplay}>
          <Text style={styles.monthText}>{months[selectedMonth - 1]}</Text>
          <Text style={styles.yearText}>{selectedYear}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.monthBtn} 
          onPress={() => handleMonthChange('next')}
        >
          <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <MaterialIcons name="person" size={20} color={COLORS.primary} />
        <Text style={styles.userName}>{userName || 'User'}</Text>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{attendanceRecords.length}</Text>
          <Text style={styles.statLabel}>Total Days</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {attendanceRecords.filter(r => {
              const date = new Date(r.timestamp?.seconds ? r.timestamp.seconds * 1000 : r.timestamp);
              return date.getDay() !== 0 && date.getDay() !== 6;
            }).length}
          </Text>
          <Text style={styles.statLabel}>Working Days</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {((attendanceRecords.length / 
              (selectedMonth === new Date().getMonth() + 1 && selectedYear === new Date().getFullYear() 
                ? new Date().getDate() 
                : new Date(selectedYear, selectedMonth, 0).getDate())) * 100).toFixed(0)}%
          </Text>
          <Text style={styles.statLabel}>Attendance %</Text>
        </View>
      </View>

      {/* Attendance List */}
      <FlatList
        data={attendanceRecords}
        renderItem={renderAttendanceItem}
        keyExtractor={(item, index) => item.id || index.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: COLORS.primary,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
  },
  headerRight: {
    width: 40,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  monthBtn: {
    padding: 8,
  },
  monthDisplay: {
    alignItems: 'center',
    marginHorizontal: 24,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  yearText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: COLORS.primary + '10',
  },
  userName: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  recordLeft: {
    marginRight: 12,
  },
  dateBadge: {
    width: 48,
    height: 56,
    borderRadius: 8,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  dateMonth: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  recordMiddle: {
    flex: 1,
  },
  recordTime: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  recordDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  recordRight: {},
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
});
