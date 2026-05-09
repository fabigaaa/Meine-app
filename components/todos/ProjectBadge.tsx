import { View, Text, StyleSheet } from 'react-native';
import { TodoProject } from '@/types/todo';

interface ProjectBadgeProps {
  project: TodoProject;
  small?: boolean;
}

export function ProjectBadge({ project, small = false }: ProjectBadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: project.color + '22' }]}>
      <View style={[styles.dot, { backgroundColor: project.color }]} />
      <Text style={[styles.name, { color: project.color }, small && styles.nameSmall]}>
        {project.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  name: { fontSize: 12, fontWeight: '500' },
  nameSmall: { fontSize: 11 },
});
