import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export type ListItemProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
};

export function ListItem({ icon, title, subtitle, onPress, right }: ListItemProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card }}>
      {icon ? (
        <Ionicons name={icon} size={22} color={colors.textSecondary} style={{ marginRight: 12 }} />
      ) : (
        <View style={{ width: 22, marginRight: 12 }} />
      )}
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>{title}</Text>
        {subtitle ? <Text style={{ color: colors.textSecondary, marginTop: 2 }}>{subtitle}</Text> : null}
      </View>
      {right ?? <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
    </TouchableOpacity>
  );
}