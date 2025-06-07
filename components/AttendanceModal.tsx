import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '@/contexts/ThemeContext';
import { Attendance } from '@/types';

interface AttendanceModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (absences: Attendance[]) => void;
  currentAbsences: Attendance[];
  month: number;
  year: number;
}

export function AttendanceModal({
  visible,
  onClose,
  onSave,
  currentAbsences,
  month,
  year
}: AttendanceModalProps) {
  const { colors, isDark } = useTheme();
  const [selectedDates, setSelectedDates] = useState<{[key: string]: any}>(
    currentAbsences.reduce((acc, curr) => ({
      ...acc,
      [curr.date]: { selected: true, selectedColor: colors.error }
    }), {})
  );

  const handleDayPress = (day: any) => {
    const selected = selectedDates[day.dateString];
    if (selected) {
      const newDates = { ...selectedDates };
      delete newDates[day.dateString];
      setSelectedDates(newDates);
    } else {
      setSelectedDates({
        ...selectedDates,
        [day.dateString]: { selected: true, selectedColor: colors.error }
      });
    }
  };

  const handleSave = () => {
    const absences: Attendance[] = Object.keys(selectedDates).map(date => ({
      date,
      isAbsent: true
    }));
    onSave(absences);
    onClose();
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          İşe Gidilmeyen Günler
        </Text>
        
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Lütfen işe gitmediğiniz günleri seçin
        </Text>

        <Calendar
          current={`${year}-${String(month + 1).padStart(2, '0')}-01`}
          minDate={`${year}-${String(month + 1).padStart(2, '0')}-01`}
          maxDate={`${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`}
          onDayPress={handleDayPress}
          markedDates={selectedDates}
          theme={{
            backgroundColor: colors.background,
            calendarBackground: colors.background,
            textSectionTitleColor: colors.textSecondary,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: '#ffffff',
            todayTextColor: colors.primary,
            dayTextColor: colors.text,
            textDisabledColor: colors.textSecondary + '50',
            monthTextColor: colors.text,
            arrowColor: colors.primary,
          }}
        />

        <View style={styles.summary}>
          <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
            Seçilen gün sayısı: {Object.keys(selectedDates).length}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="İptal"
            onPress={onClose}
            variant="outline"
            style={styles.button}
          />
          <Button
            title="Kaydet"
            onPress={handleSave}
            style={styles.button}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  summary: {
    marginTop: 20,
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    flex: 1,
  },
}); 