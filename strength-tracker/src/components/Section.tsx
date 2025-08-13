import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../theme/colors';

export function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 18 }}>
      {title ? (
        <Text style={{ color: colors.textSecondary, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginLeft: 16 }}>
          {title}
        </Text>
      ) : null}
      <View style={{ backgroundColor: colors.card, borderTopColor: colors.divider, borderTopWidth: 1, borderBottomColor: colors.divider, borderBottomWidth: 1 }}>
        {children}
      </View>
    </View>
  );
}