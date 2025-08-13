import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { colors } from '../../../src/theme/colors';
import { Section } from '../../../src/components/Section';
import { ListItem } from '../../../src/components/ListItem';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function WorkoutLauncher() {
  const router = useRouter();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={{ padding: 16 }}>
        <View style={{ backgroundColor: colors.surfaceAlt, borderColor: colors.divider, borderWidth: 1, borderRadius: 12, padding: 16 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 6 }}>Experience Pro</Text>
          <Text style={{ color: colors.textSecondary, marginBottom: 12 }}>Unlock advanced analytics and programs. $4.99/mo</Text>
          <View style={{ alignSelf: 'flex-start', backgroundColor: colors.accent, borderRadius: 8 }}>
            <Text style={{ color: 'white', paddingHorizontal: 12, paddingVertical: 8 }}>Learn More</Text>
          </View>
        </View>
      </View>

      <Section title="Start Workout">
        <ListItem
          icon="add-circle-outline"
          title="Blank Workout"
          subtitle="Start with no prefilled exercises"
          onPress={() => router.push('/workout/logger')}
        />
        <View style={{ height: 1, backgroundColor: colors.divider }} />
        <ListItem
          icon="refresh-outline"
          title="Repeat Workout"
          subtitle="Pick a past session to repeat"
          onPress={() => router.push('/workout/repeat')}
        />
        <View style={{ height: 1, backgroundColor: colors.divider }} />
        <ListItem
          icon="document-text-outline"
          title="From Template"
          subtitle="Start from a saved template"
          onPress={() => router.push('/templates')}
        />
      </Section>

      <Section title="Programs">
        <ListItem
          icon="albums-outline"
          title="Workout Programs"
          subtitle="Create and manage training blocks"
          onPress={() => router.push('/templates')}
        />
        <View style={{ height: 1, backgroundColor: colors.divider }} />
        <ListItem
          icon="copy-outline"
          title="Workout Templates"
          subtitle="Create and organize templates"
          onPress={() => router.push('/templates')}
        />
      </Section>
    </ScrollView>
  );
}